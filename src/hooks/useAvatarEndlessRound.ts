"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadTalents, type Talent } from "@/lib/talents";
import { useGameMachine } from "@/hooks/useGameMachine";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  fetchAvatarAreas,
  fetchAvatarTalents,
  getAvatarTalentPool,
  pickRandomAvatarTalent,
} from "@/lib/avatar-api";
import {
  isValidEndlessPersisted,
  isValidEndlessRoundState,
  type EndlessPersisted,
  type EndlessRoundState,
} from "@/components/avatar/types";

export const MAX_GUESSES = 5;
const ROUND_KEY = "holodle-avatar-endless-round";
const STATS_KEY = "holodle-avatar-endless-stats";

const emptyRound: EndlessRoundState = { round: null, guesses: [], gameOver: false, won: false };
const emptyPersisted: EndlessPersisted = {
  stats: { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 },
  recentTalentIds: [],
  lastRunStreak: 0,
};

export type RoundStatus = "loading" | "ready" | "noValid" | "error";

export function useAvatarEndlessRound() {
  const [roundState, setRoundState] = useLocalStorageState<EndlessRoundState>(
    ROUND_KEY,
    emptyRound,
    isValidEndlessRoundState
  );
  const [persisted, setPersisted] = useLocalStorageState<EndlessPersisted>(
    STATS_KEY,
    emptyPersisted,
    isValidEndlessPersisted
  );
  const [roundStatus, setRoundStatus] = useState<RoundStatus>(
    roundState.round ? "ready" : "loading"
  );
  const [roundError, setRoundError] = useState("");
  const [validTalents, setValidTalents] = useState<Talent[]>([]);
  const hasStoredRoundRef = useRef(Boolean(roundState.round));
  const recentTalentIdsRef = useRef(persisted.recentTalentIds);

  const pool = useMemo(() => {
    const round = roundState.round;
    if (!round) return validTalents;
    return validTalents.some((t) => t.id === round.talent.id)
      ? validTalents
      : [...validTalents, round.talent];
  }, [validTalents, roundState.round]);

  const startRound = useCallback(
    async (talentPool: Talent[], avoid: string[]) => {
      setRoundStatus("loading");
      setRoundError("");

      if (talentPool.length === 0) {
        setRoundStatus("noValid");
        return null;
      }

      try {
        const talent = pickRandomAvatarTalent(talentPool, avoid);
        if (!talent) {
          setRoundStatus("noValid");
          return null;
        }
        const areas = await fetchAvatarAreas(talent.id);
        const round = { talent, areas };
        setRoundState({ round, guesses: [], gameOver: false, won: false });
        setPersisted((prev) => ({
          ...prev,
          recentTalentIds: [...prev.recentTalentIds, talent.id].slice(-20),
        }));
        setRoundStatus("ready");
        return round;
      } catch (e) {
        setRoundError(e instanceof Error ? e.message : "Failed to load round");
        setRoundStatus("error");
        return null;
      }
    },
    [setRoundState, setPersisted]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [talents, avatarTalents] = await Promise.all([
          loadTalents(),
          fetchAvatarTalents(),
        ]);
        if (!alive) return;

        const playableTalents = getAvatarTalentPool(avatarTalents, talents);
        setValidTalents(playableTalents);

        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        await startRound(playableTalents, recentTalentIdsRef.current);
      } catch {
        if (!alive) return;

        setValidTalents([]);
        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        setRoundStatus("error");
        setRoundError("Failed to load avatar talents");
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, [startRound]);

  const makeGuess = useCallback(
    (talent: Talent) => {
      const { round } = roundState;
      if (!round || roundState.gameOver) return false;
      if (roundState.guesses.some((g) => g.talent.id === talent.id)) return false;
      const correct = talent.id === round.talent.id;
      const newGuesses = [...roundState.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      setRoundState({ ...roundState, guesses: newGuesses, gameOver, won: correct });
      if (gameOver) {
        setPersisted((prev) => ({
          ...prev,
          stats: {
            streak: correct ? prev.stats.streak + 1 : 0,
            bestStreak: correct
              ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
              : prev.stats.bestStreak,
            totalPlayed: prev.stats.totalPlayed + 1,
            totalWon: correct ? prev.stats.totalWon + 1 : prev.stats.totalWon,
          },
          lastRunStreak: correct ? prev.stats.streak + 1 : prev.stats.streak,
        }));
      }
      return true;
    },
    [roundState, setRoundState, setPersisted]
  );

  const nextRound = useCallback(async () => {
    const finishedId = roundState.round?.talent.id;
    const avoid = finishedId
      ? [...persisted.recentTalentIds, finishedId]
      : persisted.recentTalentIds;
    await startRound(pool, avoid);
  }, [pool, persisted.recentTalentIds, roundState.round, startRound]);

  const { round, guesses } = roundState;
  const status = useGameMachine({
    loading: roundStatus === "loading",
    error: roundStatus === "error" ? roundError : "",
    empty: roundStatus === "noValid",
    gameOver: roundState.gameOver,
    won: roundState.won,
  });
  const guessesLeft = MAX_GUESSES - guesses.length;
  const alreadyGuessed = guesses.map((g) => g.talent.name);
  const revealedCount = round ? Math.min(guesses.length + 1, round.areas.length) : 0;
  const displayGuessHistory = [...guesses].reverse();

  return {
    roundState,
    persisted,
    roundStatus,
    roundError,
    pool,
    status,
    guessesLeft,
    alreadyGuessed,
    revealedCount,
    displayGuessHistory,
    startRound,
    makeGuess,
    nextRound,
  };
}

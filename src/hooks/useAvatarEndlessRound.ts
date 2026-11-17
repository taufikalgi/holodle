"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Talent } from "@/lib/talents";
import { deriveAvatarStatus } from "@/lib/game-status";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useAvatarTalentPool } from "@/hooks/useAvatarTalentPool";
import {
  fetchAvatarAreas,
  pickRandomAvatarTalent,
} from "@/lib/avatar-api";
import {
  isValidEndlessPersisted,
  isValidEndlessRoundState,
  type EndlessPersisted,
  type EndlessRoundState,
  type RoundStatus,
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
  const hasStoredRound = Boolean(roundState.round);
  const { validTalents, poolStatus, poolError, retry: retryPool } = useAvatarTalentPool();
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
    if (hasStoredRound) return;
    if (poolStatus === "ready") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pool loader effect kicks off the async round fetch
      void startRound(validTalents, recentTalentIdsRef.current);
    }
  }, [hasStoredRound, poolStatus, validTalents, startRound]);

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

  const retry = useCallback(() => {
    if (poolStatus === "error" || validTalents.length === 0) {
      retryPool();
      return;
    }
    const finishedId = roundState.round?.talent.id;
    const avoid = finishedId
      ? [...persisted.recentTalentIds, finishedId]
      : persisted.recentTalentIds;
    void startRound(validTalents, avoid);
  }, [poolStatus, retryPool, startRound, validTalents, persisted.recentTalentIds, roundState.round]);

  const { guesses } = roundState;
  const poolFailed = !hasStoredRound && poolStatus === "error";
  const resolvedRoundStatus: RoundStatus =
    poolFailed && roundStatus === "loading" ? "error" : roundStatus;
  const resolvedRoundError =
    poolFailed && resolvedRoundStatus === "error" ? poolError : roundError;
  const status = deriveAvatarStatus(resolvedRoundStatus, roundState.gameOver, roundState.won);
  const guessesLeft = MAX_GUESSES - guesses.length;

  return {
    roundState,
    persisted,
    roundStatus: resolvedRoundStatus,
    roundError: resolvedRoundError,
    pool,
    status,
    guessesLeft,
    retry,
    makeGuess,
    nextRound,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDateString, loadTalents, type Talent } from "@/lib/talents";
import { emitAppEvent } from "@/lib/events";
import { deriveAvatarStatus, type GameStatus } from "@/lib/game-status";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  fetchAvatarAreas,
  fetchAvatarTalents,
  getAvatarTalentOfTheDay,
  getAvatarTalentPool,
} from "@/lib/avatar-api";
import { isValidDailyState, type DailyState } from "@/components/avatar/types";
import type { DailyStreakStats } from "@/lib/daily-streak";
import { useDailyStreak } from "@/hooks/useDailyStreak";

export const MAX_GUESSES = 5;
const ROUND_KEY = "holodle-avatar-round";
const STATS_KEY = "holodle-avatar-stats";

const emptyRound: DailyState = {
  talent: null,
  areas: [],
  guesses: [],
  gameOver: false,
  won: false,
  date: getDateString(),
};

const emptyStats: DailyStreakStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0, lastPlayedDate: undefined };

export type RoundStatus = "loading" | "ready" | "noValid" | "error";

export function useAvatarDailyRound() {
  const [state, setState] = useLocalStorageState<DailyState>(ROUND_KEY, emptyRound, (d) =>
    isValidDailyState(d, getDateString())
  );
  const { stats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver } =
    useDailyStreak(STATS_KEY, emptyStats);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>(state.talent ? "ready" : "loading");
  const [roundError, setRoundError] = useState("");
  const [validTalents, setValidTalents] = useState<Talent[]>([]);
  const hasStoredRoundRef = useRef(Boolean(state.talent));

  const searchPool = useMemo(() => {
    const talent = state.talent;
    if (!talent) return validTalents;
    return validTalents.some((t) => t.id === talent.id) ? validTalents : [...validTalents, talent];
  }, [validTalents, state.talent]);

  const loadRound = useCallback(
    async (pool: Talent[]) => {
      setRoundStatus("loading");
      setRoundError("");

      if (pool.length === 0) {
        setRoundStatus("noValid");
        return;
      }

      const roundTalent = getAvatarTalentOfTheDay(pool, getDateString());
      if (!roundTalent) {
        setRoundStatus("noValid");
        return;
      }

      try {
        const areas = await fetchAvatarAreas(roundTalent.id);
        setState((prev) =>
          prev.talent
            ? prev
            : {
                talent: roundTalent,
                areas,
                guesses: [],
                gameOver: false,
                won: false,
                date: getDateString(),
              }
        );
        setRoundStatus("ready");
      } catch (e) {
        setRoundError(e instanceof Error ? e.message : "Failed to load round");
        setRoundStatus("error");
      }
    },
    [setState]
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

        const pool = getAvatarTalentPool(avatarTalents, talents);
        setValidTalents(pool);

        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        await loadRound(pool);
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
  }, [loadRound]);

  const guessesLeft = MAX_GUESSES - state.guesses.length;
  const status: GameStatus = deriveAvatarStatus(roundStatus, state.gameOver, state.won);
  const alreadyGuessed = state.guesses.map((g) => g.talent.name);
  const revealedCount = state.talent ? Math.min(state.guesses.length + 1, state.areas.length) : 0;
  const displayGuessHistory = [...state.guesses].reverse();

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver || !state.talent) return false;
      if (state.guesses.some((g) => g.talent.id === talent.id)) return false;
      const correct = talent.id === state.talent.id;
      const newGuesses = [...state.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      setState({
        ...state,
        guesses: newGuesses,
        gameOver,
        won: correct,
        date: getDateString(),
      });
      if (gameOver) {
        const today = getDateString();
        recordDailyGameOver(today, correct);
        emitAppEvent("holodle:game-over", { mode: "avatar", won: correct, date: today });
      }
      return true;
    },
    [state, setState, recordDailyGameOver]
  );

  return {
    state,
    status,
    roundStatus,
    roundError,
    validTalents,
    searchPool,
    guessesLeft,
    alreadyGuessed,
    revealedCount,
    displayGuessHistory,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    loadRound,
    makeGuess,
  };
}

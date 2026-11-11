"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDateString, type Talent } from "@/lib/talents";
import { emitAppEvent } from "@/lib/events";
import { deriveAvatarStatus } from "@/lib/game-status";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useAvatarTalentPool } from "@/hooks/useAvatarTalentPool";
import { fetchAvatarAreas, getAvatarTalentOfTheDay } from "@/lib/avatar-api";
import {
  isValidDailyState,
  type DailyState,
  type RoundStatus,
} from "@/components/avatar/types";
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

export function useAvatarDailyRound() {
  const [state, setState] = useLocalStorageState<DailyState>(ROUND_KEY, emptyRound, (d) =>
    isValidDailyState(d, getDateString())
  );
  const { stats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver } =
    useDailyStreak(STATS_KEY, emptyStats);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>(state.talent ? "ready" : "loading");
  const [roundError, setRoundError] = useState("");
  const hasStoredRound = Boolean(state.talent);
  const { validTalents, poolStatus, poolError, retry: retryPool } = useAvatarTalentPool();

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

  const retry = useCallback(() => {
    if (poolStatus === "error") {
      retryPool();
      return;
    }
    void loadRound(validTalents);
  }, [poolStatus, retryPool, loadRound, validTalents]);

  useEffect(() => {
    if (hasStoredRound) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pool loader effect kicks off the async round fetch
    if (poolStatus === "ready") void loadRound(validTalents);
  }, [hasStoredRound, poolStatus, validTalents, loadRound]);

  const poolFailed = !hasStoredRound && poolStatus === "error";
  const resolvedRoundStatus: RoundStatus =
    poolFailed && roundStatus === "loading" ? "error" : roundStatus;
  const resolvedRoundError =
    poolFailed && resolvedRoundStatus === "error" ? poolError : roundError;

  const guessesLeft = MAX_GUESSES - state.guesses.length;
  const status = deriveAvatarStatus(resolvedRoundStatus, state.gameOver, state.won);

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
    roundStatus: resolvedRoundStatus,
    roundError: resolvedRoundError,
    searchPool,
    guessesLeft,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    retry,
    makeGuess,
  };
}

"use client";

import { useCallback } from "react";
import {
  getTalentOfTheDay,
  getDateString,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import { applyClassicGuess, isStoredClassicGuess } from "@/lib/game-status";
import { useGameMachine } from "@/hooks/useGameMachine";
import { useTalents } from "@/hooks/useTalents";
import { emitAppEvent } from "@/lib/events";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import type { DailyStreakStats } from "@/lib/daily-streak";
import { useDailyStreak } from "@/hooks/useDailyStreak";

export const MAX_GUESSES = 6;
const STORAGE_KEY = "holodle-classic-state";
const STATS_STORAGE_KEY = "holodle-classic-stats";

export interface GameState {
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

export type GameStats = DailyStreakStats;

function isValidGameState(data: unknown): data is GameState {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  return (
    Array.isArray(c.guesses) &&
    c.guesses.every(isStoredClassicGuess) &&
    typeof c.gameOver === "boolean" &&
    typeof c.won === "boolean" &&
    typeof c.date === "string" &&
    c.date === getDateString()
  );
}

const emptyState: GameState = { guesses: [], gameOver: false, won: false, date: getDateString() };
const emptyStats: GameStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0, lastPlayedDate: undefined };

export function useClassicDaily() {
  const [state, setState] = useLocalStorageState<GameState>(STORAGE_KEY, emptyState, isValidGameState);
  const { stats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver } =
    useDailyStreak(STATS_STORAGE_KEY, emptyStats);
  const { talents, loading: talentsLoading, error: talentsError } = useTalents();
  const todayAnswer = talents ? getTalentOfTheDay(talents) : null;
  const status = useGameMachine({
    loading: talentsLoading,
    error: talentsError,
    empty: !talents || talents.length === 0 || !todayAnswer,
    gameOver: state.gameOver,
    won: state.won,
  });
  const guessesLeft = MAX_GUESSES - state.guesses.length;
  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver || !todayAnswer) return false;
      const transition = applyClassicGuess(state.guesses, talent, todayAnswer, MAX_GUESSES);
      if (!transition) return false;
      const newState: GameState = { ...transition, date: getDateString() };
      setState(newState);
      if (transition.gameOver) {
        const today = getDateString();
        recordDailyGameOver(today, transition.won);
        emitAppEvent("holodle:game-over", { mode: "classic", won: transition.won, date: today });
      }
      return true;
    },
    [state, todayAnswer, setState, recordDailyGameOver]
  );

  return {
    state,
    talents,
    todayAnswer,
    status,
    talentsError,
    guessesLeft,
    alreadyGuessed,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    makeGuess,
  };
}

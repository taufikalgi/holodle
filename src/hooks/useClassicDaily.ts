"use client";

import { useCallback } from "react";
import {
  getTalentOfTheDay,
  getDateString,
  compareTalents,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
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
  const todayAnswer = getTalentOfTheDay();
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver) return false;
      if (state.guesses.some((g) => g.talent.name === talent.name)) return false;
      const result = compareTalents(talent, todayAnswer);
      const won = talent.name === todayAnswer.name;
      const newGuesses = [...state.guesses, { talent, result }];
      const gameOver = won || newGuesses.length >= MAX_GUESSES;
      const newState: GameState = { guesses: newGuesses, gameOver, won, date: getDateString() };
      setState(newState);
      if (gameOver) {
        recordDailyGameOver(getDateString(), won);
      }
      return true;
    },
    [state, todayAnswer, setState, recordDailyGameOver]
  );

  return {
    state,
    todayAnswer,
    guessesLeft,
    alreadyGuessed,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    makeGuess,
  };
}

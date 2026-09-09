"use client";

import { useCallback, useMemo } from "react";
import {
  filterTalentsByBranch,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import { applyClassicGuess, isStoredClassicGuess } from "@/lib/game-status";
import { useGameMachine } from "@/hooks/useGameMachine";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

export const MAX_GUESSES = 6;

export interface EndlessState {
  current: {
    answer: Talent;
    guesses: { talent: Talent; result: CompareResult }[];
    gameOver: boolean;
    won: boolean;
  };
  stats: {
    streak: number;
    bestStreak: number;
    totalPlayed: number;
    totalWon: number;
  };
  lastRunStreak: number;
  recentTalents: string[];
}

export function isValidEndlessState(data: unknown): data is EndlessState {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  const curr = c.current as Record<string, unknown> | undefined;
  const st = c.stats as Record<string, unknown> | undefined;
  return (
    typeof curr === "object" && curr !== null &&
    typeof curr.answer === "object" && curr.answer !== null &&
    Array.isArray(curr.guesses) &&
    curr.guesses.every(isStoredClassicGuess) &&
    typeof curr.gameOver === "boolean" &&
    typeof curr.won === "boolean" &&
    typeof st === "object" && st !== null &&
    typeof st.streak === "number" &&
    typeof st.bestStreak === "number" &&
    typeof st.totalPlayed === "number" &&
    typeof st.totalWon === "number" &&
    typeof c.lastRunStreak === "number" &&
    Array.isArray(c.recentTalents) &&
    c.recentTalents.every((t: unknown) => typeof t === "string")
  );
}

export function getRandomTalent(pool: Talent[], excludeIds: string[] = []): Talent {
  const filtered = pool.filter((t) => !excludeIds.includes(t.id));
  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function getInitialState(pool: Talent[]): EndlessState {
  const answer = getRandomTalent(pool, []);
  return {
    current: { answer, guesses: [], gameOver: false, won: false },
    stats: { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 },
    lastRunStreak: 0,
    recentTalents: [answer.name],
  };
}

export function useEndlessClassic(
  storageKey: string,
  talents: Talent[],
  selectedBranches: string[] | null
) {
  const branchKey = selectedBranches?.join(",");
  const pool = useMemo(
    () =>
      selectedBranches
        ? filterTalentsByBranch(talents, selectedBranches)
        : talents,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- branchKey carries the branch dep; selectedBranches array identity churns
    [branchKey, talents]
  );

  const [state, setState] = useLocalStorageState<EndlessState>(
    storageKey,
    getInitialState(pool),
    isValidEndlessState
  );

  const { current } = state;
  const status = useGameMachine({
    loading: false,
    error: "",
    empty: pool.length === 0,
    gameOver: current.gameOver,
    won: current.won,
  });
  const guessesLeft = MAX_GUESSES - current.guesses.length;
  const alreadyGuessed = current.guesses.map((g) => g.talent.name);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (current.gameOver) return false;
      const transition = applyClassicGuess(current.guesses, talent, current.answer, MAX_GUESSES);
      if (!transition) return false;
      const { guesses: newGuesses, gameOver, won } = transition;

      setState((prev) => ({
        ...prev,
        current: { ...prev.current, guesses: newGuesses, gameOver, won },
        lastRunStreak: gameOver ? (won ? prev.stats.streak + 1 : prev.stats.streak) : prev.lastRunStreak,
        stats: gameOver
          ? {
              streak: won ? prev.stats.streak + 1 : 0,
              bestStreak: won
                ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
                : prev.stats.bestStreak,
              totalPlayed: prev.stats.totalPlayed + 1,
              totalWon: prev.stats.totalWon + (won ? 1 : 0),
            }
          : prev.stats,
      }));
      return true;
    },
    [current, setState]
  );

  function nextRound() {
    const next = getRandomTalent(pool, state.recentTalents);
    setState((prev) => ({
      ...prev,
      current: { answer: next, guesses: [], gameOver: false, won: false },
      recentTalents: [...prev.recentTalents, next.name].slice(-20),
    }));
  }

  return {
    pool, state, status, guessesLeft, alreadyGuessed,
    makeGuess, nextRound,
  };
}

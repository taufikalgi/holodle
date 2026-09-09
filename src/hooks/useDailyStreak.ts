"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { getDateString } from "@/lib/talents";
import {
  computeDailyStreakOnGameOver,
  isValidDailyStreakStats,
  shouldResetDailyStreakForMissedDay,
  type DailyStreakStats,
} from "@/lib/daily-streak";

export function useDailyStreak(storageKey: string, emptyStats: DailyStreakStats) {
  const [stats, setStats] = useLocalStorageState<DailyStreakStats>(
    storageKey,
    emptyStats,
    isValidDailyStreakStats
  );
  const [streakResetToast, setStreakResetToast] = useState(false);

  useEffect(() => {
    const today = getDateString();
    if (shouldResetDailyStreakForMissedDay(stats.lastPlayedDate, today, stats.streak)) {
      setStats((prev) => ({ ...prev, streak: 0 }));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- wall-clock + localStorage sync; self-stable since reset writes streak 0
      setStreakResetToast(true);
    }
  }, [storageKey, stats.lastPlayedDate, stats.streak]); // re-evaluate when the key or outcome changes; stable: reset writes streak 0, after which shouldResetDailyStreakForMissedDay(..., 0) is false

  const dismissStreakResetPopup = () => setStreakResetToast(false);

  const recordDailyGameOver = (today: string, won: boolean) => {
    setStats((prev) => {
      const next = computeDailyStreakOnGameOver(prev, today, won);
      return {
        ...prev,
        streak: next.streak,
        bestStreak: next.bestStreak,
        totalPlayed: prev.totalPlayed + 1,
        totalWon: won ? prev.totalWon + 1 : prev.totalWon,
        lastPlayedDate: next.lastPlayedDate,
      };
    });
  };

  return { stats, setStats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver };
}

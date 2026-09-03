// src/lib/daily-streak.ts — daily-mode only; endless streak intentionally separate
export const DAILY_STREAK_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type DailyStreakStats = {
  streak: number;
  bestStreak: number;
  totalPlayed: number;
  totalWon: number;
  lastPlayedDate?: string; // YYYY-MM-DD of last completed daily game (win or loss)
};

export function isValidDailyStreakStats(data: unknown): data is DailyStreakStats {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  return (
    typeof c.streak === "number" &&
    typeof c.bestStreak === "number" &&
    typeof c.totalPlayed === "number" &&
    typeof c.totalWon === "number" &&
    (c.lastPlayedDate === undefined ||
      (typeof c.lastPlayedDate === "string" && DAILY_STREAK_DATE_RE.test(c.lastPlayedDate)))
  );
}

export function isValidDailyStreakDateString(s: string): boolean {
  if (!DAILY_STREAK_DATE_RE.test(s)) return false;
  const d = parseDailyStreakDateString(s);
  return d !== null && formatDailyStreakDate(d) === s;
}

export function parseDailyStreakDateString(s: string): Date | null {
  if (!DAILY_STREAK_DATE_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function formatDailyStreakDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetweenDailyStreakDates(a: string, b: string): number | null {
  const da = parseDailyStreakDateString(a);
  const db = parseDailyStreakDateString(b);
  if (!da || !db) return null;
  const utcA = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const utcB = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((utcB - utcA) / 86400000);
}

export function isConsecutiveDailyStreakDay(
  lastPlayedDate: string | undefined,
  today: string
): boolean {
  if (!lastPlayedDate) return false;
  return daysBetweenDailyStreakDates(lastPlayedDate, today) === 1;
}

export function shouldResetDailyStreakForMissedDay(
  lastPlayedDate: string | undefined,
  today: string,
  currentStreak: number
): boolean {
  if (currentStreak === 0) return false;
  if (!lastPlayedDate) return false; // migrated users: don't punish retroactively
  const diff = daysBetweenDailyStreakDates(lastPlayedDate, today);
  if (diff === null) return false;
  return diff > 1;
}

export function computeDailyStreakOnGameOver(
  prev: DailyStreakStats,
  today: string,
  won: boolean
): { streak: number; bestStreak: number; lastPlayedDate: string } {
  const last = prev.lastPlayedDate;
  const diff = last ? daysBetweenDailyStreakDates(last, today) : null;
  let nextStreak: number;
  if (!won) {
    nextStreak = 0;
  } else if (diff === null || diff > 1) {
    // first ever win, or win after missing 1+ days -> start new streak at 1
    nextStreak = 1;
  } else if (diff === 1) {
    nextStreak = prev.streak + 1;
  } else if (diff === 0) {
    // same-day replay guard (should not happen for daily) — keep or increment once
    nextStreak = prev.streak === 0 ? 1 : prev.streak;
  } else {
    // diff <0 (clock skew) — treat as 1
    nextStreak = 1;
  }
  return {
    streak: nextStreak,
    bestStreak: won ? Math.max(prev.bestStreak, nextStreak) : prev.bestStreak,
    lastPlayedDate: today,
  };
}

import type { GuessEntry, SessionHistoryState } from "@/components/competitive-classic/types";

export const HISTORY_KEY_PREFIX = "competitive-classic-history:";

export function getEmptySessionHistoryState(): SessionHistoryState {
  return {
    currentRound: [],
    previousRounds: [],
  };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/** Corrupt entries are dropped so one bad write never kills history. */
function isHistoryEntry(x: unknown): x is GuessEntry {
  return (
    isRecord(x) &&
    isRecord(x.talent) &&
    typeof x.talent.id === "string" &&
    typeof x.talent.name === "string" &&
    typeof x.correct === "boolean"
  );
}

function cleanRounds(rounds: unknown): GuessEntry[][] {
  if (!Array.isArray(rounds)) return [];
  return rounds
    .filter(Array.isArray)
    .map((round) => round.filter(isHistoryEntry));
}

export function getStoredHistoryState(sessionId: string): SessionHistoryState {
  if (typeof window === "undefined") return getEmptySessionHistoryState();
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${sessionId}`);
    if (!raw) return getEmptySessionHistoryState();
    const parsed = JSON.parse(raw) as SessionHistoryState | GuessEntry[];
    if (Array.isArray(parsed)) {
      return {
        currentRound: parsed.filter(isHistoryEntry),
        previousRounds: [],
      };
    }
    if (parsed && Array.isArray(parsed.currentRound) && Array.isArray(parsed.previousRounds)) {
      return {
        currentRound: parsed.currentRound.filter(isHistoryEntry),
        previousRounds: cleanRounds(parsed.previousRounds),
      };
    }
    return getEmptySessionHistoryState();
  } catch {
    return getEmptySessionHistoryState();
  }
}

export function setStoredHistoryState(sessionId: string, history: SessionHistoryState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${HISTORY_KEY_PREFIX}${sessionId}`, JSON.stringify(history));
}

export function clearStoredHistory(sessionId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${HISTORY_KEY_PREFIX}${sessionId}`);
}

/** Removes all per-session competitive history (user-scoped; safe to drop on logout). */
export function clearAllCompetitiveHistory(): void {
  if (typeof window === "undefined") return;
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(HISTORY_KEY_PREFIX)) doomed.push(key);
  }
  doomed.forEach((key) => localStorage.removeItem(key));
}

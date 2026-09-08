import { ApiError } from "@/lib/errors";
import {
  authedJson as sharedAuthedJson,
  googleAuthUrl,
} from "@/lib/api-client";
import type { AuthUser, GameSession, GuessEntry, SessionHistoryState } from "./types";

const AUTH_REDIRECT_KEY = "auth_redirect_to";
const HISTORY_KEY_PREFIX = "competitive-classic-history:";

export { normalizeTalent } from "@/lib/talents";

export function getEmptySessionHistoryState(): SessionHistoryState {
  return {
    currentRound: [],
    previousRounds: [],
  };
}

export function getStoredHistoryState(sessionId: string): SessionHistoryState {
  if (typeof window === "undefined") return getEmptySessionHistoryState();
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${sessionId}`);
    if (!raw) return getEmptySessionHistoryState();
    const parsed = JSON.parse(raw) as SessionHistoryState | GuessEntry[];
    if (Array.isArray(parsed)) {
      return {
        currentRound: parsed,
        previousRounds: [],
      };
    }
    if (parsed && Array.isArray(parsed.currentRound) && Array.isArray(parsed.previousRounds)) {
      return {
        currentRound: parsed.currentRound,
        previousRounds: parsed.previousRounds,
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

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d ?? 1);
}

export function getMondayDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toMonthString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatTimer(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function redirectToLogin(path?: string) {
  if (typeof window === "undefined") return;
  const validPaths = new Set([
    "/",
    "/login",
    "/classic/competitive",
    "/classic/daily",
    "/classic/endless",
    "/avatar/daily",
    "/avatar/endless",
    "/admin",
  ]);
  const redirectPath = path && validPaths.has(path) ? path : "/classic/competitive";
  sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
  window.location.href = googleAuthUrl();
}

export async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await sharedAuthedJson<T>(path, { ...init, credentials: "include" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      localStorage.removeItem("token");
      redirectToLogin();
    }
    throw err;
  }
}

/** Single deterministic UI state for the competitive session flow. */
export type SessionStatus =
  | "loading"
  | "locked"
  | "idle"
  | "active"
  | "submitting"
  | "ended"
  | "expired"
  | "error";

export function getSessionStatus(args: {
  user: AuthUser | null;
  loading: boolean;
  session: GameSession | null;
  ended: boolean;
  expired: boolean;
  submitting: boolean;
  error: string;
}): SessionStatus {
  if (args.loading) return "loading";
  if (!args.user) return "locked";
  if (args.error && !args.session) return "error";
  if (!args.session) return "idle";
  if (args.ended) return args.expired ? "expired" : "ended";
  if (args.submitting) return "submitting";
  return "active";
}

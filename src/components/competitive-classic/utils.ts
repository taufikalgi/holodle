import { googleAuthUrl } from "@/lib/api-client";
import { AUTH_REDIRECT_KEY, getAuthRedirectTarget } from "@/lib/auth-redirect";
import type { AuthUser, GameSession } from "./types";

export { normalizeTalent } from "@/lib/talents";

export {
  getEmptySessionHistoryState,
  getStoredHistoryState,
  setStoredHistoryState,
  clearStoredHistory,
} from "@/lib/session-history";

export function getMondayDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
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
  sessionStorage.setItem(AUTH_REDIRECT_KEY, getAuthRedirectTarget(path));
  window.location.href = googleAuthUrl();
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

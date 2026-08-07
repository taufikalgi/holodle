import { ApiError } from "@/lib/errors";
import { getToken } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/app/api/apiEndpoints";
import type { SessionHistoryState, GuessEntry, ApiResponse } from "./types";

const AUTH_REDIRECT_KEY = "auth_redirect_to";
const HISTORY_KEY_PREFIX = "giveaway-vsi-history:";

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

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, "/giveaway-vsi");
  window.location.href = API_ENDPOINTS.googleAuthUrl;
}

export async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_ENDPOINTS.apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    redirectToLogin();
    throw new ApiError("Unauthorized", 401);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok) {
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status);
  }

  if (!json || json.success === false) {
    throw new ApiError(json?.message ?? "Request failed", res.status);
  }

  return json.data;
}

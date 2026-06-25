import { ApiError } from "@/lib/errors";
import { getToken } from "@/hooks/useAdminAuth";
import { API_ENDPOINTS } from "@/app/api/apiEndpoints";
import type { ApiTalent, TalentChoice, SessionHistoryState, GuessEntry, ApiResponse } from "./types";

const AUTH_REDIRECT_KEY = "auth_redirect_to";
const HISTORY_KEY_PREFIX = "giveaway-vsi-history:";

export function normalizeTalent(talent: ApiTalent): TalentChoice {
  return {
    id: talent.id,
    name: talent.name,
    branch: talent.branch,
    debutYear: talent.debut_year,
    loreArchetype: talent.lore_archetype,
    height: talent.height,
    birthMonth: talent.birth_month,
    photoUrl: talent.image_url,
    altNames: talent.alt_names ?? [],
  };
}

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

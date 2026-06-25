"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/ui/Footer";
import GuessRow from "@/components/ui/GuessRow";
import PageHeader from "@/components/ui/PageHeader";
import { Navbar } from "@/components/ui";
import Image from "next/image";
import { API_ENDPOINTS } from "../api/apiEndpoints";
import { getToken } from "@/hooks/useAdminAuth";
import { TalentSearchInput, HowToPlay, ColumnHeaders } from "@/components/ui";
import { ALL_TALENTS, searchTalents } from "@/lib/talents";

const TOKEN_KEY = "token";
const AUTH_REDIRECT_KEY = "auth_redirect_to";
const SESSION_KEY = "giveaway-vsi-session-id";
const HISTORY_KEY_PREFIX = "giveaway-vsi-history:";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

type ApiTalent = {
  id: string;
  name: string;
  branch: string;
  debut_year: number | null;
  lore_archetype: string;
  height: number | null;
  birth_month: string;
  image_url: string;
  alt_names: string[];
};

type TalentChoice = {
  id: string;
  name: string;
  branch: string;
  debutYear: number | null;
  loreArchetype: string;
  height: number | null;
  birthMonth: string;
  photoUrl: string;
  altNames: string[];
};

type SessionSummary = {
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  round_number: number;
};

type GameSession = {
  id: string;
  user_id: string;
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  round_number: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

type ComparisonStatus = "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";

type Comparison = {
  name: "correct" | "wrong";
  branch: "correct" | "wrong";
  debutYear: ComparisonStatus;
  loreArchetype: "correct" | "wrong";
  height: ComparisonStatus;
  birthMonth: ComparisonStatus;
};

type GuessEntry = {
  talent: TalentChoice;
  comparison: Comparison;
  correct: boolean;
  submittedAt: string;
};

type SessionHistoryState = {
  currentRound: GuessEntry[];
  previousRounds: GuessEntry[][];
};

type LeaderboardEntry = {
  session_id: string;
  user_id: string;
  user_name: string;
  user_picture: string;
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  expires_at: string;
  finished_at: string;
  rank: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function normalizeTalent(talent: ApiTalent): TalentChoice {
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

function getEmptySessionHistoryState(): SessionHistoryState {
  return {
    currentRound: [],
    previousRounds: [],
  };
}

function getStoredHistoryState(sessionId: string): SessionHistoryState {
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

function setStoredHistoryState(sessionId: string, history: SessionHistoryState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${HISTORY_KEY_PREFIX}${sessionId}`, JSON.stringify(history));
}

function clearStoredHistory(sessionId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${HISTORY_KEY_PREFIX}${sessionId}`);
}

function formatTimer(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, "/giveaway-vsi");
  window.location.href = API_ENDPOINTS.googleAuthUrl;
}

async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
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
    localStorage.removeItem(TOKEN_KEY);
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

function useGiveawayAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      localStorage.setItem(TOKEN_KEY, decodeURIComponent(hash.slice(7)));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    const expiresAt = Number(payload.exp ?? 0);
    if (Date.now() / 1000 > expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    const userId = String(payload.user_id ?? payload.sub ?? "");
    const email = String(payload.email ?? "");
    const name = email ? email.split("@")[0] : String(payload.name ?? "Player");

    if (!userId || !email) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${userId}/picture`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        setUser({
          id: userId,
          email,
          name,
          picture: json?.data?.picture_url,
        });
      })
      .catch(() => {
        setUser({ id: userId, email, name });
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(() => {
    redirectToLogin();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}

function AuthGate({ onLogin }: { onLogin: () => void }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--holo-bg)" }}
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-5 text-center justify-center"
        style={{ maxWidth: 400, width: "100%", border: "1px solid var(--holo-border)" }}
      >
        <a
          href="/"
          className="text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: "var(--holo-blue)" }}
        >
          ← Back to Home
        </a>
        <PageHeader
          subtitle="Daily Hololive Talent Guessing Game"
          onHowTo={() => {}}
          onLeaderboard={() => {}}
          showHowTo={false}
          showButton={false}
          showLeaderboard={false}
          showLeaderboardButton={false}
        />

        <hr className="w-full" style={{ borderColor: "var(--holo-border)" }} />

        <p className="text-sm" style={{ color: "var(--holo-text-muted)", lineHeight: 1.6 }}>
          Sign in untuk ikut <strong>Giveaway VSI</strong> bang.
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
          style={{
            border: "1.5px solid var(--holo-border)",
            background: "white",
            color: "var(--holo-text)",
            cursor: "pointer",
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09C34.46 3.19 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.09 5.51C12.4 13.67 17.72 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.09 37.01 46.1 31.22 46.1 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.73 28.27A14.5 14.5 0 0 1 9.5 24c0-1.49.26-2.93.73-4.27L3.14 14.22A22.94 22.94 0 0 0 1 24c0 3.61.87 7.02 2.64 10l7.09-5.73z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.52 0 10.15-1.83 13.54-4.97l-7.19-5.59c-1.83 1.23-4.17 1.96-6.35 1.96-6.28 0-11.6-4.17-13.27-9.73l-7.09 5.73C7.07 41.52 14.82 47 24 47z"
      />
    </svg>
  );
}

function HeaderStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div key={label} className="holo-card px-4 py-2 text-center flex-1">
      <div className="text-xl font-black" style={{ color: "var(--holo-blue)" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function TalentSearch({
  talents,
  input,
  onInput,
  onSelect,
  onClear,
  showDropdown,
  dropdownRef,
  inputRef,
  disabled,
}: {
  talents: TalentChoice[];
  input: string;
  onInput: (value: string) => void;
  onSelect: (talent: TalentChoice) => void;
  onClear: () => void;
  showDropdown: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  const suggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];

    return talents
      .filter((talent) => {
        const haystack = [talent.name, ...talent.altNames].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [input, talents]);

  return (
    <div className="holo-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--holo-text-muted)" }}
          >
            Guess a talent
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
            Search the fetched catalog and submit one name per round.
          </p>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-xs font-bold"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          {talents.length} talents
        </div>
      </div>

      <div className="relative mt-4">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => onInput(input)}
          disabled={disabled}
          placeholder={disabled ? "Session ended" : "Type a talent name or alt name"}
          className="holo-input w-full rounded-2xl px-4 py-3.5 text-sm"
          autoComplete="off"
        />
        {input && !disabled && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: "var(--holo-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="mt-3 max-h-72 overflow-auto rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: "var(--holo-border)" }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((talent) => (
              <button
                key={talent.id}
                onClick={() => onSelect(talent)}
                className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--holo-off-white)]"
                style={{ borderColor: "var(--holo-border)" }}
              >
                <img
                  src={talent.photoUrl}
                  alt={talent.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                    {talent.name}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-sm" style={{ color: "var(--holo-text-muted)" }}>
              No talents found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({ entries, loading }: { entries: LeaderboardEntry[]; loading: boolean }) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div
          className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          Loading leaderboard...
        </div>
      ) : entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry.session_id}
            className="rounded-2xl border bg-white px-4 py-3 shadow-sm"
            style={{ borderColor: "var(--holo-border)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black"
                style={{
                  borderColor: "var(--holo-border)",
                  background: "var(--holo-off-white)",
                  color: "var(--holo-text)",
                }}
              >
                #{entry.rank}
              </div>
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src={entry.user_picture}
                  alt={entry.user_name}
                  width={36}
                  height={36}
                  className="rounded-full"
                  style={{ border: "2px solid var(--holo-border)" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black" style={{ color: "var(--holo-text)" }}>
                  {entry.user_name}
                </div>
                <div
                  className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--holo-text-muted)" }}
                >
                  <span>{entry.score} pts</span>
                  <span>•</span>
                  <span>{entry.correct_guesses} correct</span>
                  <span>•</span>
                  <span>{entry.wrong_answers} wrong</span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          No leaderboard data yet.
        </div>
      )}
    </div>
  );
}

function LeaderboardModal({
  open,
  entries,
  loading,
  onClose,
}: {
  open: boolean;
  entries: LeaderboardEntry[];
  loading: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        aria-label="Close leaderboard"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="overflow-hidden rounded-[28px] border bg-[var(--holo-bg)] shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4 md:px-6">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.24em]"
                style={{ color: "var(--holo-text-muted)" }}
              >
                Leaderboard
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
                Sorted by score, correct guesses, then fewer mistakes.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-3 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)]"
              style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
            >
              Close
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
              >
                Top {entries.length || 0}
              </span>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <LeaderboardCard entries={entries} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalResultCard({
  session,
  historyCount,
  onNewSession,
}: {
  session: GameSession;
  historyCount: number;
  onNewSession: () => void;
}) {
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center animate-bounce-in">
      <div className="text-4xl">⏰</div>
      <h2 className="mt-3 text-2xl font-black" style={{ color: "var(--holo-blue)" }}>
        Session expired
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6"
        style={{ color: "var(--holo-text-muted)" }}
      >
        The 5 minute giveaway session is over. Your final score is locked and the round no longer
        accepts guesses.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <HeaderStat label="Score" value={session.score} />
        <HeaderStat label="Correct" value={session.correct_guesses} />
        <HeaderStat label="Wrong" value={session.wrong_answers} />
        <HeaderStat label="Guesses" value={historyCount} />
      </div>

      <button
        onClick={onNewSession}
        className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
        style={{ background: "var(--holo-blue)" }}
      >
        Start a new session
      </button>
    </div>
  );
}

function StartSessionCard({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center">
      <div className="text-4xl" style={{ color: "var(--holo-blue)" }}>
        ▶
      </div>
      <h2 className="mt-3 text-2xl font-black" style={{ color: "var(--holo-blue)" }}>
        Start a session to play
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6"
        style={{ color: "var(--holo-text-muted)" }}
      >
        A round is only created when you start it. Open a session first, then submit guesses.
      </p>

      <button
        onClick={onStart}
        disabled={loading}
        className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "var(--holo-blue)" }}
      >
        {loading ? "Starting..." : "Start session"}
      </button>
    </div>
  );
}

function GiveawayVsiGame({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [talents, setTalents] = useState<TalentChoice[]>([]);
  // const [input, setInput] = useState("");
  // const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);
  const [talentError, setTalentError] = useState("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [currentRoundHistory, setCurrentRoundHistory] = useState<GuessEntry[]>([]);
  const [previousRounds, setPreviousRounds] = useState<GuessEntry[][]>([]);
  const [historyTab, setHistoryTab] = useState<"current" | "previous">("current");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const guessedIds = useMemo(
    () => new Set(currentRoundHistory.map((item) => item.talent.id)),
    [currentRoundHistory]
  );
  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return talents
      .filter((talent) => !guessedIds.has(talent.id))
      .filter((talent) => {
        const haystack = [talent.name, ...talent.altNames].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [search, talents, guessedIds]);

  const active = Boolean(session) && !sessionEnded;
  const expiresAt = session ? Date.parse(session.expires_at) : null;
  const timeLeftMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const timeLeftText = session ? formatTimer(timeLeftMs) : "--:--";

  const syncLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const data = await authedJson<LeaderboardEntry[]>(
        "/api/v1/game-session/leaderboard?limit=20",
        {
          method: "GET",
        }
      );
      const sorted = [...data].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.correct_guesses !== a.correct_guesses) return b.correct_guesses - a.correct_guesses;
        if (a.wrong_answers !== b.wrong_answers) return a.wrong_answers - b.wrong_answers;
        return a.rank - b.rank;
      });
      setLeaderboard(sorted);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setSessionError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError("");
    setSessionEnded(false);
    const storedSessionId = localStorage.getItem(SESSION_KEY);

    if (!storedSessionId) {
      setSession(null);
      setCurrentRoundHistory([]);
      setPreviousRounds([]);
      setSessionLoading(false);
      return;
    }

    if (storedSessionId) {
      try {
        const loaded = await authedJson<GameSession>(`/api/v1/game-session/${storedSessionId}`, {
          method: "GET",
        });
        const expiresAtMs = Date.parse(loaded.expires_at);
        if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
          setSession(loaded);
          setSessionEnded(true);
          const stored = getStoredHistoryState(loaded.id);
          setCurrentRoundHistory(stored.currentRound);
          setPreviousRounds(stored.previousRounds);
          setSessionLoading(false);
          return;
        }

        setSession(loaded);
        const stored = getStoredHistoryState(loaded.id);
        setCurrentRoundHistory(stored.currentRound);
        setPreviousRounds(stored.previousRounds);
        setStoredHistoryState(loaded.id, stored);
        setSessionLoading(false);
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setSessionLoading(false);
          return;
        }
        if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
          localStorage.removeItem(SESSION_KEY);
          clearStoredHistory(storedSessionId);
          setSession(null);
          setSessionEnded(false);
          setSessionError("");
          setSessionLoading(false);
          return;
        }

        localStorage.removeItem(SESSION_KEY);
        clearStoredHistory(storedSessionId);
      }
    }
  }, []);

  const createSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError("");
    setSessionEnded(false);
    try {
      const created = await authedJson<GameSession>("/api/v1/game-session/create", {
        method: "POST",
      });
      localStorage.setItem(SESSION_KEY, created.id);
      setStoredHistoryState(created.id, getEmptySessionHistoryState());
      setSession(created);
      setCurrentRoundHistory([]);
      setPreviousRounds([]);
      setHistoryTab("current");
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const startNewSession = useCallback(async () => {
    if (session?.id) {
      localStorage.removeItem(SESSION_KEY);
      clearStoredHistory(session.id);
    }
    setSession(null);
    setCurrentRoundHistory([]);
    setPreviousRounds([]);
    setSearch("");
    setHistoryTab("current");
    await createSession();
  }, [createSession, session?.id]);

  const submitGuess = useCallback(
    async (talent: TalentChoice) => {
      if (!session || !active || submittingId) return;
      if (guessedIds.has(talent.id)) return;

      setSubmittingId(talent.id);
      setSessionError("");

      try {
        const data = await authedJson<{
          correct: boolean;
          comparison: Comparison;
          session: SessionSummary;
        }>(`/api/v1/game-session/${session.id}/answer`, {
          method: "POST",
          body: JSON.stringify({ talent_id: talent.id }),
        });

        const entry: GuessEntry = {
          talent,
          comparison: data.comparison,
          correct: data.correct,
          submittedAt: new Date().toISOString(),
        };

        if (data.correct) {
          const completedRound = [...currentRoundHistory, entry];
          setPreviousRounds((prevRounds) => [...prevRounds, completedRound]);
          setCurrentRoundHistory([]);
        } else {
          setCurrentRoundHistory((prev) => [...prev, entry]);
        }

        setSession((prev) =>
          prev
            ? {
                ...prev,
                score: data.session.score,
                correct_guesses: data.session.correct_guesses,
                wrong_answers: data.session.wrong_answers,
                round_number: data.session.round_number,
                updated_at: new Date().toISOString(),
              }
            : prev
        );
        setToast(data.correct ? "Correct guess." : "Wrong answer.");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        if (err instanceof ApiError && /expired/i.test(err.message)) {
          setSessionEnded(true);
          setSessionError("Game session expired.");
          return;
        }
        setSessionError(err instanceof Error ? err.message : "Failed to submit guess");
      } finally {
        setSubmittingId(null);
        setSearch("");
        setShowDropdown(false);
      }
    },
    [active, currentRoundHistory, guessedIds, session, submittingId]
  );

  useEffect(() => {
    let alive = true;

    const loadTalents = async () => {
      setTalentsLoading(true);
      setTalentError("");
      try {
        const data = await authedJson<ApiTalent[]>("/api/v1/talent/", { method: "GET" });
        if (!alive) return;
        setTalents(data.map(normalizeTalent));
      } catch (err) {
        if (!alive) return;
        if (!(err instanceof ApiError && err.status === 401)) {
          setTalentError(err instanceof Error ? err.message : "Failed to fetch talents");
        }
      } finally {
        if (alive) setTalentsLoading(false);
      }
    };

    if (user) void loadTalents();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || talentsLoading) return;
    void loadSession();
  }, [loadSession, talentsLoading, user]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session || sessionEnded) return;
    const expiresAtMs = Date.parse(session.expires_at);
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= now) {
      setSessionEnded(true);
      setSessionError("Game session expired.");
    }
  }, [now, session, sessionEnded]);

  useEffect(() => {
    if (!session?.id) return;
    localStorage.setItem(SESSION_KEY, session.id);
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;
    setStoredHistoryState(session.id, {
      currentRound: currentRoundHistory,
      previousRounds,
    });
  }, [currentRoundHistory, previousRounds, session?.id]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!showLeaderboard) return;
    void syncLeaderboard();
  }, [showLeaderboard, syncLeaderboard]);

  const totalGuessCount =
    currentRoundHistory.length + previousRounds.reduce((count, round) => count + round.length, 0);
  const latestGuess = currentRoundHistory[currentRoundHistory.length - 1] ?? null;
  const displayCurrentHistory = [...currentRoundHistory].reverse();
  const displayPreviousRounds = [...previousRounds].reverse();

  if (sessionLoading || talentsLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading game...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(0,180,216,0.10)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(14,165,233,0.08)" }}
        />
      </div> */}

      <Navbar title="GIVEAWAY VSI" user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Giveaway VSI - Guess the Hololive talent!"
            onHowTo={() => setShowHowTo(!showHowTo)}
            onLeaderboard={() => setShowLeaderboard((prev) => !prev)}
            showHowTo={showHowTo}
            showLeaderboard={showLeaderboard}
            showLeaderboardButton={true}
            vsiHeader={true}
          />
        </div>
        {session ? (
          <div className="flex gap-3 justify-center mb-6">
            <HeaderStat label="Time left" value={sessionEnded ? "Expired" : timeLeftText} />
            <HeaderStat label="Score" value={session.score} />
            <HeaderStat label="Round" value={session.round_number} />
            <HeaderStat label="Wrong" value={session.wrong_answers} />
          </div>
        ) : (
          <div
            className="mb-6 rounded-2xl border border-dashed px-4 py-3 text-center text-sm font-semibold"
            style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
          >
            No active session. Start one to begin playing.
          </div>
        )}

        {/* How to play */}
        {showHowTo && <HowToPlay maxGuesses={999} classic={false} />}

        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-max max-w-sm rounded-2xl border px-4 py-3 text-sm font-bold animate-slide-up z-50"
            style={{
              borderColor: "var(--holo-border)",
              background: "white",
              color: "var(--holo-text)",
            }}
          >
            {toast}
          </div>
        )}

        {talentError && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {talentError}
          </div>
        )}

        <LeaderboardModal
          open={showLeaderboard}
          entries={leaderboard}
          loading={leaderboardLoading}
          onClose={() => setShowLeaderboard(false)}
        />

        {sessionError && !sessionEnded && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {sessionError}
          </div>
        )}

        {sessionEnded && session ? (
          <FinalResultCard
            session={session}
            historyCount={totalGuessCount}
            onNewSession={startNewSession}
          />
        ) : !session ? (
          <StartSessionCard onStart={startNewSession} loading={sessionLoading} />
        ) : (
          <>
            <TalentSearch
              talents={talents}
              input={search}
              onInput={(value) => {
                setSearch(value);
                setShowDropdown(value.trim().length > 0);
              }}
              onSelect={(talent) => {
                void submitGuess(talent);
              }}
              onClear={() => {
                setSearch("");
                setShowDropdown(false);
              }}
              showDropdown={showDropdown}
              dropdownRef={dropdownRef}
              inputRef={inputRef}
              disabled={!active || Boolean(submittingId)}
            />

            {session && (
              <div className="holo-card p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-xs font-black uppercase tracking-[0.24em]"
                      style={{ color: "var(--holo-text-muted)" }}
                    >
                      Session state
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
                      {session.correct_guesses} correct, {session.wrong_answers} wrong, round{" "}
                      {session.round_number}
                    </p>
                  </div>
                  <button
                    onClick={startNewSession}
                    className="rounded-xl border px-4 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)]"
                    style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
                  >
                    New session
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto pb-2">
                  <div
                    className="mb-4 flex rounded-2xl border p-1"
                    style={{ borderColor: "var(--holo-border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setHistoryTab("current")}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                        historyTab === "current" ? "bg-[var(--holo-off-white)]" : "bg-transparent"
                      }`}
                      style={{ color: "var(--holo-text)" }}
                    >
                      Current round
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTab("previous")}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                        historyTab === "previous" ? "bg-[var(--holo-off-white)]" : "bg-transparent"
                      }`}
                      style={{ color: "var(--holo-text)" }}
                    >
                      Previous results
                    </button>
                  </div>

                  {historyTab === "current" && currentRoundHistory.length > 0 ? (
                    <div className="space-y-2">
                      <ColumnHeaders
                        headers={[
                          "Talent",
                          "Name",
                          "Branch",
                          "Debut Year",
                          "Archetype",
                          "Height",
                          "Birth Month",
                        ]}
                      />

                      {displayCurrentHistory.map((guess, index) => (
                        <GuessRow
                          key={`${guess.talent.id}-${guess.submittedAt}`}
                          guess={guess.talent}
                          result={guess.comparison}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : historyTab === "current" ? (
                    <div
                      className="rounded-2xl border border-dashed px-4 py-12 text-center"
                      style={{
                        borderColor: "var(--holo-border)",
                        color: "var(--holo-text-muted)",
                      }}
                    >
                      Your first guess will appear here.
                    </div>
                  ) : displayPreviousRounds.length > 0 ? (
                    <div className="space-y-3">
                      {displayPreviousRounds.map((round, roundIndex) => {
                        const roundNumber = previousRounds.length - roundIndex;
                        const roundLatest = round[round.length - 1] ?? null;
                        return (
                          <div
                            key={`${roundNumber}-${roundLatest?.submittedAt ?? roundIndex}`}
                            className="rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ borderColor: "var(--holo-border)" }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p
                                  className="text-xs font-black uppercase tracking-[0.24em]"
                                  style={{ color: "var(--holo-text-muted)" }}
                                >
                                  Round {roundNumber}
                                </p>
                                <p
                                  className="mt-1 text-sm"
                                  style={{ color: "var(--holo-text-muted)" }}
                                >
                                  {round.length} guess{round.length === 1 ? "" : "es"}
                                </p>
                              </div>
                              {roundLatest && (
                                <div
                                  className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${roundLatest.correct ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                                >
                                  {roundLatest.correct ? "Correct" : "Wrong"}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 overflow-x-auto pb-2">
                              <div className="space-y-2">
                                <ColumnHeaders
                                  headers={[
                                    "Talent",
                                    "Name",
                                    "Branch",
                                    "Debut Year",
                                    "Archetype",
                                    "Height",
                                    "Birth Month",
                                  ]}
                                  giveawayVsi={true}
                                />

                                {[...round].reverse().map((guess, index) => (
                                  <GuessRow
                                    key={`${guess.talent.id}-${guess.submittedAt}`}
                                    guess={guess.talent}
                                    result={guess.comparison}
                                    index={index}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl border border-dashed px-4 py-12 text-center"
                      style={{
                        borderColor: "var(--holo-border)",
                        color: "var(--holo-text-muted)",
                      }}
                    >
                      Previous results will appear here after a correct answer.
                    </div>
                  )}
                </div>

                {latestGuess && (
                  <div
                    className="mt-4 rounded-2xl border bg-white px-4 py-4 shadow-sm"
                    style={{ borderColor: "var(--holo-border)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="text-xs font-black uppercase tracking-[0.24em]"
                          style={{ color: "var(--holo-text-muted)" }}
                        >
                          Latest result
                        </p>
                        <p className="mt-1 text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                          {latestGuess.talent.name}
                        </p>
                      </div>
                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${latestGuess.correct ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                      >
                        {latestGuess.correct ? "Correct" : "Wrong"}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <HeaderStat label="Name" value={latestGuess.comparison.name} />
                      <HeaderStat label="Branch" value={latestGuess.comparison.branch} />
                      <HeaderStat label="Debut" value={latestGuess.comparison.debutYear} />
                      <HeaderStat label="Month" value={latestGuess.comparison.birthMonth} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* <aside className="space-y-6">
          <LeaderboardCard entries={leaderboard} loading={leaderboardLoading} />

          <div className="holo-card p-4 md:p-5">
            <p
              className="text-xs font-black uppercase tracking-[0.24em]"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Session details
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--holo-text-muted)" }}>Created</span>
                <span className="font-bold" style={{ color: "var(--holo-text)" }}>
                  {session
                    ? new Date(session.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--holo-text-muted)" }}>Expires</span>
                <span className="font-bold" style={{ color: "var(--holo-text)" }}>
                  {session
                    ? new Date(session.expires_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--holo-text-muted)" }}>Correct guesses</span>
                <span className="font-bold" style={{ color: "var(--holo-text)" }}>
                  {session?.correct_guesses ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--holo-text-muted)" }}>Wrong answers</span>
                <span className="font-bold" style={{ color: "var(--holo-text)" }}>
                  {session?.wrong_answers ?? 0}
                </span>
              </div>
            </div>
          </div>
        </aside> */}
      </div>

      <Footer />
    </main>
  );
}

export default function GiveawayVsiPage() {
  const { user, loading, login, logout } = useGiveawayAuth();

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading...
        </span>
      </main>
    );
  }

  if (!user) return <AuthGate onLogin={login} />;

  return <GiveawayVsiGame user={user} onLogout={logout} />;
}

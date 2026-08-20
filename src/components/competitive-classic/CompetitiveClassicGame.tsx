"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Navbar,
  PageHeader,
  HowToPlay,
  ColumnHeaders,
  DEFAULT_COLUMN_HEADERS,
  Footer,
} from "@/components/ui";
import GuessRow from "@/components/ui/GuessRow";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { ApiError } from "@/lib/errors";
import {
  authedJson,
  addDays,
  addMonths,
  clearStoredHistory,
  formatTimer,
  getEmptySessionHistoryState,
  getMondayDate,
  getStoredHistoryState,
  normalizeTalent,
  setStoredHistoryState,
  toIsoDate,
  toMonthString,
} from "./utils";
import TalentSearch from "./TalentSearch";
import HeaderStat from "./HeaderStat";
import LeaderboardModal from "./LeaderboardModal";
import FinalResultCard from "./FinalResultCard";
import StartSessionCard from "./StartSessionCard";
import type { ApiTalent } from "@/lib/talents";
import type {
  AuthUser,
  TalentChoice,
  GameSession,
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardResponse,
  Comparison,
  GuessEntry,
} from "./types";

const SESSION_KEY = "competitive-classic-session-id";
const MIN_MONTH = "2026-06";

export default function CompetitiveClassicGame({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [talents, setTalents] = useState<TalentChoice[]>([]);
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
  const [leaderboardLoadingMore, setLeaderboardLoadingMore] = useState(false);
  const [leaderboardTotal, setLeaderboardTotal] = useState(0);
  const [leaderboardHasMore, setLeaderboardHasMore] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [week, setWeek] = useState(() => toIsoDate(getMondayDate(new Date())));
  const [month, setMonth] = useState(() => toMonthString(new Date()));
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "err" } | null>(null);
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

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const buildLeaderboardUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({ period, page: String(page), page_size: "20" });
      if (period === "weekly") params.set("week", week);
      if (period === "monthly") params.set("month", month);
      return `/api/v1/game-session/leaderboard?${params.toString()}`;
    },
    [period, week, month]
  );

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardLoadingMore(false);
    setLeaderboard([]);
    setLeaderboardPage(0);
    try {
      const data = await authedJson<LeaderboardResponse>(buildLeaderboardUrl(1), {
        method: "GET",
      });
      setLeaderboard(data.entries);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setSessionError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [buildLeaderboardUrl]);

  const loadMoreLeaderboard = useCallback(async () => {
    if (leaderboardLoading || leaderboardLoadingMore || !leaderboardHasMore) return;
    setLeaderboardLoadingMore(true);
    try {
      const data = await authedJson<LeaderboardResponse>(buildLeaderboardUrl(leaderboardPage + 1), {
        method: "GET",
      });
      setLeaderboard((prev) => [...prev, ...data.entries]);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setSessionError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoadingMore(false);
    }
  }, [
    buildLeaderboardUrl,
    leaderboardHasMore,
    leaderboardLoading,
    leaderboardLoadingMore,
    leaderboardPage,
  ]);

  const changePeriod = useCallback((next: LeaderboardPeriod) => {
    setPeriod(next);
    if (next === "weekly") setWeek(toIsoDate(getMondayDate(new Date())));
    if (next === "monthly") setMonth(toMonthString(new Date()));
  }, []);

  const navigatePeriod = useCallback(
    (direction: 1 | -1) => {
      if (period === "weekly") {
        setWeek((w) => toIsoDate(addDays(new Date(w + "T00:00:00"), direction * 7)));
        return;
      }
      if (period === "monthly") {
        setMonth((m) => {
          const next = toMonthString(addMonths(new Date(m + "-01T00:00:00"), direction));
          const max = toMonthString(new Date());
          if (next < MIN_MONTH) return MIN_MONTH;
          if (next > max) return max;
          return next;
        });
      }
    },
    [period]
  );

  const currentMonth = toMonthString(new Date());
  const prevMonth = toMonthString(addMonths(new Date(month + "-01T00:00:00"), -1));
  const nextMonth = toMonthString(addMonths(new Date(month + "-01T00:00:00"), 1));
  const monthPrevDisabled = prevMonth < MIN_MONTH;
  const monthNextDisabled = nextMonth > currentMonth;

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
          session: {
            score: number;
            correct_guesses: number;
            wrong_answers: number;
            round_number: number;
          };
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
        setToast({
          message: data.correct ? "Correct guess." : "Wrong answer.",
          type: data.correct ? "ok" : "err",
        });
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
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearInterval(timer);
  }, [toast]);

  useEffect(() => {
    if (!showLeaderboard) return;
    void fetchLeaderboard();
  }, [fetchLeaderboard, showLeaderboard]);

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
      <Navbar title="COMPETITIVE CLASSIC" user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Competitive Classic - Guess the Hololive talent!"
            onHowTo={() => setShowHowTo(!showHowTo)}
            onLeaderboard={() => setShowLeaderboard((prev) => !prev)}
            showHowTo={showHowTo}
            showLeaderboard={showLeaderboard}
            showLeaderboardButton={true}
            competitiveHeader={true}
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

        {showHowTo && <HowToPlay maxGuesses={999} classic={false} />}

        {toast && (
          <div
            className={`fixed top-4 inset-x-0 mx-auto w-full max-w-5xl rounded-2xl px-4 py-3 text-center text-sm font-bold z-50 animate-slide-down ${toast.type === "ok" ? "win-banner" : "lose-banner"}`}
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          >
            {toast.message}
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
          loadingMore={leaderboardLoadingMore}
          hasMore={leaderboardHasMore}
          total={leaderboardTotal}
          period={period}
          month={month}
          prevDisabled={period === "monthly" && monthPrevDisabled}
          nextDisabled={period === "monthly" && monthNextDisabled}
          onPeriodChange={changePeriod}
          onNavigate={navigatePeriod}
          onLoadMore={loadMoreLeaderboard}
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
                      <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />

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
                            className="rounded-2xl border bg-[var(--holo-bg-card)] p-4 shadow-sm"
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
                                  headers={DEFAULT_COLUMN_HEADERS}
                                  competitive={true}
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
                    className="mt-4 rounded-2xl border bg-[var(--holo-bg-card)] px-4 py-4 shadow-sm"
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
      </div>

      <Footer />
    </main>
  );
}

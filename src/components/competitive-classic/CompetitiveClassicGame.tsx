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
import { useCompetitiveSession } from "@/hooks/useCompetitiveSession";
import { fetchLeaderboardPage } from "@/lib/queries";
import {
  addDays,
  addMonths,
  getMondayDate,
  toIsoDate,
  toMonthString,
} from "./utils";
import TalentSearch from "./TalentSearch";
import HeaderStat from "./HeaderStat";
import LeaderboardModal from "./LeaderboardModal";
import FinalResultCard from "./FinalResultCard";
import StartSessionCard from "./StartSessionCard";
import LoginToPlayCard from "./LoginToPlayCard";
import type {
  AuthUser,
  TalentChoice,
  LeaderboardEntry,
  LeaderboardPeriod,
} from "./types";

const MIN_MONTH = "2026-06";

export default function CompetitiveClassicGame({
  user,
  onLogin,
  onLogout,
}: {
  user: AuthUser | null;
  onLogin: (redirectTo?: string) => void;
  onLogout: () => void;
}) {
  const s = useCompetitiveSession(user);

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search/dropdown/tab UI stays in the page; the hook owns session state, so
  // these same-named wrappers apply the UI resets the moved code did inline.
  const startNewSession = useCallback(() => {
    setSearch("");
    setHistoryTab("current");
    return s.startNewSession();
  }, [s.startNewSession]);

  const submitGuess = useCallback(
    (talent: TalentChoice) => {
      void Promise.resolve(s.submitGuess(talent)).finally(() => {
        setSearch("");
        setShowDropdown(false);
      });
    },
    [s.submitGuess]
  );

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return s.talents
      .filter((talent) => !s.guessedIds.has(talent.id))
      .filter((talent) => {
        const haystack = [talent.name, ...talent.altNames].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [search, s.talents, s.guessedIds]);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardLoadingMore(false);
    setLeaderboard([]);
    setLeaderboardPage(0);
    try {
      const data = await fetchLeaderboardPage({ period, page: 1, week, month });
      setLeaderboard(data.entries);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      s.setSessionError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [period, week, month]);

  const loadMoreLeaderboard = useCallback(async () => {
    if (leaderboardLoading || leaderboardLoadingMore || !leaderboardHasMore) return;
    setLeaderboardLoadingMore(true);
    try {
      const data = await fetchLeaderboardPage({
        period,
        page: leaderboardPage + 1,
        week,
        month,
      });
      setLeaderboard((prev) => [...prev, ...data.entries]);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      s.setSessionError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoadingMore(false);
    }
  }, [
    period,
    week,
    month,
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

  useEffect(() => {
    if (!showLeaderboard) return;
    void fetchLeaderboard();
  }, [fetchLeaderboard, showLeaderboard]);

  const totalGuessCount =
    s.currentRoundHistory.length + s.previousRounds.reduce((count, round) => count + round.length, 0);
  const latestGuess = s.currentRoundHistory[s.currentRoundHistory.length - 1] ?? null;
  const displayCurrentHistory = [...s.currentRoundHistory].reverse();
  const displayPreviousRounds = [...s.previousRounds].reverse();

  if (user && (s.sessionLoading || s.talentsLoading)) {
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
      <Navbar
        title="Classic - Competitive"
        user={user ?? null}
        onLogout={onLogout}
        onLogin={onLogin}
      />

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

        {s.session ? (
          <div className="flex gap-3 justify-center mb-6">
            <HeaderStat label="Time left" value={s.sessionStatus === "ended" || s.sessionStatus === "expired" ? "Expired" : s.timeLeftText} />
            <HeaderStat label="Score" value={s.session.score} />
            <HeaderStat label="Round" value={s.session.round_number} />
            <HeaderStat label="Wrong" value={s.session.wrong_answers} />
          </div>
        ) : (
          <div
            className="mb-6 rounded-2xl border border-dashed px-4 py-3 text-center text-sm font-semibold"
            style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
          >
            No active s.session. Start one to begin playing.
          </div>
        )}

        {showHowTo && <HowToPlay maxGuesses={999} classic={false} />}

        {s.toast && (
          <div
            className={`fixed top-4 inset-x-0 mx-auto w-full max-w-5xl rounded-2xl px-4 py-3 text-center text-sm font-bold z-50 animate-slide-down ${s.toast.type === "ok" ? "win-banner" : "lose-banner"}`}
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          >
            {s.toast.message}
          </div>
        )}

        {s.talentError && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {s.talentError}
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

        {s.sessionError && s.sessionStatus !== "ended" && s.sessionStatus !== "expired" && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {s.sessionError}
          </div>
        )}

        {s.sessionStatus === "locked" ? (
          <LoginToPlayCard onLogin={() => onLogin("/classic/competitive")} />
        ) : s.sessionStatus === "ended" || s.sessionStatus === "expired" ? (
          s.session ? (
            <FinalResultCard
              session={s.session}
              historyCount={totalGuessCount}
              onNewSession={startNewSession}
            />
          ) : (
            <StartSessionCard onStart={startNewSession} loading={s.sessionLoading} />
          )
        ) : s.sessionStatus === "idle" || s.sessionStatus === "error" ? (
          <StartSessionCard onStart={startNewSession} loading={s.sessionLoading} />
        ) : (
          <>
            <TalentSearch
              talents={s.talents}
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
              disabled={s.sessionStatus !== "active"}
            />

            {s.session && (
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
                      {s.session.correct_guesses} correct, {s.session.wrong_answers} wrong, round{" "}
                      {s.session.round_number}
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

                  {historyTab === "current" && s.currentRoundHistory.length > 0 ? (
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
                        const roundNumber = s.previousRounds.length - roundIndex;
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

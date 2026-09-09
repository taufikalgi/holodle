"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Navbar,
  PageHeader,
  HowToPlay,
  Footer,
} from "@/components/ui";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useCompetitiveSession } from "@/hooks/useCompetitiveSession";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import TalentSearch from "./TalentSearch";
import HeaderStat from "./HeaderStat";
import SessionHistorySection from "./SessionHistorySection";
import LeaderboardModal from "./LeaderboardModal";
import FinalResultCard from "./FinalResultCard";
import SessionStateCard from "./SessionStateCard";
import type { AuthUser, TalentChoice } from "./types";

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
  const lb = useLeaderboard((m) => s.setSessionError(m));

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search/dropdown UI stays in the page; the hook owns session state, so
  // these plain wrappers apply the UI reset the moved code did inline
  // (compiler cannot preserve manual memoization here; identity churn is harmless).
  // (History tab resets via <SessionHistorySection key={session.id}> remount.)
  function startNewSession() {
    setSearch("");
    return s.startNewSession();
  }

  function submitGuess(talent: TalentChoice) {
    void Promise.resolve(s.submitGuess(talent)).finally(() => {
      setSearch("");
      setShowDropdown(false);
    });
  }

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

  useEffect(() => {
    if (!showLeaderboard) return;
    void lb.fetchLeaderboard();
  }, [lb.fetchLeaderboard, showLeaderboard]);

  const totalGuessCount =
    s.currentRoundHistory.length + s.previousRounds.reduce((count, round) => count + round.length, 0);

  if (user && (s.sessionLoading || s.talentsLoading)) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]"
      >
        <span
          className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]"
        >
          Loading game...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
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
            className="mb-6 rounded-2xl border border-dashed px-4 py-3 text-center text-sm font-semibold border-[var(--holo-border)] text-[var(--holo-text-muted)]"
          >
            No active session. Start one to begin playing.
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
          entries={lb.leaderboard}
          loading={lb.leaderboardLoading}
          loadingMore={lb.leaderboardLoadingMore}
          hasMore={lb.leaderboardHasMore}
          total={lb.leaderboardTotal}
          period={lb.period}
          month={lb.month}
          prevDisabled={lb.period === "monthly" && lb.monthPrevDisabled}
          nextDisabled={lb.period === "monthly" && lb.monthNextDisabled}
          onPeriodChange={lb.changePeriod}
          onNavigate={lb.navigatePeriod}
          onLoadMore={lb.loadMoreLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />

        {s.sessionError && s.sessionStatus !== "ended" && s.sessionStatus !== "expired" && (
          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {s.sessionError}
          </div>
        )}

        {s.sessionStatus === "locked" ? (
          <SessionStateCard variant="login" onLogin={() => onLogin("/classic/competitive")} />
        ) : s.sessionStatus === "ended" || s.sessionStatus === "expired" ? (
          s.session ? (
            <FinalResultCard
              session={s.session}
              historyCount={totalGuessCount}
              onNewSession={startNewSession}
            />
          ) : (
            <SessionStateCard variant="start" onStart={startNewSession} loading={s.sessionLoading} />
          )
        ) : s.sessionStatus === "idle" || s.sessionStatus === "error" ? (
          <SessionStateCard variant="start" onStart={startNewSession} loading={s.sessionLoading} />
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
              <SessionHistorySection
                key={s.session.id}
                session={s.session}
                currentRoundHistory={s.currentRoundHistory}
                previousRounds={s.previousRounds}
                onNewSession={startNewSession}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

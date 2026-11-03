"use client";

import { useState } from "react";
import { Footer, Navbar, PageHeader } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { LoadingBlock, ZeroGuessHint } from "@/components/game/GameShell";
import StatusPill from "@/components/game/StatusPill";
import HolosongQuizClipPlayer from "@/components/holosong/HolosongQuizClipPlayer";
import HolosongQuizHowToPlay from "@/components/holosong/HolosongQuizHowToPlay";
import HolosongQuizLeaderboard from "@/components/holosong/HolosongQuizLeaderboard";
import HolosongQuizOptions from "@/components/holosong/HolosongQuizOptions";
import HolosongQuizResult from "@/components/holosong/HolosongQuizResult";
import HolosongQuizStats from "@/components/holosong/HolosongQuizStats";
import HolosongStatsLoginHint from "@/components/holosong/HolosongStatsLoginHint";
import { useHolosongQuiz } from "@/hooks/useHolosongQuiz";
import { useHolosongQuizLeaderboard } from "@/hooks/useHolosongQuizLeaderboard";
import type { HolosongQuizMode } from "@/lib/holosong-quiz-api";

export default function HolosongQuizGame({
  mode,
  onLogin,
}: {
  mode: HolosongQuizMode;
  onLogin?: () => void;
}) {
  const endless = mode === "endless";
  const {
    session,
    stats,
    statsAuthRequired,
    error,
    submitting,
    status,
    submit,
    retry,
    newRun,
  } = useHolosongQuiz(mode);
  const leaderboard = useHolosongQuizLeaderboard();
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selection, setSelection] = useState<{
    sessionId: string;
    round: number;
    songId: string;
  }>();

  const selectedId =
    session &&
    selection?.sessionId === session.id &&
    selection.round === session.round_number
      ? selection.songId
      : undefined;

  const openLeaderboard = () => {
    setShowLeaderboard(true);
    leaderboard.loadIfNeeded();
  };

  const onSelect = (songId: string) => {
    if (!session) return;
    setSelection({
      sessionId: session.id,
      round: session.round_number,
      songId,
    });
    void submit(songId);
  };

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title={endless ? "HOLOSONG QUIZ ENDLESS" : "HOLOSONG QUIZ"} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-6">
          <PageHeader
            subtitle={
              endless
                ? "Name that song before your streak ends"
                : "One shared song, three choices, one guess"
            }
            onHowTo={() => setShowHowTo((value) => !value)}
            showHowTo={showHowTo}
            onLeaderboard={openLeaderboard}
            showLeaderboard={showLeaderboard}
            showLeaderboardButton
          />

          {session && (
            <StatusPill
              status={status}
              guessesLeft={endless ? 1 : Math.max(0, 1 - session.guesses_used)}
              variant={endless ? "endless" : "daily"}
              lostText={endless ? "Run over — start a new run!" : undefined}
            />
          )}
        </header>

        {showHowTo && <HolosongQuizHowToPlay endless={endless} />}

        {stats ? (
          <HolosongQuizStats stats={stats} mode={mode} />
        ) : statsAuthRequired && onLogin ? (
          <HolosongStatsLoginHint
            onLogin={onLogin}
            message="Log in with Google to save your quiz stats and streaks."
          />
        ) : null}

        {status === "loading" && (
          <LoadingBlock
            text={endless ? "Loading an endless song…" : "Loading today's song…"}
          />
        )}

        {status === "empty" && (
          <div className="holo-card p-8 text-center">
            <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
              {error || "No Holosong songs are available yet."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
            >
              Retry
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="holo-card p-8 text-center">
            <p className="text-sm font-semibold text-rose-600">
              {error || "Failed to load Holosong Quiz."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
            >
              Retry
            </button>
          </div>
        )}

        {session &&
          status !== "loading" &&
          status !== "error" &&
          status !== "empty" && (
            <>
              <HolosongQuizClipPlayer
                key={`${session.id}-${session.round_number}-${session.clip_start_ms}`}
                previewUrl={session.preview_url}
                clipStartMS={session.clip_start_ms}
                clipSeconds={session.clip_seconds}
              />

              {error && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {error}
                </div>
              )}

              <HolosongQuizOptions
                session={session}
                selectedId={selectedId}
                disabled={submitting || session.status !== "ongoing"}
                onSelect={onSelect}
              />

              {session.status === "ongoing" && (
                <ZeroGuessHint
                  compact
                  line1="Listen, then pick the song you heard."
                  line2="One guess per round — no timer"
                />
              )}

              {session.status !== "ongoing" && (
                <HolosongQuizResult
                  session={session}
                  endless={endless}
                  onNewRun={endless ? newRun : undefined}
                />
              )}
            </>
          )}

        <Modal
          open={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          label="Holosong quiz leaderboard"
          maxWidth="max-w-xl"
        >
          <div className="flex items-center justify-between border-b px-5 py-4 border-[var(--holo-border)]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--holo-text-muted)]">
                Leaderboard
              </p>
              <p className="mt-1 text-sm text-[var(--holo-text-muted)]">
                Logged-in players ranked by their best endless streak.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLeaderboard(false)}
              className="rounded-full border px-3 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)] border-[var(--holo-border)] text-[var(--holo-text)]"
            >
              Close
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <HolosongQuizLeaderboard
              entries={leaderboard.entries}
              total={leaderboard.total}
              hasMore={leaderboard.hasMore}
              loading={leaderboard.loading}
              loadingMore={leaderboard.loadingMore}
              error={leaderboard.error}
              onLoadMore={() => void leaderboard.loadMore()}
            />
          </div>
        </Modal>

        <Footer />
      </div>
    </main>
  );
}

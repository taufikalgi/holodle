"use client";

import { useState } from "react";
import { Footer, Navbar, PageHeader } from "@/components/ui";
import StatusPill from "@/components/game/StatusPill";
import {
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";
import HolosongBoard from "@/components/holosong/HolosongBoard";
import HolosongClipPlayer from "@/components/holosong/HolosongClipPlayer";
import HolosongHowToPlay from "@/components/holosong/HolosongHowToPlay";
import HolosongResult from "@/components/holosong/HolosongResult";
import HolosongRunStats from "@/components/holosong/HolosongRunStats";
import HolosongSearch from "@/components/holosong/HolosongSearch";
import HolosongStatsPanel from "@/components/holosong/HolosongStats";
import HolosongStatsLoginHint from "@/components/holosong/HolosongStatsLoginHint";
import { useHolosongGame } from "@/hooks/useHolosongGame";
import type { HolosongSessionMode } from "@/lib/holosong-api";
import {
  buildHolosongEndlessShareText,
  buildHolosongShareText,
} from "@/lib/share";

export default function HolosongGame({
  mode,
  onLogin,
}: {
  mode: "daily" | "endless";
  onLogin?: () => void;
}) {
  const endless = mode === "endless";
  const sessionMode: HolosongSessionMode = endless ? "endless" : "daily";
  const {
    session,
    stats,
    statsAuthRequired,
    error,
    submitting,
    status,
    attemptsLeft,
    submit,
    retry,
    newRun,
  } = useHolosongGame(sessionMode);
  const [showHowTo, setShowHowTo] = useState(false);

  const shareText = session
    ? endless
      ? buildHolosongEndlessShareText({
          roundsPlayed: session.rounds_played,
          roundsWon: session.rounds_won,
          longestStreak: session.longest_streak,
          winRatePercentage: session.win_rate_percentage,
        })
      : buildHolosongShareText({
          mode: "DAILY",
          guesses: session.board,
          maxGuesses: session.attempts,
          won: session.status === "won",
        })
    : "";

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title={endless ? "HOLOSONG ENDLESS" : "HOLOSONG"} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-6">
          <PageHeader
            subtitle={
              endless
                ? "Guess random Hololive songs endlessly"
                : "Guess today's Hololive song"
            }
            onHowTo={() => setShowHowTo((value) => !value)}
            showHowTo={showHowTo}
          />

          {session && (
            <StatusPill
              status={status}
              guessesLeft={attemptsLeft}
              variant={endless ? "endless" : "daily"}
              lostText={endless ? "Run over — start a new run!" : undefined}
            />
          )}
        </header>

        {showHowTo && <HolosongHowToPlay endless={endless} />}

        {endless && session && <HolosongRunStats session={session} />}

        {!endless && stats ? (
          <HolosongStatsPanel stats={stats} />
        ) : !endless && statsAuthRequired && onLogin ? (
          <HolosongStatsLoginHint onLogin={onLogin} />
        ) : null}

        {status === "loading" && (
          <LoadingBlock
            text={endless ? "Loading a new song…" : "Loading today's song…"}
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
              {error || "Failed to load Holosong."}
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

        {status === "playing" && session && (
          <>
            <HolosongClipPlayer
              key={`${session.id}-${session.preview_url}-${session.clip_seconds}`}
              previewUrl={session.preview_url}
              clipSeconds={session.clip_seconds}
            />

            {error && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {error}
              </div>
            )}

            <HolosongSearch
              disabled={submitting}
              onGuess={(song) => void submit(song.id)}
              onSkip={() => void submit()}
            />

            {session.board.length > 0 ? (
              <HolosongBoard board={session.board} />
            ) : (
              <ZeroGuessHint
                compact
                line1="Play the clip, then search for the song!"
                line2={`${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left`}
              />
            )}
          </>
        )}

        {(status === "won" || status === "lost") && session && (
          <>
            <HolosongClipPlayer
              key={`${session.id}-${session.preview_url}-${session.clip_seconds}`}
              previewUrl={session.preview_url}
              clipSeconds={session.clip_seconds}
            />
            <HolosongResult
              session={session}
              shareText={shareText}
              endless={endless}
              message={endless ? undefined : "Come back tomorrow for a new song!"}
              onNewRun={endless ? newRun : undefined}
            />
            <HolosongBoard board={session.board} />
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}

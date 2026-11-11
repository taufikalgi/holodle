"use client";

import { useState } from "react";
import { ALL_BRANCHES, type Talent } from "@/lib/talents";
import {
  Footer,
  GameOverBanner,
  HowToPlay,
  Navbar,
  PageHeader,
  ShareButton,
  StatsBar,
} from "@/components/ui";
import { buildGridShareText } from "@/lib/share";
import StatusPill from "@/components/game/StatusPill";
import ClassicBoard from "@/components/classic/ClassicBoard";
import { MAX_GUESSES, useEndlessClassic } from "@/hooks/useEndlessClassic";

export function EndlessGameContent({
  storageKey,
  talents,
  selectedBranches,
  onChangeBranches,
}: {
  storageKey: string;
  talents: Talent[];
  selectedBranches: string[] | null;
  onChangeBranches: () => void;
}) {
  const g = useEndlessClassic(storageKey, talents, selectedBranches);
  const [showHowTo, setShowHowTo] = useState(false);

  const { current, stats, lastRunStreak } = g.state;

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title="ENDLESS" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            onLeaderboard={() => {}}
            showHowTo={showHowTo}
            showLeaderboard={false}
            showLeaderboardButton={false}
          />

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <StatusPill
              status={g.status}
              guessesLeft={g.guessesLeft}
              variant="endless"
              extra={
                selectedBranches && selectedBranches.length < ALL_BRANCHES.length ? (
                  <>
                    <span className="opacity-30">|</span>
                    {selectedBranches.map((b) => (
                      <span
                        key={b}
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--holo-off-white)] text-[var(--holo-text-muted)]"
                      >
                        {b}
                      </span>
                    ))}
                  </>
                ) : undefined
              }
            />
            <button
              type="button"
              onClick={onChangeBranches}
              className="rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-[var(--holo-off-white)] border-[var(--holo-border)] text-[var(--holo-text-muted)]"
            >
              Change branches
            </button>
          </div>
        </div>

        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={false} />}

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {current.gameOver && (
          <GameOverBanner
            won={current.won}
            answerName={current.answer.name}
            guessCount={current.guesses.length}
            actions={
              !current.won ? (
                <div>
                  <ShareButton
                    text={buildGridShareText({
                      gameLabel: `HOLODLE ENDLESS — Streak ${lastRunStreak} 🔥`,
                      guesses: current.guesses.map((g) => g.result),
                      maxGuesses: 0,
                      won: false,
                    })}
                  />
                </div>
              ) : undefined
            }
          >
            <button
              onClick={() => g.nextRound()}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
            >
              {current.won ? "Next talent →" : "New run →"}
            </button>
          </GameOverBanner>
        )}

        {g.pool.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
              No talents match the selected branches.
            </p>
            <p className="text-xs mt-1 opacity-50 text-[var(--holo-text-muted)]">
              <button type="button" onClick={onChangeBranches} className="underline">
                Choose different branches
              </button>
            </p>
          </div>
        ) : (
          <ClassicBoard
            key={current.answer.id}
            pool={g.pool}
            guesses={current.guesses}
            gameOver={current.gameOver}
            onGuess={g.makeGuess}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}

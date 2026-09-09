"use client";

import { useState, useRef } from "react";
import { ALL_BRANCHES, type Talent } from "@/lib/talents";
import {
  ColumnHeaders,
  DEFAULT_COLUMN_HEADERS,
  Footer,
  GameOverBanner,
  GuessRow,
  HowToPlay,
  Navbar,
  PageHeader,
  ShareButton,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import { buildGridShareText } from "@/lib/share";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import StatusPill from "@/components/game/StatusPill";
import { ZeroGuessHint } from "@/components/game/GameShell";
import { MAX_GUESSES, useEndlessClassic } from "@/hooks/useEndlessClassic";

export function EndlessGameContent({
  storageKey,
  selectedBranches,
  onChangeBranches,
}: {
  storageKey: string;
  selectedBranches: string[] | null;
  onChangeBranches: () => void;
}) {
  const g = useEndlessClassic(storageKey, selectedBranches);
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch(g.pool);

  const { current, stats, lastRunStreak } = g.state;

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  function handleGuess(talent: Talent) {
    if (g.makeGuess(talent)) clear();
  }

  function handleNextRound() {
    g.nextRound();
    clear();
  }

  const displayCurrentHistory = current.guesses
    .map((g) => ({ talent: g.talent, result: g.result }))
    .reverse();

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
              onClick={handleNextRound}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
            >
              {current.won ? "Next talent →" : "New run →"}
            </button>
          </GameOverBanner>
        )}

        {!current.gameOver && (
          <TalentSearchInput
            input={input}
            suggestions={suggestions}
            showDropdown={showDropdown}
            onInput={(val) => handleInput(val, g.alreadyGuessed)}
            onGuess={handleGuess}
            onClear={clear}
            onFocus={onFocus}
            dropdownRef={dropdownRef}
          />
        )}

        {current.guesses.length > 0 && (
          <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />
        )}

        <div className="space-y-2">
          {displayCurrentHistory.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {g.pool.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
              No talents match the selected branches.
            </p>
            <p className="text-xs mt-1 opacity-50 text-[var(--holo-text-muted)]">
              <button
                type="button"
                onClick={onChangeBranches}
                className="underline"
              >
                Choose different branches
              </button>
            </p>
          </div>
        ) : !current.gameOver && current.guesses.length === 0 && (
          <ZeroGuessHint
            line1="Start typing to make your first guess!"
            line2={`${g.pool.length} talent${g.pool.length !== 1 ? "s" : ""} in the pool`}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}

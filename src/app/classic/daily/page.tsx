"use client";

import { useState, useRef } from "react";
import { type Talent } from "@/lib/talents";
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
import { MAX_GUESSES, useClassicDaily } from "@/hooks/useClassicDaily";
import StatusPill from "@/components/game/StatusPill";
import StreakResetModal from "@/components/game/StreakResetModal";
import { ZeroGuessHint } from "@/components/game/GameShell";

export default function ClassicGame() {
  const {
    state,
    talents,
    todayAnswer,
    status,
    talentsError,
    guessesLeft,
    alreadyGuessed,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    makeGuess,
  } = useClassicDaily();
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch(talents ?? []);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const handleGuess = (talent: Talent) => {
    if (makeGuess(talent)) clear();
  };

  const displayCurrentHistory = state.guesses
    .map((g) => ({ talent: g.talent, result: g.result }))
    .reverse();

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[var(--holo-bg)]">
        <Navbar title="CLASSIC" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
            Loading talents…
          </p>
        </div>
      </main>
    );
  }

  if (status === "error" || status === "empty" || !todayAnswer) {
    return (
      <main className="min-h-screen bg-[var(--holo-bg)]">
        <Navbar title="CLASSIC" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
            {talentsError || "Failed to load talents."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title="CLASSIC" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <StatusPill
            status={state.gameOver ? (state.won ? "won" : "lost") : "playing"}
            guessesLeft={guessesLeft}
            variant="daily"
          />
        </header>

        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={true} />}

        <StreakResetModal open={streakResetToast} onClose={dismissStreakResetPopup} />

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {(status === "won" || status === "lost") && (
          <GameOverBanner
            won={status === "won"}
            answerName={todayAnswer.name}
            guessCount={state.guesses.length}
            revealed={revealAnswer}
            onReveal={state.won ? undefined : () => setRevealAnswer(true)}
            answerDetails={
              revealAnswer
                ? {
                    image: todayAnswer.image,
                    branch: todayAnswer.branch,
                    debutYear: todayAnswer.debutYear,
                    loreArchetype: todayAnswer.loreArchetype,
                  }
                : undefined
            }
            message="Come back tomorrow for a new talent!"
            actions={
              <ShareButton
                text={buildGridShareText({
                  gameLabel: "HOLODLE CLASSIC",
                  guesses: state.guesses.map((g) => g.result),
                  maxGuesses: MAX_GUESSES,
                  won: state.won,
                })}
              />
            }
          />
        )}

        {status === "playing" && (
          <TalentSearchInput
            input={input}
            suggestions={suggestions}
            showDropdown={showDropdown}
            onInput={(val) => handleInput(val, alreadyGuessed)}
            onGuess={handleGuess}
            onClear={clear}
            onFocus={onFocus}
            dropdownRef={dropdownRef}
          />
        )}

        {state.guesses.length > 0 && (
          <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />
        )}

        <div className="space-y-2">
          {displayCurrentHistory.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {!state.gameOver && state.guesses.length === 0 && (
          <ZeroGuessHint
            line1="Start typing above to make your first guess!"
            line2={`${(talents ?? []).length} talents in the pool`}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}

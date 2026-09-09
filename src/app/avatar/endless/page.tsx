"use client";

import { Suspense, useRef, useState } from "react";
import type { Talent } from "@/lib/talents";
import {
  Footer,
  GameOverBanner,
  Navbar,
  PageHeader,
  ShareButton,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import { buildAvatarShareText } from "@/lib/share";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import CropStage from "@/components/avatar/CropStage";
import AvatarHowToPlay from "@/components/avatar/AvatarHowToPlay";
import AvatarGuessList from "@/components/avatar/AvatarGuessList";
import AvatarSuggestion from "@/components/avatar/AvatarSuggestion";
import StatusPill from "@/components/game/StatusPill";
import {
  AvatarEmptyBlock,
  AvatarErrorBlock,
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";
import { MAX_GUESSES, useAvatarEndlessRound } from "@/hooks/useAvatarEndlessRound";

function EndlessGamePage() {
  const {
    roundState,
    persisted,
    roundStatus,
    roundError,
    pool,
    status,
    guessesLeft,
    alreadyGuessed,
    revealedCount,
    displayGuessHistory,
    startRound,
    makeGuess,
    nextRound,
  } = useAvatarEndlessRound();
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(pool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const handleGuess = (talent: Talent) => {
    if (makeGuess(talent)) clear();
  };

  const { round, guesses } = roundState;

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="AVATAR ENDLESS" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Who is this talent?"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <StatusPill
            status={status}
            guessesLeft={guessesLeft}
            variant="endless"
          />
        </div>

        {showHowTo && <AvatarHowToPlay />}

        <StatsBar
          streak={persisted.stats.streak}
          bestStreak={persisted.stats.bestStreak}
          totalPlayed={persisted.stats.totalPlayed}
          totalWon={persisted.stats.totalWon}
        />

        {roundStatus === "loading" && <LoadingBlock text="Loading a new avatar…" />}

        {roundStatus === "noValid" && (
          <AvatarEmptyBlock onRetry={() => void startRound(pool, persisted.recentTalentIds)} />
        )}

        {roundStatus === "error" && (
          <AvatarErrorBlock
            message={roundError}
            onRetry={() => void startRound(pool, persisted.recentTalentIds)}
          />
        )}

        {roundStatus === "ready" && round && (
          <>
            <div className="holo-card p-4 mb-5">
              <CropStage
                key={round.talent.id}
                src={round.talent.avatarUrl || round.talent.photoUrl}
                areas={round.areas}
                revealedCount={revealedCount}
                fullReveal={roundState.gameOver}
                answerName={round.talent.name}
              />
            </div>

            {roundState.gameOver && (
              <GameOverBanner
                won={roundState.won}
                answerName={round.talent.name}
                guessCount={guesses.length}
                actions={
                  !roundState.won ? (
                    <div>
                      <ShareButton
                        text={buildAvatarShareText({
                          mode: "AVATAR ENDLESS",
                          guessCount: guesses.length,
                          maxGuesses: MAX_GUESSES,
                          streak: persisted.lastRunStreak,
                          guesses: guesses.map((g) => g.correct),
                        })}
                      />
                    </div>
                  ) : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => void nextRound()}
                  className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: "var(--holo-blue)" }}
                >
                  {roundState.won ? "Next talent →" : "New run →"}
                </button>
              </GameOverBanner>
            )}

            {!roundState.gameOver && (
              <TalentSearchInput
                input={input}
                suggestions={suggestions}
                showDropdown={showDropdown}
                onInput={(val) => handleInput(val, alreadyGuessed)}
                onGuess={handleGuess}
                onClear={clear}
                onFocus={onFocus}
                dropdownRef={dropdownRef}
                renderSuggestion={(t) => <AvatarSuggestion talent={t} />}
              />
            )}

            {guesses.length > 0 && <AvatarGuessList guesses={displayGuessHistory} />}

            {!roundState.gameOver && guesses.length === 0 && (
              <ZeroGuessHint
                compact
                line1="Start typing to make your first guess!"
                line2={
                  pool.length > 0
                    ? `${pool.length} playable talent${pool.length !== 1 ? "s" : ""}`
                    : undefined
                }
              />
            )}
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}

export default function AvatarEndlessGame() {
  return (
    <Suspense fallback={null}>
      <EndlessGamePage />
    </Suspense>
  );
}

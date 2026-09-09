"use client";

import { useRef, useState } from "react";
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
import StreakResetModal from "@/components/game/StreakResetModal";
import {
  AvatarEmptyBlock,
  AvatarErrorBlock,
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";
import { MAX_GUESSES, useAvatarDailyRound } from "@/hooks/useAvatarDailyRound";

export default function AvatarGame() {
  const {
    state,
    status,
    roundStatus,
    roundError,
    validTalents,
    searchPool,
    guessesLeft,
    alreadyGuessed,
    revealedCount,
    displayGuessHistory,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    loadRound,
    makeGuess,
  } = useAvatarDailyRound();
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(searchPool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const handleGuess = (talent: Talent) => {
    if (makeGuess(talent)) clear();
  };

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title="AVATAR" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <PageHeader
            subtitle="Who is this talent?"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <StatusPill
            status={status}
            guessesLeft={guessesLeft}
            variant="daily"
          />
        </header>

        {showHowTo && <AvatarHowToPlay daily />}

        <StreakResetModal open={streakResetToast} onClose={dismissStreakResetPopup} />

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {roundStatus === "loading" && <LoadingBlock text="Loading today's avatar…" />}

        {roundStatus === "noValid" && (
          <AvatarEmptyBlock onRetry={() => void loadRound(validTalents)} />
        )}

        {roundStatus === "error" && (
          <AvatarErrorBlock message={roundError} onRetry={() => void loadRound(validTalents)} />
        )}

        {roundStatus === "ready" && state.talent && (
          <>
            <div className="holo-card p-4 mb-5">
              <CropStage
                key={state.talent.id}
                src={state.talent.avatarUrl || state.talent.photoUrl}
                areas={state.areas}
                revealedCount={revealedCount}
                fullReveal={state.gameOver}
                answerName={state.talent.name}
              />
            </div>

            {state.gameOver && (
              <GameOverBanner
                won={state.won}
                answerName={state.talent.name}
                guessCount={state.guesses.length}
                revealed={revealAnswer}
                onReveal={state.won ? undefined : () => setRevealAnswer(true)}
                message="Come back tomorrow for a new talent!"
                actions={
                  <div>
                    <ShareButton
                      text={buildAvatarShareText({
                        mode: "AVATAR",
                        guessCount: state.guesses.length,
                        maxGuesses: MAX_GUESSES,
                        guesses: state.guesses.map((g) => g.correct),
                        won: state.won,
                      })}
                    />
                  </div>
                }
              />
            )}

            {!state.gameOver && (
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

            {state.guesses.length > 0 && <AvatarGuessList guesses={displayGuessHistory} />}

            {!state.gameOver && state.guesses.length === 0 && (
              <ZeroGuessHint
                compact
                line1="Start typing to make your first guess!"
                line2={
                  searchPool.length > 0
                    ? `${searchPool.length} playable talent${searchPool.length !== 1 ? "s" : ""}`
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

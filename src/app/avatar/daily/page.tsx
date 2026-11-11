"use client";

import { useState } from "react";
import {
  Footer,
  GameOverBanner,
  Navbar,
  PageHeader,
  ShareButton,
  StatsBar,
} from "@/components/ui";
import { buildAvatarShareText } from "@/lib/share";
import AvatarHowToPlay from "@/components/avatar/AvatarHowToPlay";
import AvatarRoundBoard from "@/components/avatar/AvatarRoundBoard";
import StatusPill from "@/components/game/StatusPill";
import StreakResetModal from "@/components/game/StreakResetModal";
import { MAX_GUESSES, useAvatarDailyRound } from "@/hooks/useAvatarDailyRound";

export default function AvatarGame() {
  const {
    state,
    status,
    roundStatus,
    roundError,
    searchPool,
    guessesLeft,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    retry,
    makeGuess,
  } = useAvatarDailyRound();
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);

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

        <AvatarRoundBoard
          talent={state.talent}
          areas={state.areas}
          guesses={state.guesses}
          gameOver={state.gameOver}
          searchPool={searchPool}
          roundStatus={roundStatus}
          roundError={roundError}
          loadingText="Loading today's avatar…"
          onRetry={retry}
          onGuess={makeGuess}
          banner={
            state.gameOver && state.talent ? (
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
            ) : null
          }
        />

        <Footer />
      </div>
    </main>
  );
}

"use client";

import { Suspense, useState } from "react";
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
    retry,
    makeGuess,
    nextRound,
  } = useAvatarEndlessRound();
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
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

        <AvatarRoundBoard
          talent={roundState.round?.talent ?? null}
          areas={roundState.round?.areas ?? []}
          guesses={roundState.guesses}
          gameOver={roundState.gameOver}
          searchPool={pool}
          roundStatus={roundStatus}
          roundError={roundError}
          loadingText="Loading a new avatar…"
          onRetry={retry}
          onGuess={makeGuess}
          banner={
            roundState.gameOver && roundState.round ? (
              <GameOverBanner
                won={roundState.won}
                answerName={roundState.round.talent.name}
                guessCount={roundState.guesses.length}
                actions={
                  !roundState.won ? (
                    <div>
                      <ShareButton
                        text={buildAvatarShareText({
                          mode: "AVATAR ENDLESS",
                          guessCount: roundState.guesses.length,
                          maxGuesses: MAX_GUESSES,
                          streak: persisted.lastRunStreak,
                          guesses: roundState.guesses.map((g) => g.correct),
                        })}
                      />
                    </div>
                  ) : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => void nextRound()}
                  className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
                >
                  {roundState.won ? "Next talent →" : "New run →"}
                </button>
              </GameOverBanner>
            ) : null
          }
        />

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

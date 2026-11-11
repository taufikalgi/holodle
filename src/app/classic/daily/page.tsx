"use client";

import { useState } from "react";
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
import { MAX_GUESSES, useClassicDaily } from "@/hooks/useClassicDaily";
import StatusPill from "@/components/game/StatusPill";
import StreakResetModal from "@/components/game/StreakResetModal";
import ClassicBoard from "@/components/classic/ClassicBoard";

export default function ClassicGame() {
  const {
    state,
    talents,
    todayAnswer,
    status,
    talentsError,
    guessesLeft,
    stats,
    streakResetToast,
    dismissStreakResetPopup,
    makeGuess,
  } = useClassicDaily();
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);

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
                    photoUrl: todayAnswer.photoUrl || todayAnswer.avatarUrl,
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

        <ClassicBoard
          pool={talents ?? []}
          guesses={state.guesses}
          gameOver={state.gameOver}
          onGuess={makeGuess}
        />

        <Footer />
      </div>
    </main>
  );
}

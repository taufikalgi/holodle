"use client";

import { useState, useRef, useCallback } from "react";
import {
  getTalentOfTheDay,
  getDateString,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import { applyClassicGuess, deriveGameStatus, isStoredClassicGuess } from "@/lib/game-status";
import { useTalents } from "@/hooks/useTalents";
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
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import type { DailyStreakStats } from "@/lib/daily-streak";
import { useDailyStreak } from "@/hooks/useDailyStreak";

const MAX_GUESSES = 6;
const STORAGE_KEY = "holodle-classic-state";
const STATS_STORAGE_KEY = "holodle-classic-stats";

interface GameState {
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

type GameStats = DailyStreakStats;

function isValidGameState(data: unknown): data is GameState {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  return (
    Array.isArray(c.guesses) &&
    c.guesses.every(isStoredClassicGuess) &&
    typeof c.gameOver === "boolean" &&
    typeof c.won === "boolean" &&
    typeof c.date === "string" &&
    c.date === getDateString()
  );
}

const emptyState: GameState = { guesses: [], gameOver: false, won: false, date: getDateString() };
const emptyStats: GameStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0, lastPlayedDate: undefined };

export default function ClassicGame() {
  const [state, setState] = useLocalStorageState<GameState>(STORAGE_KEY, emptyState, isValidGameState);
  const { stats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver } =
    useDailyStreak(STATS_STORAGE_KEY, emptyStats);
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { talents, loading: talentsLoading, error: talentsError } = useTalents();
  const todayAnswer = talents ? getTalentOfTheDay(talents) : null;
  const status = deriveGameStatus({
    loading: talentsLoading,
    error: talentsError,
    empty: !talents || talents.length === 0 || !todayAnswer,
    gameOver: state.gameOver,
    won: state.won,
  });
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch(talents ?? []);

  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  if (status === "loading") {
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="CLASSIC" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
            Loading talents…
          </p>
        </div>
      </main>
    );
  }

  if (status === "error" || status === "empty" || !todayAnswer) {
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="CLASSIC" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
            {talentsError || "Failed to load talents."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--holo-blue)" }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver || !todayAnswer) return;
      const transition = applyClassicGuess(state.guesses, talent, todayAnswer, MAX_GUESSES);
      if (!transition) return;
      const newState: GameState = { ...transition, date: getDateString() };
      setState(newState);
      if (transition.gameOver) {
        recordDailyGameOver(getDateString(), transition.won);
      }
      clear();
    },
    [state, todayAnswer, setState, recordDailyGameOver, clear]
  );

  const displayCurrentHistory = state.guesses
    .map((g) => ({ talent: g.talent, result: g.result }))
    .reverse();

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="CLASSIC" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "var(--holo-bg-card)",
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            {status === "won" ? (
              <>
                <span className="text-green-500">●</span> You found them! 🎉
              </>
            ) : status === "lost" ? (
              <>
                <span className="text-red-400">●</span> Game over — come back tomorrow!
              </>
            ) : (
              <>
                <span style={{ color: "var(--holo-blue)" }}>●</span> {guessesLeft} guess
                {guessesLeft !== 1 ? "es" : ""} remaining
              </>
            )}
          </div>
        </header>

        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={true} />}

        {streakResetToast && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={dismissStreakResetPopup}
            role="dialog"
            aria-modal="true"
            aria-label="Streak reset"
          >
            <div
              className="holo-card w-full max-w-sm p-6 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={dismissStreakResetPopup}
                aria-label="Close"
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--holo-off-white)", color: "var(--holo-text-muted)" }}
              >
                ✕
              </button>
              <h3 className="font-black text-sm tracking-widest uppercase" style={{ color: "var(--holo-text)" }}>
                Streak reset
              </h3>
              <p className="text-sm mt-2 font-semibold" style={{ color: "var(--holo-text-muted)" }}>
                You missed a day. Your streak was reset to 0. Win today to start a new streak!
              </p>
              <button
                type="button"
                onClick={dismissStreakResetPopup}
                className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: "var(--holo-blue)" }}
              >
                Got it
              </button>
            </div>
          </div>
        )}

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
            onGuess={makeGuess}
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

        {status === "playing" && state.guesses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing above to make your first guess!
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              {(talents ?? []).length} talents in the pool
            </p>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}

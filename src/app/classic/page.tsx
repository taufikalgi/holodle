"use client";

import { useState, useRef, useCallback } from "react";
import {
  ALL_TALENTS,
  getTalentOfTheDay,
  getDateString,
  compareTalents,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
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
  const todayAnswer = getTalentOfTheDay();
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch();

  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver) return;
      if (state.guesses.some((g) => g.talent.name === talent.name)) return;
      const result = compareTalents(talent, todayAnswer);
      const won = talent.name === todayAnswer.name;
      const newGuesses = [...state.guesses, { talent, result }];
      const gameOver = won || newGuesses.length >= MAX_GUESSES;
      const newState: GameState = { guesses: newGuesses, gameOver, won, date: getDateString() };
      setState(newState);
      if (gameOver) {
        recordDailyGameOver(getDateString(), won);
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
            {state.gameOver ? (
              state.won ? (
                <>
                  <span className="text-green-500">●</span> You found them! 🎉
                </>
              ) : (
                <>
                  <span className="text-red-400">●</span> Game over — come back tomorrow!
                </>
              )
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

        {state.gameOver && (
          <GameOverBanner
            won={state.won}
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

        {!state.gameOver && (
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

        {!state.gameOver && state.guesses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing above to make your first guess!
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              {ALL_TALENTS.length} talents in the pool
            </p>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ALL_TALENTS,
  getTalentOfTheDay,
  searchTalents,
  compareTalents,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import {
  ColumnHeaders,
  Footer,
  GuessRow,
  HowToPlay,
  Navbar,
  PageHeader,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";

const MAX_GUESSES = 6;
const STORAGE_KEY = "holodle-classic-state";
const STATS_STORAGE_KEY = "holodle-classic-stats";

interface GameState {
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

interface GameStats {
  streak: number;
  bestStreak: number;
  totalPlayed: number;
  totalWon: number;
}

function getDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getInitialState(): GameState {
  const today = getDateString();
  const empty: GameState = { guesses: [], gameOver: false, won: false, date: today };
  if (typeof window === "undefined") return empty;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;
      if (parsed.date === today) return parsed;
    }
  } catch {}
  return empty;
}

function getStats(): GameStats {
  const empty: GameStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 };
  if (typeof window === "undefined") return empty;
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameStats;
    }
  } catch {}
  return empty;
}

export default function ClassicGame() {
  const [state, setState] = useState<GameState>(getInitialState);
  const [stats, setStats] = useState<GameStats>(getStats);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const todayAnswer = getTalentOfTheDay();
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    if (val.trim().length > 0) {
      setSuggestions(searchTalents(val));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  const saveToStorage = <T,>(key: string, value: T) =>
    localStorage.setItem(key, JSON.stringify(value));

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
      saveToStorage(STORAGE_KEY, newState);
      if (gameOver) {
        const newStats: GameStats = {
          streak: won ? stats.streak + 1 : 0,
          bestStreak: won ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
          totalPlayed: stats.totalPlayed + 1,
          totalWon: won ? stats.totalWon + 1 : stats.totalWon,
        };
        setStats(newStats);
        saveToStorage(STATS_STORAGE_KEY, newStats);
      }
      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    },
    [state, stats, todayAnswer]
  );

  const alreadyGuessed = state.guesses.map((g) => g.talent.name);
  const filteredSuggestions = suggestions.filter((t) => !alreadyGuessed.includes(t.name));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      )
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="CLASSIC" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "white",
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

        {/* How to play */}
        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={true} />}

        {/* Stats bar */}
        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {/* Game over banner */}
        {state.gameOver && (
          <div
            className={`${state.won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
          >
            {state.won ? (
              <>
                <div className="text-3xl mb-2">🎊</div>
                <h2 className="text-xl font-black text-green-600 mb-1">Yatta! ✨</h2>
                <p className="text-sm text-green-700">
                  You found <strong>{todayAnswer.name}</strong> in {state.guesses.length} guess
                  {state.guesses.length !== 1 ? "es" : ""}!
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">😔</div>
                <h2 className="text-xl font-black text-red-500 mb-1">Dame datta...</h2>
                <p className="text-sm text-red-600">
                  The answer was{" "}
                  <button
                    onClick={() => setRevealAnswer(true)}
                    className="font-black underline hover:no-underline"
                  >
                    {revealAnswer ? todayAnswer.name : "click to reveal"}
                  </button>
                </p>
                {revealAnswer && (
                  <p className="text-xs text-red-400 mt-1">
                    <img
                      src={todayAnswer.image}
                      alt={todayAnswer.name}
                      className="w-16 h-16 center mx-auto my-2 rounded-full object-cover flex-shrink-0"
                    />{" "}
                    {todayAnswer.branch} • {todayAnswer.debutYear} • {todayAnswer.loreArchetype}
                  </p>
                )}
              </>
            )}
            <p className="text-xs mt-3 opacity-60">Come back tomorrow for a new talent!</p>
          </div>
        )}

        {!state.gameOver && (
          <TalentSearchInput
            input={input}
            suggestions={filteredSuggestions}
            showDropdown={showDropdown}
            onInput={handleInput}
            onGuess={makeGuess}
            onClear={() => {
              setInput("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            onFocus={() => input && filteredSuggestions.length > 0 && setShowDropdown(true)}
            dropdownRef={dropdownRef}
          />
        )}

        {/* Column headers */}
        {state.guesses.length > 0 && (
          <ColumnHeaders
            headers={["Talent", "Branch", "Debut Year", "Archetype", "Height", "Birth Month"]}
          />
        )}

        {/* Rows */}
        <div className="space-y-2">
          {state.guesses.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {/* Empty state */}
        {!state.gameOver && state.guesses.length === 0 && (
          <div className="text-center py-14">
            <div className="text-6xl mb-4 opacity-20">🎭</div>
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing above to make your first guess!
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              {ALL_TALENTS.length} talents in the pool
            </p>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}

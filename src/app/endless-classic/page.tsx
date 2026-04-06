"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ALL_TALENTS,
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
const STATS_KEY = "holodle-endless-stats";

interface EndlessState {
  current: {
    answer: Talent;
    guesses: { talent: Talent; result: CompareResult }[];
    gameOver: boolean;
    won: boolean;
  };
  stats: {
    streak: number;
    bestStreak: number;
    totalPlayed: number;
    totalWon: number;
  };
  recentTalents: string[];
}

function getRandomTalent(exclude: string[] = []): Talent {
  const pool = ALL_TALENTS.filter((t) => !exclude.includes(t.name));
  const source = pool.length > 0 ? pool : ALL_TALENTS;
  return source[Math.floor(Math.random() * source.length)];
}

function getInitialState(): EndlessState {
  const defaultStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 };
  let stats = defaultStats;
  let recentTalents: string[] = [];

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        stats = parsed.stats ?? defaultStats;
        recentTalents = parsed.recentTalents ?? [];
      }
    } catch {}
  }

  const answer = getRandomTalent(recentTalents);
  return {
    current: { answer, guesses: [], gameOver: false, won: false },
    stats,
    recentTalents: [...recentTalents, answer.name].slice(-20),
  };
}

export default function EndlessGame() {
  const [state, setState] = useState<EndlessState>(getInitialState);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { current, stats } = state;
  const guessesLeft = MAX_GUESSES - current.guesses.length;
  const alreadyGuessed = current.guesses.map((g) => g.talent.name);

  useEffect(() => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        stats: state.stats,
        recentTalents: state.recentTalents,
      })
    );
  }, [state.stats, state.recentTalents]);

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      if (val.trim().length > 0) {
        setSuggestions(searchTalents(val).filter((t) => !alreadyGuessed.includes(t.name)));
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    },
    [alreadyGuessed]
  );

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (current.gameOver) return;
      const result = compareTalents(talent, current.answer);
      const won = talent.name === current.answer.name;
      const newGuesses = [...current.guesses, { talent, result }];
      const gameOver = won || newGuesses.length >= MAX_GUESSES;

      setState((prev) => ({
        ...prev,
        current: { ...prev.current, guesses: newGuesses, gameOver, won },
        stats: gameOver
          ? {
              streak: won ? prev.stats.streak + 1 : 0,
              bestStreak: won
                ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
                : prev.stats.bestStreak,
              totalPlayed: prev.stats.totalPlayed + 1,
              totalWon: prev.stats.totalWon + (won ? 1 : 0),
            }
          : prev.stats,
      }));

      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    },
    [current]
  );

  function nextRound() {
    const next = getRandomTalent(state.recentTalents);
    setState((prev) => ({
      ...prev,
      current: { answer: next, guesses: [], gameOver: false, won: false },
      recentTalents: [...prev.recentTalents, next.name].slice(-20),
    }));
    setInput("");
  }

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
      <Navbar title="ENDLESS" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <h1
            className="text-4xl font-black tracking-widest mb-1"
            style={{ fontFamily: "'Poppins', sans-serif", color: "var(--holo-text)" }}
          ></h1>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "white",
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            {current.gameOver ? (
              current.won ? (
                "Correct! Ready for the next one?"
              ) : (
                "Wrong — try the next one!"
              )
            ) : (
              <>
                <span style={{ color: "var(--holo-blue)" }}>●</span> {guessesLeft} guess
                {guessesLeft !== 1 ? "es" : ""} remaining
              </>
            )}
          </div>
        </div>

        {/* How to play */}
        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={false} />}

        {/* Stats bar */}
        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {/* Game over */}
        {current.gameOver && (
          <div
            className={`${current.won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
          >
            {current.won ? (
              <>
                <div className="text-3xl mb-1">🎊</div>
                <h2 className="text-xl font-black text-green-600">Correct!</h2>
                <p className="text-sm text-green-700 mt-1">
                  It was <strong>{current.answer.name}</strong> — {current.guesses.length} guess
                  {current.guesses.length !== 1 ? "es" : ""}
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">😔</div>
                <h2 className="text-xl font-black text-red-500">Not quite!</h2>
                <p className="text-sm text-red-600 mt-1">
                  It was <strong>{current.answer.name}</strong>
                </p>
              </>
            )}
            <button
              onClick={nextRound}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--holo-blue)" }}
            >
              Next talent →
            </button>
          </div>
        )}

        {/* Input */}
        {!current.gameOver && (
          <TalentSearchInput
            input={input}
            suggestions={suggestions}
            showDropdown={showDropdown}
            onInput={handleInput}
            onGuess={makeGuess}
            onClear={() => {
              setInput("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            onFocus={() => input && suggestions.length > 0 && setShowDropdown(true)}
            dropdownRef={dropdownRef}
          />
        )}

        {/* Column headers */}
        {current.guesses.length > 0 && (
          <ColumnHeaders
            headers={[
              "Talent",
              "Name",
              "Branch",
              "Debut Year",
              "Archetype",
              "Height",
              "Birth Month",
            ]}
          />
        )}

        {/* Guess rows */}
        <div className="space-y-2">
          {current.guesses.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {/* Empty state */}
        {!current.gameOver && current.guesses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing to make your first guess!
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

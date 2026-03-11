"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  ALL_TALENTS,
  searchTalents,
  compareTalents,
  type Talent,
  type CompareResult,
} from "@/lib/talents";

const MAX_GUESSES = 5;
const STATS_KEY = "hololive-endless-stats";

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

function HeightLabel({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    smol: "Smol (<150)",
    med: "Med (150–160)",
    tall: "Tall (>160)",
  };
  return <>{map[cat] || cat}</>;
}

function Cell({
  label,
  status,
  delay,
}: {
  label: React.ReactNode;
  status: "correct" | "wrong" | "higher" | "lower";
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const cls =
    status === "correct" || status === "higher" || status === "lower"
      ? "cell-correct"
      : "cell-wrong";
  return (
    <div
      className={`flex items-center justify-center text-center px-2 py-3 rounded-xl text-sm min-h-[54px] border transition-all duration-500 ${visible ? cls : "opacity-0 scale-90 bg-gray-100 border-gray-200"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {label}
    </div>
  );
}

function GuessRow({
  guess,
  result,
  index,
}: {
  guess: Talent;
  result: CompareResult;
  index: number;
}) {
  const base = index * 80;
  return (
    <div className="grid grid-cols-6 gap-2 row-reveal" style={{ animationDelay: `${base}ms` }}>
      <div className="flex items-center justify-center text-center px-2 py-3 rounded-xl text-sm font-bold min-h-[54px] bg-white border-2 border-[#00B4D8]/30 text-[#0077A3]">
        <img
          src={guess.image}
          alt={guess.name}
          className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
        />
        <span className="leading-tight text-xs">{guess.name}</span>
      </div>
      <Cell label={guess.branch} status={result.branch} delay={base + 80} />
      <Cell
        label={
          <>
            {guess.debutYear}
            {result.debutYear === "higher" && <span className="ml-1">↑</span>}
            {result.debutYear === "lower" && <span className="ml-1">↓</span>}
          </>
        }
        status={result.debutYear === "correct" ? "correct" : "wrong"}
        delay={base + 160}
      />
      <Cell label={guess.loreArchetype} status={result.loreArchetype} delay={base + 240} />
      <Cell
        label={<HeightLabel cat={guess.heightCategory} />}
        status={result.heightCategory}
        delay={base + 320}
      />
      <Cell label={guess.zodiac} status={result.zodiac} delay={base + 400} />
    </div>
  );
}

export default function EndlessGame() {
  const [state, setState] = useState<EndlessState>(getInitialState);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-4xl font-black tracking-widest mb-1"
            style={{ fontFamily: "'Poppins', sans-serif", color: "var(--holo-text)" }}
          ></h1>
          <p className="text-sm" style={{ color: "var(--holo-text-muted)" }}>
            {current.gameOver
              ? current.won
                ? "Correct! Ready for the next one?"
                : "Wrong — try the next one!"
              : `${guessesLeft} guess${guessesLeft !== 1 ? "es" : ""} remaining`}
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 justify-center mb-6">
          {[
            { value: stats.streak, label: "Streak" },
            { value: stats.bestStreak, label: "Best" },
            { value: stats.totalPlayed, label: "Played" },
            {
              value: stats.totalPlayed
                ? Math.round((stats.totalWon / stats.totalPlayed) * 100) + "%"
                : "0%",
              label: "Win rate",
            },
          ].map(({ value, label }) => (
            <div key={label} className="holo-card px-4 py-2 text-center flex-1">
              <div className="text-xl font-black" style={{ color: "var(--holo-blue)" }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

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
          <div className="holo-card p-4 mb-5">
            <p
              className="text-xs uppercase tracking-widest font-bold mb-3"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Type a talent name
            </p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                onFocus={() => input && suggestions.length > 0 && setShowDropdown(true)}
                placeholder="e.g. Pekora, Suisei…"
                className="holo-input w-full rounded-xl px-4 py-3 text-sm"
                autoComplete="off"
              />
              {input && (
                <button
                  onClick={() => {
                    setInput("");
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--holo-text-muted)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {showDropdown && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="mt-2 rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--holo-border)", background: "white" }}
              >
                {suggestions.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => makeGuess(t)}
                    className="dropdown-item w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-0 transition-colors"
                    style={{ borderColor: "var(--holo-border)" }}
                  >
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover mr-1 flex-shrink-0"
                    />
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                        {t.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && input.length > 1 && suggestions.length === 0 && (
              <div
                className="mt-2 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--holo-border)",
                  color: "var(--holo-text-muted)",
                  background: "white",
                }}
              >
                No talents found — try a different name!
              </div>
            )}
          </div>
        )}

        {/* Column headers */}
        {current.guesses.length > 0 && (
          <div className="grid grid-cols-6 gap-2 px-1 mb-2">
            {["Talent", "Branch", "Debut Year", "Archetype", "Height", "Zodiac"].map((h) => (
              <div
                key={h}
                className="text-center text-xs uppercase tracking-wider font-bold py-1"
                style={{ color: "var(--holo-text-muted)" }}
              >
                {h}
              </div>
            ))}
          </div>
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
      </div>
    </main>
  );
}

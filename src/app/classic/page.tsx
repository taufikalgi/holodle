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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MAX_GUESSES = 5;
const STORAGE_KEY = "hololdle-state";

interface GameState {
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  won: boolean;
  date: string;
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
        {/* <span className="mr-1 text-base">{guess.image}</span> */}
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
      <Cell
        label={guess.hasSololive ? "✓ Yes" : "✗ No"}
        status={result.hasSololive}
        delay={base + 400}
      />
    </div>
  );
}

export default function Home() {
  const [state, setState] = useState<GameState>(getInitialState);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    },
    [state, todayAnswer]
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
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-8" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#00B4D8]" />
                <span className="text-[#00B4D8] text-xs">✦</span>
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#00B4D8]" />
              </div>
              <h1
                className="text-5xl font-black tracking-widest"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="shimmer-text">HOLO</span>
                <span style={{ color: "var(--holo-text)" }}>DLE</span>
              </h1>
              <p
                className="text-xs tracking-[0.25em] uppercase mt-1"
                style={{ color: "var(--holo-text-muted)" }}
              >
                Daily Hololive Talent Guessing Game
              </p>
            </div>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              title="How to play"
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors"
              style={{
                borderColor: "var(--holo-blue)",
                color: "var(--holo-blue)",
                background: "white",
              }}
            >
              ?
            </button>
          </div>

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
        {showHowTo && (
          <div className="holo-card p-5 mb-5 animate-slide-down">
            <h2
              className="font-black text-sm tracking-widest uppercase mb-3"
              style={{ color: "var(--holo-blue-dark)" }}
            >
              How to Play
            </h2>
            <ul className="text-sm space-y-2" style={{ color: "var(--holo-text-muted)" }}>
              <li>
                🎯 Guess the secret Hololive talent in{" "}
                <strong style={{ color: "var(--holo-text)" }}>5 tries</strong>
              </li>
              <li>
                🟢 <span className="text-green-600 font-semibold">Green</span> = correct attribute
              </li>
              <li>
                🔴 <span className="text-red-500 font-semibold">Red</span> = wrong attribute
              </li>
              <li>↑↓ Arrows on Debut Year = the correct year is higher or lower</li>
              <li>⏰ A new talent is chosen every day at midnight!</li>
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="tag-correct rounded-lg px-2 py-1.5 text-center font-semibold">
                Branch: JP ✓
              </div>
              <div className="tag-wrong rounded-lg px-2 py-1.5 text-center font-semibold">
                Year: 2020 ↑
              </div>
              <div className="tag-correct rounded-lg px-2 py-1.5 text-center font-semibold">
                Sololive: Yes ✓
              </div>
            </div>
          </div>
        )}

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

        {/* Input */}
        {!state.gameOver && (
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
                onFocus={() => input && filteredSuggestions.length > 0 && setShowDropdown(true)}
                placeholder="e.g. Gawr Gura, Pekora, Suisei…"
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

            {showDropdown && filteredSuggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="mt-2 rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--holo-border)", background: "white" }}
              >
                {filteredSuggestions.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => makeGuess(t)}
                    className="dropdown-item w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-0 transition-colors"
                    style={{ borderColor: "var(--holo-border)" }}
                  >
                    {/* <span className="text-xl">{t.image}</span> */}
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
                        {t.branch} • {t.debutYear} • {t.loreArchetype}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && input.length > 1 && filteredSuggestions.length === 0 && (
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
        {state.guesses.length > 0 && (
          <div className="grid grid-cols-6 gap-2 px-1 mb-2">
            {["Talent", "Branch", "Debut Year", "Archetype", "Height", "Sololive"].map((h) => (
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

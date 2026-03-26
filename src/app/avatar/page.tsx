"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/ui/Navbar";
import { ALL_TALENTS, Keypoint, searchTalents, type Talent } from "@/lib/talents";
import Footer from "@/components/ui/Footer";

const MAX_GUESSES = 5;
const STORAGE_KEY = "holodle-avatar-state";

// Zoom levels per attempt: starts very zoomed in, progressively wider
// const CROP_LEVELS = [
//   { zoom: 4, label: "Very zoomed in" },
//   { zoom: 3, label: "Zoomed in" },
//   { zoom: 2.2, label: "Closer..." },
//   { zoom: 1.6, label: "Almost there..." },
//   { zoom: 1, label: "Full image" },
// ];

interface PhotoState {
  guesses: { talent: Talent; correct: boolean }[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

function getDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTalentOfTheDay(): Talent {
  // Simple seeded random based on date
  const today = getDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
  }
  // Use a different offset than classic so they don't always match
  // const index = (hash + 42) % ALL_TALENTS.length;
  const index = (hash + 42) % 5; // current data with keypoints
  return ALL_TALENTS[index];
  // return ALL_TALENTS[4];
}

function getInitialState(): PhotoState {
  const today = getDateString();
  const empty: PhotoState = { guesses: [], gameOver: false, won: false, date: today };
  if (typeof window === "undefined") return empty;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PhotoState;
      if (parsed.date === today) return parsed;
    }
  } catch {}
  return empty;
}

function PhotoCrop({
  src,
  keypoint,
  revealed,
}: {
  src: string;
  keypoint: Keypoint | null;
  revealed: boolean;
}) {
  const [displayed, setDisplayed] = useState(keypoint);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (keypoint === displayed) return;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayed(keypoint);
      setVisible(true);
    }, 300);
    return () => clearTimeout(t);
  }, [keypoint]);

  const focal = displayed ?? { x: 50, y: 20, zoom: 1, label: "" };

  return (
    <div className="w-full h-72 overflow-hidden rounded-2xl relative bg-gray-100">
      <img
        src={src}
        alt="Mystery talent"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: "cover",
          objectPosition: `${focal.x}% ${focal.y}%`,
          transform: `scale(${revealed ? 1 : focal.zoom})`,
          transformOrigin: `${focal.x}% ${focal.y}%`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

export default function PhotoGame() {
  const [state, setState] = useState<PhotoState>(getInitialState);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Talent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayAnswer = getTalentOfTheDay();
  const guessCount = state.guesses.length;
  //   const cropLevel = CROP_LEVELS[Math.min(guessCount, CROP_LEVELS.length - 1)];
  const currentKeypoint = todayAnswer.keypoints?.[guessCount] ?? null;
  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
      if (state.gameOver) return;
      const correct = talent.name === todayAnswer.name;
      const newGuesses = [...state.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      const newState: PhotoState = {
        guesses: newGuesses,
        gameOver,
        won: correct,
        date: getDateString(),
      };
      setState(newState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    },
    [state, todayAnswer]
  );

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
      <Navbar title="AVATAR" />

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-black tracking-widest"
            style={{ fontFamily: "'Poppins', sans-serif", color: "var(--holo-text)" }}
          >
            Who is this? 📸
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--holo-text-muted)" }}>
            {state.gameOver
              ? state.won
                ? "You got it! 🎉"
                : "Better luck tomorrow!"
              : `Hint ${guessCount + 1} of ${Math.min(MAX_GUESSES, todayAnswer.keypoints?.length ?? MAX_GUESSES)}`}
          </p>
        </div>

        {/* Photo with crop/zoom effect */}
        <div
          className="holo-card mb-6 overflow-hidden flex items-center justify-center"
          style={{ height: 280 }}
        >
          {todayAnswer.photoUrl ? (
            <PhotoCrop
              src={todayAnswer.photoUrl}
              keypoint={
                state.gameOver
                  ? null
                  : (todayAnswer.keypoints?.[guessCount] ?? todayAnswer.keypoints?.[0] ?? null)
              }
              revealed={state.gameOver}
            />
          ) : (
            <div
              className="w-full h-72 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40"
              style={{ background: "var(--holo-border)" }}
            >
              <span className="text-6xl">🖼️</span>
              <p className="text-sm" style={{ color: "var(--holo-text-muted)" }}>
                Add photoUrl + keypoints to talent data
              </p>
            </div>
          )}
        </div>

        {/* Hint list */}
        {state.guesses.length > 0 && (
          <div className="holo-card p-4 mb-5 space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Your guesses
            </p>
            {state.guesses.map(({ talent, correct }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold ${correct ? "cell-correct" : "cell-wrong"}`}
              >
                {talent.image ? (
                  <img
                    src={talent.image}
                    alt={talent.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span>{talent.image}</span>
                )}
                <span>{talent.name}</span>
                <span className="ml-auto">{correct ? "✓ Correct!" : "✗ Wrong"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Game over */}
        {state.gameOver && (
          <div
            className={`${state.won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
          >
            {state.won ? (
              <>
                <div className="text-3xl mb-1">🎊</div>
                <h2 className="text-xl font-black text-green-600">Yatta!</h2>
                <p className="text-sm text-green-700 mt-1">
                  It was <strong>{todayAnswer.name}</strong> — found in {guessCount} guess
                  {guessCount !== 1 ? "es" : ""}!
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">😔</div>
                <h2 className="text-xl font-black text-red-500">Dame datta...</h2>
                <p className="text-sm text-red-600 mt-1">
                  It was{" "}
                  <button onClick={() => setRevealAnswer(true)} className="font-black underline">
                    {revealAnswer ? todayAnswer.name : "click to reveal"}
                  </button>
                </p>
              </>
            )}
            <p className="text-xs mt-3 opacity-50">Come back tomorrow!</p>
          </div>
        )}

        {/* Input */}
        {!state.gameOver && (
          <div className="holo-card p-4">
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
                placeholder="e.g. Gawr Gura, Pekora…"
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
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <span className="text-xl">{t.image}</span>
                    )}
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
                        {t.branch} • {t.debutYear}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

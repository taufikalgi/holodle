"use client";

import { useState, useRef, useCallback } from "react";
import { ALL_TALENTS, getDateString, Keypoint, type Talent } from "@/lib/talents";
import {
  Footer,
  GameOverBanner,
  Navbar,
  TalentSearchInput,
} from "@/components/ui";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";

const MAX_GUESSES = 5;
const STORAGE_KEY = "holodle-avatar-state";

interface PhotoState {
  guesses: { talent: Talent; correct: boolean }[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

function getTalentOfTheDay(): Talent {
  const today = getDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
  }
  const index = 0;
  return ALL_TALENTS[index];
}

function isValidPhotoState(data: unknown): data is PhotoState {
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

const emptyState: PhotoState = { guesses: [], gameOver: false, won: false, date: getDateString() };

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

  useState(() => {
    if (keypoint !== displayed) {
      setVisible(false);
      const t = setTimeout(() => {
        setDisplayed(keypoint);
        setVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }
  });

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
  const [state, setState] = useLocalStorageState<PhotoState>(STORAGE_KEY, emptyState, isValidPhotoState);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch();

  const todayAnswer = getTalentOfTheDay();
  const guessCount = state.guesses.length;
  const alreadyGuessed = state.guesses.map((g) => g.talent.name);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver) return;
      const correct = talent.name === todayAnswer.name;
      const newGuesses = [...state.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      setState({
        guesses: newGuesses,
        gameOver,
        won: correct,
        date: getDateString(),
      });
      clear();
    },
    [state, todayAnswer, setState, clear]
  );

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
              : `Underdevelopment - add keypoints to talent data for hints!`}
          </p>
        </div>

        <div
          className="holo-card mb-6 overflow-hidden flex items-center justify-center"
          style={{ height: 280 }}
        />

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
                {talent.avatarUrl ? (
                  <img
                    src={talent.avatarUrl}
                    alt={talent.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">🖼️</span>
                )}
                <span>{talent.name}</span>
                <span className="ml-auto">{correct ? "✓ Correct!" : "✗ Wrong"}</span>
              </div>
            ))}
          </div>
        )}

        {state.gameOver && (
          <GameOverBanner
            won={state.won}
            answerName={todayAnswer.name}
            guessCount={guessCount}
            revealed={revealAnswer}
            onReveal={state.won ? undefined : () => setRevealAnswer(true)}
            message="Come back tomorrow!"
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
            renderSuggestion={(t) => (
              <>
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-xl">🖼️</span>
                )}
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
                    {t.branch} • {t.debutYear}
                  </div>
                </div>
              </>
            )}
          />
        )}
      </div>
      <Footer />
    </main>
  );
}

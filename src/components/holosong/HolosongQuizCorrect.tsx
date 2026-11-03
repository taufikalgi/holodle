"use client";

import { useEffect, useState } from "react";
import type { HolosongQuizOption } from "@/lib/holosong-quiz-api";

export default function HolosongQuizCorrect({
  option,
  seconds = 3,
  onNext,
}: {
  option: HolosongQuizOption;
  seconds?: number;
  onNext: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    const timeout = window.setTimeout(onNext, seconds * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [onNext, seconds]);

  return (
    <div className="win-banner rounded-2xl p-5 mb-5 text-center animate-bounce-in">
      <div className="text-3xl mb-2">🎊</div>
      <h2 className="text-xl font-black mb-1 text-green-600">Correct!</h2>

      <div className="mt-4 flex flex-col items-center gap-2">
        {option.artwork_url && (
          <img
            src={option.artwork_url}
            alt={option.title}
            className="w-24 h-24 rounded-xl object-cover"
          />
        )}
        <p className="text-base font-black text-[var(--holo-text)]">{option.title}</p>
        <p className="text-sm text-[var(--holo-text-muted)]">{option.artist}</p>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          Next round →
        </button>
        <p className="text-xs font-semibold text-[var(--holo-text-muted)]">Next in {remaining}s…</p>
      </div>
    </div>
  );
}

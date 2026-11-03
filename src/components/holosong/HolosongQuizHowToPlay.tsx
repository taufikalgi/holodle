"use client";

import { HOLOSONG_QUIZ_CLIP_SECONDS } from "@/lib/holosong-quiz-api";

export default function HolosongQuizHowToPlay({
  endless,
}: {
  endless: boolean;
}) {
  return (
    <div className="holo-card p-5 mb-5 animate-slide-down">
      <h2 className="font-black text-sm tracking-widest uppercase mb-3 text-[var(--holo-blue-dark)]">
        How to Play
      </h2>
      <ul className="text-sm space-y-2 text-[var(--holo-text-muted)]">
        <li>
          🎧 Listen to a{" "}
          <strong className="text-[var(--holo-text)]">
            {HOLOSONG_QUIZ_CLIP_SECONDS}-second clip
          </strong>{" "}
          starting at a random point in the song
        </li>
        <li>
          🎯 Pick one of{" "}
          <strong className="text-[var(--holo-text)]">three options</strong> —
          you get one guess per round
        </li>
        <li>🔁 Replay the clip as often as you want — no timer</li>
        <li>🫥 The answer is revealed immediately after you choose</li>
        {endless ? (
          <li>
            🔥 A correct pick advances to a new song. One wrong pick ends the
            run.
          </li>
        ) : (
          <li>
            📅 Daily is one shared song for everyone. Come back tomorrow for a
            new one.
          </li>
        )}
      </ul>
    </div>
  );
}

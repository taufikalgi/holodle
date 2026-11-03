"use client";

import type { HolosongQuizSession } from "@/lib/holosong-quiz-api";

export default function HolosongQuizResult({
  session,
  endless,
  onNewRun,
}: {
  session: HolosongQuizSession;
  endless: boolean;
  onNewRun?: () => void;
}) {
  const won = session.status === "won";
  const answer = session.answer;

  return (
    <div
      className={`${won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
    >
      <div className="text-3xl mb-2">{won ? "🎊" : "😔"}</div>
      <h2 className={`text-xl font-black mb-1 ${won ? "text-green-600" : "text-red-500"}`}>
        {won ? "Yatta! ✨" : endless ? "Run over!" : "Dame datta..."}
      </h2>

      {answer && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {answer.artwork_url && (
            <img
              src={answer.artwork_url}
              alt={answer.title}
              className="w-24 h-24 rounded-xl object-cover"
            />
          )}
          <p className="text-base font-black text-[var(--holo-text)]">{answer.title}</p>
          <p className="text-sm text-[var(--holo-text-muted)]">
            {[answer.artist, answer.album].filter(Boolean).join(" • ")}
          </p>
          {answer.track_view_url && (
            <a
              href={answer.track_view_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold underline text-[var(--holo-blue-dark)]"
            >
              Open in Apple Music
            </a>
          )}
        </div>
      )}

      {endless && (
        <div className="mt-4 grid grid-cols-2 gap-1 text-xs font-semibold text-[var(--holo-text-muted)]">
          <span>
            Rounds won: {session.rounds_won}/{session.rounds_played}
          </span>
          <span>Best streak: {session.longest_streak} 🔥</span>
          <span>Current streak: {session.current_streak}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onNewRun && (
          <button
            type="button"
            onClick={onNewRun}
            className="mt-3 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
          >
            New run →
          </button>
        )}
      </div>

      {!endless && <p className="text-xs mt-3 opacity-60">Come back tomorrow for a new song!</p>}
    </div>
  );
}

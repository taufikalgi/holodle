"use client";

import type { HolosongQuizSession, HolosongQuizStats } from "@/lib/holosong-quiz-api";
import { buildHolosongQuizShareText } from "@/lib/share";
import { ShareButton } from "@/components/ui";
import { HolosongAnswerCard } from "./HolosongAnswerCard";

export default function HolosongQuizResult({
  session,
  endless,
  stats,
  onNewRun,
}: {
  session: HolosongQuizSession;
  endless: boolean;
  stats?: HolosongQuizStats | null;
  onNewRun?: () => void;
}) {
  const won = session.status === "won";
  const answer = session.answer;
  const guesses = session.board.map((guess) => guess.correct);

  const shareText = buildHolosongQuizShareText({
    mode: endless ? "ENDLESS" : "DAILY",
    guesses,
    roundsWon: session.rounds_won,
    roundsPlayed: session.rounds_played,
    bestStreak: session.longest_streak,
  });

  const careerBest = stats?.endless.best_streak ?? 0;

  return (
    <div
      className={`${won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{won ? "🎊" : "😔"}</div>
        <h2 className={`text-xl font-black mb-1 ${won ? "text-green-600" : "text-red-500"}`}>
          {won ? "Yatta! ✨" : endless ? "Run over!" : "Dame datta..."}
        </h2>
        {!endless && (
          <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
            {won ? "You got today's song." : "Today's song was:"}
          </p>
        )}
      </div>

      {answer && (
        <div className="mt-4">
          <HolosongAnswerCard answer={answer} />
        </div>
      )}

      {endless && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border px-3 py-2 text-center border-black/10 bg-white/50 dark:border-white/15 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
              Rounds won
            </div>
            <div className="text-sm font-black text-[var(--holo-text)]">
              {session.rounds_won}/{session.rounds_played}
            </div>
          </div>
          <div className="rounded-xl border px-3 py-2 text-center border-black/10 bg-white/50 dark:border-white/15 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
              Best streak
            </div>
            <div className="text-sm font-black text-[var(--holo-text)]">
              {session.longest_streak} 🔥
            </div>
          </div>
          <div className="rounded-xl border px-3 py-2 text-center border-black/10 bg-white/50 dark:border-white/15 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
              Career best
            </div>
            <div className="text-sm font-black text-[var(--holo-text)]">{careerBest}</div>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onNewRun && (
          <button
            type="button"
            onClick={onNewRun}
            className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
          >
            New run →
          </button>
        )}
        <ShareButton
          text={shareText}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        />
      </div>

      {!endless && (
        <p className="text-xs mt-3 text-center opacity-60">
          Come back tomorrow for a new song!
        </p>
      )}
    </div>
  );
}

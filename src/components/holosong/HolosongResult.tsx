import ShareButton from "@/components/ui/ShareButton";
import { formatHolosongWinRate } from "@/lib/holosong-api";
import type { HolosongSession } from "@/lib/holosong-api";
import { HolosongAnswerCard } from "./HolosongAnswerCard";

export default function HolosongResult({
  session,
  shareText,
  message,
  endless = false,
  onNewRun,
}: {
  session: HolosongSession;
  shareText: string;
  message?: string;
  endless?: boolean;
  onNewRun?: () => void;
}) {
  const won = session.status === "won";
  const answer = session.answer;

  return (
    <div
      className={`${won ? "win-banner" : "lose-banner"} rounded-2xl p-5 mb-5 text-center animate-bounce-in`}
    >
      <div className="text-3xl mb-2">{won ? "🎊" : "😔"}</div>
      <h2
        className={`text-xl font-black mb-1 ${won ? "text-green-600" : "text-red-500"}`}
      >
        {won ? "Yatta! ✨" : "Dame datta..."}
      </h2>
      <p className={`text-sm ${won ? "text-green-700" : "text-red-600"}`}>
        {won
          ? `You found the song in ${session.guesses_used} guess${session.guesses_used !== 1 ? "es" : ""}!`
          : "The answer was"}
      </p>

      {answer && <HolosongAnswerCard answer={answer} />}

      {endless && (
        <div className="mt-4 grid grid-cols-2 gap-1 text-xs font-semibold text-[var(--holo-text-muted)]">
          <span>
            Rounds won: {session.rounds_won}/{session.rounds_played}
          </span>
          <span>Best streak: {session.longest_streak} 🔥</span>
          <span>
            Win rate: {formatHolosongWinRate(session.win_rate_percentage)}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <ShareButton text={shareText} />
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

      {message && <p className="text-xs mt-3 opacity-60">{message}</p>}
    </div>
  );
}

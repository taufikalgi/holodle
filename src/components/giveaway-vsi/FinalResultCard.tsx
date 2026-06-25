import type { GameSession } from "./types";
import HeaderStat from "./HeaderStat";

export default function FinalResultCard({
  session,
  historyCount,
  onNewSession,
}: {
  session: GameSession;
  historyCount: number;
  onNewSession: () => void;
}) {
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center animate-bounce-in">
      <div className="text-4xl">⏰</div>
      <h2 className="mt-3 text-2xl font-black" style={{ color: "var(--holo-blue)" }}>
        Session expired
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6"
        style={{ color: "var(--holo-text-muted)" }}
      >
        The 5 minute giveaway session is over. Your final score is locked and the round no longer
        accepts guesses.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <HeaderStat label="Score" value={session.score} />
        <HeaderStat label="Correct" value={session.correct_guesses} />
        <HeaderStat label="Wrong" value={session.wrong_answers} />
        <HeaderStat label="Guesses" value={historyCount} />
      </div>

      <button
        onClick={onNewSession}
        className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
        style={{ background: "var(--holo-blue)" }}
      >
        Start a new session
      </button>
    </div>
  );
}

import Image from "next/image";
import type { LeaderboardEntry } from "./types";

export default function LeaderboardCard({
  entries,
  loading,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
}) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div
          className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          Loading leaderboard...
        </div>
      ) : entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry.session_id}
            className="rounded-2xl border bg-white px-4 py-3 shadow-sm"
            style={{ borderColor: "var(--holo-border)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black"
                style={{
                  borderColor: "var(--holo-border)",
                  background: "var(--holo-off-white)",
                  color: "var(--holo-text)",
                }}
              >
                #{entry.rank}
              </div>
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src={entry.user_picture}
                  alt={entry.user_name}
                  width={36}
                  height={36}
                  className="rounded-full"
                  style={{ border: "2px solid var(--holo-border)" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black" style={{ color: "var(--holo-text)" }}>
                  {entry.user_name}
                </div>
                <div
                  className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "var(--holo-text-muted)" }}
                >
                  <span>{entry.score} pts</span>
                  <span>•</span>
                  <span>{entry.correct_guesses} correct</span>
                  <span>•</span>
                  <span>{entry.wrong_answers} wrong</span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          No leaderboard data yet.
        </div>
      )}
    </div>
  );
}

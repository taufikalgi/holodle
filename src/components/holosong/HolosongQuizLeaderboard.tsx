"use client";

import type { HolosongQuizLeaderboardEntry } from "@/lib/holosong-quiz-api";

export default function HolosongQuizLeaderboard({
  entries,
  total,
  hasMore,
  loading,
  loadingMore,
  error,
  onLoadMore,
}: {
  entries: HolosongQuizLeaderboardEntry[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string;
  onLoadMore: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
        All-time best endless streak · {total}
      </p>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm border-[var(--holo-border)] text-[var(--holo-text-muted)]">
          Loading leaderboard...
        </div>
      ) : entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry.user_id}
            className="flex items-center gap-3 rounded-2xl border bg-[var(--holo-bg-card)] px-4 py-3 shadow-sm border-[var(--holo-border)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text)]">
              #{entry.rank}
            </span>
            {entry.picture ? (
              <img
                src={entry.picture}
                alt={entry.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--holo-off-white)] text-sm font-black text-[var(--holo-text)]">
                {entry.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-black text-[var(--holo-text)]">
              {entry.name}
            </span>
            <span className="whitespace-nowrap text-sm font-black text-[var(--holo-blue-dark)]">
              {entry.longest_streak} 🔥
            </span>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm border-[var(--holo-border)] text-[var(--holo-text-muted)]">
          No endless streaks yet.
        </div>
      )}

      {!loading && hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full rounded-2xl border px-4 py-3 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)] disabled:opacity-50 border-[var(--holo-border)] text-[var(--holo-text)]"
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

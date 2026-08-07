"use client";

import { useEffect } from "react";
import type { LeaderboardEntry, LeaderboardPeriod } from "./types";
import LeaderboardCard from "./LeaderboardCard";

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function LeaderboardModal({
  open,
  entries,
  loading,
  loadingMore,
  hasMore,
  total,
  period,
  month,
  prevDisabled,
  nextDisabled,
  onPeriodChange,
  onNavigate,
  onLoadMore,
  onClose,
}: {
  open: boolean;
  entries: LeaderboardEntry[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number;
  period: LeaderboardPeriod;
  month: string;
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onNavigate: (direction: 1 | -1) => void;
  onLoadMore: () => void;
  onClose: () => void;
}) {
  const monthLabel = (() => {
    const [y, m] = month.split("-").map(Number);
    if (!y || !m) return month;
    return `${new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long" })} ${y}`;
  })();
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        aria-label="Close leaderboard"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="overflow-hidden rounded-[28px] border bg-[var(--holo-bg)] shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4 md:px-6">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.24em]"
                style={{ color: "var(--holo-text-muted)" }}
              >
                Leaderboard
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
                Sorted by score, correct guesses, then fewer mistakes.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-3 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)]"
              style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
            >
              Close
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex rounded-2xl border p-1"
                style={{ borderColor: "var(--holo-border)" }}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onPeriodChange(option.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      period === option.value ? "bg-[var(--holo-blue)]" : "bg-transparent"
                    }`}
                    style={{
                      color: period === option.value ? "white" : "var(--holo-text)",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {period !== "all" && (
                  <div className="flex items-center gap-2">
                    {period === "monthly" && (
                      <span className="text-xs font-bold" style={{ color: "var(--holo-text)" }}>
                        {monthLabel}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onNavigate(-1)}
                        disabled={prevDisabled}
                        aria-label="Previous period"
                        className="rounded-full border px-2 py-1 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)] disabled:opacity-40 disabled:hover:bg-transparent"
                        style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate(1)}
                        disabled={nextDisabled}
                        aria-label="Next period"
                        className="rounded-full border px-2 py-1 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)] disabled:opacity-40 disabled:hover:bg-transparent"
                        style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
                >
                  Top {total}
                </span>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <LeaderboardCard
                entries={entries}
                loading={loading}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={onLoadMore}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

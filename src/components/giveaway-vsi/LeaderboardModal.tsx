"use client";

import { useEffect } from "react";
import type { LeaderboardEntry } from "./types";
import LeaderboardCard from "./LeaderboardCard";

export default function LeaderboardModal({
  open,
  entries,
  loading,
  onClose,
}: {
  open: boolean;
  entries: LeaderboardEntry[];
  loading: boolean;
  onClose: () => void;
}) {
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
              >
                Top {entries.length || 0}
              </span>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <LeaderboardCard entries={entries} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

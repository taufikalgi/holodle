"use client";

import { useState } from "react";
import type {
  HolosongSearchField,
  HolosongSongSummary,
} from "@/lib/holosong-api";
import { useHolosongSearch } from "@/hooks/useHolosongSearch";

const FIELDS: { value: HolosongSearchField; label: string }[] = [
  { value: "q", label: "All" },
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
];

export default function HolosongSearch({
  disabled,
  onGuess,
  onSkip,
}: {
  disabled: boolean;
  onGuess: (song: HolosongSongSummary) => void;
  onSkip: () => void;
}) {
  const [field, setField] = useState<HolosongSearchField>("q");
  const {
    query,
    setQuery,
    results,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    clear,
  } = useHolosongSearch(!disabled, field);

  const handleGuess = (song: HolosongSongSummary) => {
    onGuess(song);
    clear();
  };

  const handleSkip = () => {
    onSkip();
    clear();
  };

  const trimmed = query.trim();
  const waitingForMore = trimmed.length === 1;

  return (
    <div className="holo-card p-4 mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest font-bold text-[var(--holo-text-muted)]">
          Search for the song
        </p>
        <div className="flex gap-1">
          {FIELDS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setField(option.value)}
              disabled={disabled}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase transition-colors disabled:opacity-50 ${
                field === option.value
                  ? "bg-[var(--holo-blue)] text-white"
                  : "border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or browse the catalog…"
            className="holo-input w-full rounded-xl px-4 py-3 text-sm"
            autoComplete="off"
            disabled={disabled}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--holo-text-muted)]"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={disabled}
          className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)] hover:text-[var(--holo-text)] disabled:opacity-50"
          title="Skip this attempt and reveal a longer clip"
        >
          Skip
        </button>
      </div>

      {loading && (
        <p className="mt-2 text-xs font-semibold text-[var(--holo-text-muted)]">
          Searching…
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-2 rounded-xl border overflow-hidden border-[var(--holo-border)] bg-[var(--holo-bg-card)]">
          {results.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => handleGuess(song)}
              className="dropdown-item w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-0 transition-colors border-[var(--holo-border)]"
            >
              {song.artwork_url ? (
                <img
                  src={song.artwork_url}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <span className="text-xl">🎵</span>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--holo-text)] truncate">
                  {song.title}
                </div>
                <div className="text-xs text-[var(--holo-text-muted)] truncate">
                  {song.artist}
                </div>
              </div>
            </button>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="w-full px-4 py-2 text-xs font-bold text-[var(--holo-blue-dark)] disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more songs"}
            </button>
          )}
        </div>
      )}

      {!loading && !error && waitingForMore && (
        <p className="mt-2 text-xs font-semibold text-[var(--holo-text-muted)]">
          Type at least 2 characters.
        </p>
      )}

      {!loading &&
        !error &&
        !waitingForMore &&
        results.length === 0 && (
          <p className="mt-2 text-xs font-semibold text-[var(--holo-text-muted)]">
            {trimmed
              ? "No songs found — try a different title or artist."
              : "No approved songs available yet."}
          </p>
        )}
    </div>
  );
}

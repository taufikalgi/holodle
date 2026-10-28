"use client";

import type { HolosongSongSummary } from "@/lib/holosong-api";
import { useHolosongSearch } from "@/hooks/useHolosongSearch";

export default function HolosongSearch({
  disabled,
  onGuess,
  onSkip,
}: {
  disabled: boolean;
  onGuess: (song: HolosongSongSummary) => void;
  onSkip: () => void;
}) {
  const { query, setQuery, results, loading, error, clear } =
    useHolosongSearch(!disabled);

  const handleGuess = (song: HolosongSongSummary) => {
    onGuess(song);
    clear();
  };

  const handleSkip = () => {
    onSkip();
    clear();
  };

  return (
    <div className="holo-card p-4 mb-5">
      <p className="text-xs uppercase tracking-widest font-bold mb-3 text-[var(--holo-text-muted)]">
        Search for the song
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Stellar Stellar, Suisei…"
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
        </div>
      )}

      {!loading &&
        !error &&
        query.trim().length >= 2 &&
        results.length === 0 && (
          <p className="mt-2 text-xs font-semibold text-[var(--holo-text-muted)]">
            No songs found — try a different title or artist.
          </p>
        )}
    </div>
  );
}

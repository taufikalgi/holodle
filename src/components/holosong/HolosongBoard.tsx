import type { HolosongGuess } from "@/lib/holosong-api";

export default function HolosongBoard({ board }: { board: HolosongGuess[] }) {
  if (board.length === 0) return null;
  const rows = [...board].reverse();

  return (
    <div className="holo-card p-4 mb-5 space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[var(--holo-text-muted)]">
        Your guesses
      </p>
      {rows.map((guess) => {
        const tone = guess.skipped
          ? "border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)]"
          : guess.correct
            ? "cell-correct"
            : "cell-wrong";
        return (
          <div
            key={guess.guess_number}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold ${tone}`}
          >
            <span className="w-5 text-xs opacity-60">
              #{guess.guess_number}
            </span>
            {guess.skipped ? (
              <>
                <span className="text-lg">⏭️</span>
                <span>Skipped</span>
                <span className="ml-auto text-xs">Attempt used</span>
              </>
            ) : (
              <>
                <span className="text-lg">🎵</span>
                <div className="min-w-0">
                  <div className="truncate">{guess.song_title ?? "Unknown song"}</div>
                  <div className="text-xs opacity-70 truncate">
                    {guess.song_artist ?? "Unknown artist"}
                  </div>
                </div>
                <span className="ml-auto whitespace-nowrap">
                  {guess.correct ? "✓ Correct!" : "✗ Wrong"}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

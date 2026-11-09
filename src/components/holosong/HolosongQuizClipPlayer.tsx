"use client";

import { useHolosongAudio } from "@/hooks/useHolosongAudio";

export default function HolosongQuizClipPlayer({
  previewUrl,
  clipStartMS,
  clipSeconds,
}: {
  previewUrl: string;
  clipStartMS: number;
  clipSeconds: number;
}) {
  const { play, pause, playing, progress, error, volume, setVolume } = useHolosongAudio(
    previewUrl,
    clipStartMS,
    clipSeconds
  );
  const finished = !playing && progress >= 1;

  return (
    <div className="holo-card p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
          Song clip
        </p>
        <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
          {playing ? "Playing for 5s" : finished ? "Clip finished" : "5-second clip"}
        </p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[var(--holo-off-white)]">
        <div
          className="h-full bg-[var(--holo-blue)]"
          style={{
            width: `${Math.min(progress, 1) * 100}%`,
            transition: "width 50ms linear",
          }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={playing ? pause : play}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          {playing ? "⏸ Pause" : finished ? "↻ Replay" : "▶ Play clip"}
        </button>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--holo-text-muted)]">
          <span>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Clip volume"
            className="w-28 cursor-pointer accent-[var(--holo-blue)]"
          />
          <span className="w-8 tabular-nums">{Math.round(volume * 100)}%</span>
        </label>
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

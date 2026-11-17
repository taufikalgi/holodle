"use client";

import type { ReactNode } from "react";

export function HolosongClipControls({
  playing,
  replay = false,
  onPlay,
  onPause,
  volume,
  setVolume,
  error,
  hint,
}: {
  playing: boolean;
  replay?: boolean;
  onPlay: () => void;
  onPause: () => void;
  volume: number;
  setVolume: (value: number) => void;
  error: string;
  hint?: ReactNode;
}) {
  return (
    <>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={playing ? onPause : onPlay}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          {playing ? "⏸ Pause" : replay ? "↻ Replay" : "▶ Play clip"}
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
        {hint}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </>
  );
}

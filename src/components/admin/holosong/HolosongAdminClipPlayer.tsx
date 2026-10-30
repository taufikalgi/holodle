"use client";

import { useRef, useState } from "react";

export default function HolosongAdminClipPlayer({
  previewUrl,
  clipStartMs,
  onClipStartChange,
}: {
  previewUrl?: string;
  clipStartMs: number;
  onClipStartChange?: (ms: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(30);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (!previewUrl) {
    return (
      <span className="text-xs font-bold text-[var(--holo-text-muted)]">
        No preview
      </span>
    );
  }

  const maxStartMs = Math.min(Math.round(duration * 1000) - 1, 29999);
  const startMs = Math.min(Math.max(clipStartMs, 0), Math.max(maxStartMs, 0));
  const startPercent =
    duration > 0 ? Math.min((startMs / 1000 / duration) * 100, 100) : 0;
  const progressPercent =
    duration > 0 ? Math.min((current / duration) * 100, 100) : 0;

  const seekTo = (ms: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = ms / 1000;
    setCurrent(ms / 1000);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (current < startMs / 1000 || current >= duration - 0.05) {
        seekTo(startMs);
      }
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const setStart = (ms: number) => {
    if (!onClipStartChange) return;
    const next = Math.min(Math.max(ms, 0), maxStartMs);
    onClipStartChange(next);
    seekTo(next);
  };

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onClipStartChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const fraction = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1
    );
    setStart(Math.round(fraction * duration * 1000));
  };

  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClipStartChange) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setStart(startMs - 1000);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setStart(startMs + 1000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          setDuration(Number.isFinite(value) && value > 0 ? value : 30);
        }}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause preview" : "Play preview"}
        className="w-7 h-7 flex-shrink-0 rounded-full text-[10px] font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div
        role={onClipStartChange ? "slider" : undefined}
        aria-label={onClipStartChange ? "Clip start" : undefined}
        aria-valuemin={onClipStartChange ? 0 : undefined}
        aria-valuemax={onClipStartChange ? maxStartMs : undefined}
        aria-valuenow={onClipStartChange ? startMs : undefined}
        tabIndex={onClipStartChange ? 0 : undefined}
        onPointerDown={handlePointer}
        onKeyDown={handleKey}
        title={
          onClipStartChange ? "Click to set where the clip starts" : "Preview"
        }
        className={`relative h-2 w-16 sm:w-20 flex-shrink-0 rounded-full border border-[var(--holo-border)] bg-[var(--holo-off-white)] ${
          onClipStartChange ? "cursor-pointer" : ""
        }`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--holo-blue)] transition-[width] duration-100"
          style={{ width: `${progressPercent}%` }}
        />
        {onClipStartChange && (
          <span
            className="absolute top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--holo-blue-dark)]"
            style={{ left: `${startPercent}%` }}
          />
        )}
      </div>
      <span className="text-[10px] font-semibold tabular-nums whitespace-nowrap text-[var(--holo-text-muted)]">
        {current.toFixed(1)}s / {duration.toFixed(1)}s
      </span>
    </div>
  );
}

"use client";

import {
  formatHolosongClip,
  HOLOSONG_CLIP_STEPS,
  holosongClipBarPercent,
} from "@/lib/holosong-api";
import { useHolosongAudio } from "@/hooks/useHolosongAudio";

export default function HolosongClipPlayer({
  previewUrl,
  clipSeconds,
}: {
  previewUrl: string;
  clipSeconds: number;
}) {
  const { play, pause, playing, error, progress, volume, setVolume } =
    useHolosongAudio(previewUrl, clipSeconds);
  const finished = !playing && progress >= 1;
  const paused = !playing && progress > 0 && progress < 1;
  const progressSeconds = progress * clipSeconds;
  const currentStep = Math.max(
    0,
    HOLOSONG_CLIP_STEPS.findIndex((step) => step >= clipSeconds - 0.001)
  );
  const markerLeft = holosongClipBarPercent(clipSeconds);
  const labelShift =
    markerLeft <= 10
      ? ""
      : markerLeft >= 90
        ? "-translate-x-full"
        : "-translate-x-1/2";

  return (
    <div className="holo-card p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
          Song clip
        </p>
        <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
          {playing ? "Playing…" : paused ? "Paused" : finished ? "Clip finished" : "Ready"}
        </p>
      </div>

      <div className="relative pt-7">
        <div className="absolute top-0" style={{ left: `${markerLeft}%` }}>
          <span
            className={`block text-xs font-black whitespace-nowrap text-[var(--holo-blue-dark)] ${labelShift}`}
          >
            {formatHolosongClip(clipSeconds)}
          </span>
          <span className="absolute left-0 top-4 -translate-x-1/2 text-[10px] leading-none text-[var(--holo-blue-dark)]">
            ▼
          </span>
        </div>

        <div className="flex items-stretch gap-0.5">
          {HOLOSONG_CLIP_STEPS.map((step, index) => {
            const previous = index === 0 ? 0 : HOLOSONG_CLIP_STEPS[index - 1];
            const filled =
              progressSeconds <= previous
                ? 0
                : Math.min((progressSeconds - previous) / (step - previous), 1);
            const active = index === currentStep;

            return (
              <div
                key={step}
                title={`${index + 1}: ${formatHolosongClip(step)}`}
                className={`relative h-3 overflow-hidden rounded-sm border bg-[var(--holo-off-white)] ${
                  active
                    ? "border-[var(--holo-blue)]"
                    : "border-[var(--holo-border)]"
                }`}
                style={{ flexGrow: step, flexBasis: 0 }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--holo-blue)]"
                  style={{
                    width: `${filled * 100}%`,
                    transition: "width 50ms linear",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={playing ? pause : play}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          {playing ? "⏸ Pause" : "▶ Play clip"}
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
        <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
          Each try plays up to its own marker — the last try fills the whole bar.
        </p>
      </div>

      {error && (
        <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>
      )}
    </div>
  );
}

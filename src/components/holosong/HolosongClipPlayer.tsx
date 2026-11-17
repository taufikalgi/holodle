"use client";

import {
  formatHolosongClip,
  HOLOSONG_CLIP_STEPS,
  holosongClipBarPercent,
} from "@/lib/holosong-api";
import { useHolosongAudio } from "@/hooks/useHolosongAudio";
import { HolosongClipControls } from "./HolosongClipControls";

export default function HolosongClipPlayer({
  previewUrl,
  clipStartMS,
  clipSeconds,
}: {
  previewUrl: string;
  clipStartMS: number;
  clipSeconds: number;
}) {
  const { play, pause, playing, error, progress, volume, setVolume } =
    useHolosongAudio(previewUrl, clipStartMS, clipSeconds);
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
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
            Starts at {(clipStartMS / 1000).toFixed(2)}s
          </p>
          <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
            {playing ? "Playing…" : paused ? "Paused" : finished ? "Clip finished" : "Ready"}
          </p>
        </div>
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

      <HolosongClipControls
        playing={playing}
        onPlay={play}
        onPause={pause}
        volume={volume}
        setVolume={setVolume}
        error={error}
        hint={
          <p className="text-xs font-semibold text-[var(--holo-text-muted)]">
            Each try plays up to its own marker — the last try fills the whole bar.
          </p>
        }
      />
    </div>
  );
}

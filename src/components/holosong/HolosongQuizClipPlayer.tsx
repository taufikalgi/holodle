"use client";

import { useHolosongAudio } from "@/hooks/useHolosongAudio";
import { HolosongClipControls } from "./HolosongClipControls";

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

      <HolosongClipControls
        playing={playing}
        replay={finished}
        onPlay={play}
        onPause={pause}
        volume={volume}
        setVolume={setVolume}
        error={error}
      />
    </div>
  );
}

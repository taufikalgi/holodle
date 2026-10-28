import {
  formatHolosongClip,
  HOLOSONG_CLIP_STEPS,
} from "@/lib/holosong-api";

export default function HolosongHowToPlay({ endless }: { endless?: boolean }) {
  return (
    <div className="holo-card p-5 mb-5 animate-slide-down">
      <h2 className="font-black text-sm tracking-widest uppercase mb-3 text-[var(--holo-blue-dark)]">
        How to Play
      </h2>
      <ul className="text-sm space-y-2 text-[var(--holo-text-muted)]">
        <li>
          🎵 Guess the secret Hololive song from a short{" "}
          <strong className="text-[var(--holo-text)]">iTunes preview</strong>
        </li>
        <li>
          🔉 You get <strong className="text-[var(--holo-text)]">5 tries</strong> —
          every wrong guess or skip plays a longer clip
        </li>
        <li>▶️ Replay the current clip as often as you want</li>
        <li>🫥 The title and artist are revealed only after the round ends</li>
        {endless ? (
          <li>🎲 Endless mode is unlimited and does not affect your stats</li>
        ) : (
          <li>⏰ A new song is chosen every day at midnight UTC!</li>
        )}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {HOLOSONG_CLIP_STEPS.map((seconds, i) => (
          <span
            key={seconds}
            className="rounded-lg px-2 py-1.5 font-semibold tag-correct"
          >
            Try {i + 1}: {formatHolosongClip(seconds)}
          </span>
        ))}
      </div>
    </div>
  );
}

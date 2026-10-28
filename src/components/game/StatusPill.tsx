import type { ReactNode } from "react";
import type { GameStatus } from "@/lib/game-status";

const WON_COPY = {
  daily: "You found them! 🎉",
  endless: "Correct! Ready for the next one?",
} as const;
const LOST_COPY = {
  daily: "Game over — come back tomorrow!",
  endless: "Wrong — try the next one!",
} as const;

export default function StatusPill({
  status,
  guessesLeft,
  variant,
  extra,
}: {
  status: GameStatus | "idle" | "expired";
  guessesLeft: number;
  variant: "daily" | "endless";
  extra?: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border bg-[var(--holo-bg-card)] border-[var(--holo-border)] text-[var(--holo-text-muted)]">
      {status === "won" ? (
        variant === "daily" ? (
          <>
            <span className="text-green-500">●</span> {WON_COPY.daily}
          </>
        ) : (
          WON_COPY[variant]
        )
      ) : status === "lost" ? (
        variant === "daily" ? (
          <>
            <span className="text-red-400">●</span> {LOST_COPY.daily}
          </>
        ) : (
          LOST_COPY[variant]
        )
      ) : (
        <>
          <span className="text-[var(--holo-blue)]">●</span> {guessesLeft} guess
          {guessesLeft !== 1 ? "es" : ""} remaining
        </>
      )}
      {extra}
    </div>
  );
}

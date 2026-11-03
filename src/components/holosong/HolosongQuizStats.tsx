"use client";

import StatsBar from "@/components/ui/StatsBar";
import type { HolosongQuizStats as Stats } from "@/lib/holosong-quiz-api";

export default function HolosongQuizStats({
  stats,
  mode,
}: {
  stats: Stats;
  mode: "daily" | "endless";
}) {
  if (mode === "daily") {
    return (
      <div className="mb-5">
        <StatsBar
          streak={stats.daily.current_streak}
          bestStreak={stats.daily.max_streak}
          totalPlayed={stats.daily.games_played}
          totalWon={stats.daily.games_won}
        />
      </div>
    );
  }

  const cards = [
    { label: "Runs", value: stats.endless.runs_played },
    { label: "Best streak", value: stats.endless.best_streak },
    { label: "Streak", value: stats.endless.current_streak },
    { label: "Correct", value: stats.endless.total_correct },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="holo-card px-3 py-2 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
            {card.label}
          </div>
          <div className="text-sm font-black text-[var(--holo-text)]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

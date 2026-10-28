import StatsBar from "@/components/ui/StatsBar";
import type { HolosongStats } from "@/lib/holosong-api";

export default function HolosongStatsPanel({ stats }: { stats: HolosongStats }) {
  const maxBucket = Math.max(1, ...stats.guess_distribution);

  return (
    <div className="mb-6">
      <StatsBar
        streak={stats.current_streak}
        bestStreak={stats.max_streak}
        totalPlayed={stats.games_played}
        totalWon={stats.games_won}
      />
      <div className="holo-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[var(--holo-text-muted)]">
          Guess distribution
        </p>
        <div className="space-y-1">
          {stats.guess_distribution.map((count, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right font-bold text-[var(--holo-text-muted)]">
                {index + 1}
              </span>
              <div className="flex-1 h-4 rounded bg-[var(--holo-off-white)] overflow-hidden">
                <div
                  className="h-full bg-[var(--holo-blue)]"
                  style={{ width: `${(count / maxBucket) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold text-[var(--holo-text)]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

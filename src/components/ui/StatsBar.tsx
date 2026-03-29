export default function StatsBar({
  streak,
  bestStreak,
  totalPlayed,
  totalWon,
}: {
  streak: number;
  bestStreak: number;
  totalPlayed: number;
  totalWon: number;
}) {
  return (
    <div className="flex gap-3 justify-center mb-6">
      {[
        { value: streak, label: "Streak" },
        { value: bestStreak, label: "Best" },
        { value: totalPlayed, label: "Played" },
        {
          value: totalPlayed ? Math.round((totalWon / totalPlayed) * 100) + "%" : "0%",
          label: "Win rate",
        },
      ].map(({ value, label }) => (
        <div key={label} className="holo-card px-4 py-2 text-center flex-1">
          <div className="text-xl font-black" style={{ color: "var(--holo-blue)" }}>
            {value}
          </div>
          <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

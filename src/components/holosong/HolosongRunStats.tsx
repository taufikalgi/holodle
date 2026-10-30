import {
  formatHolosongWinRate,
  type HolosongSession,
} from "@/lib/holosong-api";

function RunStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="holo-card px-3 py-2 text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
        {label}
      </div>
      <div className="text-sm font-black text-[var(--holo-text)]">{value}</div>
    </div>
  );
}

export default function HolosongRunStats({
  session,
}: {
  session: HolosongSession;
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <RunStat label="Round" value={String(session.round_number)} />
      <RunStat
        label="Rounds won"
        value={`${session.rounds_won}/${session.rounds_played}`}
      />
      <RunStat
        label="Streak"
        value={`${session.current_streak} · best ${session.longest_streak}`}
      />
      <RunStat
        label="Win rate"
        value={formatHolosongWinRate(session.win_rate_percentage)}
      />
    </div>
  );
}

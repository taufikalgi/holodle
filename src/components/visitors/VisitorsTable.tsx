import {
  formatCompactNumber,
  formatVisitorDate,
  type VisitorStatsPoint,
} from "@/lib/visitors-api";

export default function VisitorsTable({ series }: { series: VisitorStatsPoint[] }) {
  return (
    <section className="holo-card mb-6 overflow-hidden">
      <div
        className="max-h-[28rem] overflow-auto"
        tabIndex={0}
        role="region"
        aria-label="Visitor statistics table"
      >
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <caption className="sr-only">
            Daily aggregate gameplay statistics for the selected range
          </caption>
          <thead className="sticky top-0 bg-[var(--holo-bg-card)]">
            <tr className="border-b border-[var(--holo-border)] text-[10px] uppercase tracking-widest text-[var(--holo-text-muted)]">
              <th className="px-3 py-2 font-black">Date</th>
              <th className="px-3 py-2 font-black">Active</th>
              <th className="px-3 py-2 font-black">New</th>
              <th className="px-3 py-2 font-black">Classic</th>
              <th className="px-3 py-2 font-black">Holosong</th>
              <th className="px-3 py-2 font-black">Quiz</th>
              <th className="px-3 py-2 font-black">Guesses</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => (
              <tr
                key={point.date}
                className="border-b border-[var(--holo-border)] last:border-0 text-[var(--holo-text)]"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-2 font-bold"
                  title={point.date}
                >
                  {formatVisitorDate(point.date)}
                </th>
                <td className="px-3 py-2">{formatCompactNumber(point.active_players)}</td>
                <td className="px-3 py-2">{formatCompactNumber(point.new_players)}</td>
                <td className="px-3 py-2">{formatCompactNumber(point.classic_sessions)}</td>
                <td className="px-3 py-2">{formatCompactNumber(point.holosong_sessions)}</td>
                <td className="px-3 py-2">{formatCompactNumber(point.holosong_quiz_sessions)}</td>
                <td className="px-3 py-2">{formatCompactNumber(point.guesses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import {
  formatCompactNumber,
  sessionsForTotals,
  type VisitorStatsTotals,
} from "@/lib/visitors-api";

export default function VisitorsSummary({ totals }: { totals: VisitorStatsTotals }) {
  const sessions = sessionsForTotals(totals);

  const cards = [
    { label: "Active players", value: totals.active_players },
    { label: "New players", value: totals.new_players },
    { label: "Sessions", value: sessions },
    { label: "Guesses", value: totals.guesses },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="holo-card p-4 text-center">
          <p className="text-2xl font-black text-[var(--holo-text)]">
            {formatCompactNumber(card.value)}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
            {card.label}
          </p>
        </div>
      ))}
    </section>
  );
}

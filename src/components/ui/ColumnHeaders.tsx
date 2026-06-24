export const DEFAULT_COLUMN_HEADERS = [
  "Talent",
  "Name",
  "Branch",
  "Debut Year",
  "Archetype",
  "Height",
  "Birth Month",
];

export default function ColumnHeaders({
  headers,
  giveawayVsi,
}: {
  headers: string[];
  giveawayVsi?: boolean;
}) {
  // headers is expected to be 7 items: [photo, name, ...5 attrs]
  // On mobile we mirror GuessRow's layout: photo+name merged on top, 5 attrs below.
  const attrHeaders = headers.slice(2); // branch, debutYear, loreArchetype, height, birthMonth

  return (
    <>
      {/* ── Desktop (md+): unchanged single row ── */}
      <div
        className="hidden md:grid gap-2 px-1 mb-2"
        style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}
      >
        {headers.map((h) => (
          <div
            key={h}
            className="text-center text-xs uppercase tracking-wider font-bold py-1"
            style={{ color: "var(--holo-text-muted)" }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* ── Mobile (<md): two-row header mirroring GuessRow ── */}
      <div className="flex flex-col gap-1.5 px-1 mb-2 md:hidden">
        {/* Row 1: spans full width for photo + name column */}

        <div
          className={`text-center ${giveawayVsi ? "text-[10px]" : "text-[10px]"} uppercase tracking-wider font-bold py-1`}
          style={{ color: "var(--holo-text-muted)" }}
        >
          {headers[1]} {/* "Name" */}
        </div>

        {/* Row 2: 5-column grid for the attribute headers */}
        <div className="grid grid-cols-5 gap-1.5">
          {attrHeaders.map((h) => (
            <div
              key={h}
              className={`text-center ${giveawayVsi ? "text-[8px]" : "text-[10px]"} uppercase tracking-wider font-bold py-1`}
              style={{ color: "var(--holo-text-muted)" }}
            >
              {h}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

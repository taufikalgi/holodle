export default function ColumnHeaders({ headers }: { headers: string[] }) {
  return (
    <div
      className="grid gap-2 px-1 mb-2"
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
  );
}

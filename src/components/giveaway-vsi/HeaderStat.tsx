export default function HeaderStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div key={label} className="holo-card px-4 py-2 text-center flex-1">
      <div className="text-xl font-black" style={{ color: "var(--holo-blue)" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

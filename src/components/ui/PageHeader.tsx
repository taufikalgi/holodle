export default function PageHeader({
  subtitle,
  onHowTo,
  showHowTo,
  showButton = true,
}: {
  subtitle: string;
  onHowTo: () => void;
  showHowTo: boolean;
  showButton?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="w-8" />
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#00B4D8]" />
          <span className="text-[#00B4D8] text-xs">✦</span>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#00B4D8]" />
        </div>
        <h1
          className="text-5xl font-black tracking-widest"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <span className="shimmer-text">HOLO</span>
          <span style={{ color: "var(--holo-text)" }}>DLE</span>
        </h1>
        <p
          className="text-xs tracking-[0.25em] uppercase mt-1"
          style={{ color: "var(--holo-text-muted)" }}
        >
          {subtitle}
        </p>
      </div>
      {showButton && (
        <button
          onClick={onHowTo}
          title="How to play"
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors"
          style={{
            borderColor: "var(--holo-blue)",
            color: "var(--holo-blue)",
            background: "white",
          }}
        >
          {showHowTo ? "x" : "?"}
        </button>
      )}
    </div>
  );
}

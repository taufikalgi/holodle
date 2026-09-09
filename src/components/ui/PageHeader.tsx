export default function PageHeader({
  subtitle,
  onHowTo,
  onLeaderboard = () => {},
  showHowTo,
  showButton = true,
  showLeaderboard,
  showLeaderboardButton,
  competitiveHeader = false,
}: {
  subtitle: string;
  onHowTo: () => void;
  onLeaderboard?: () => void;
  showHowTo: boolean;
  showButton?: boolean;
  showLeaderboard?: boolean;
  showLeaderboardButton?: boolean;
  competitiveHeader?: boolean;
}) {
  const buttonShown = (showButton ? 1 : 0) + (showLeaderboardButton ? 1 : 0);
  return (
    <div
      className={`flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between ${competitiveHeader ? "md:pl-12" : ""}`}
    >
      <div className={`hidden md:block w-${buttonShown * 8}`} />
      <div className="flex flex-col items-center">
        <div className="hidden md:flex items-center gap-2 mb-1">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#00B4D8]" />
          <span className="text-[#00B4D8] text-xs">✦</span>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#00B4D8]" />
        </div>
        <h1
          className="text-3xl md:text-5xl font-black tracking-widest"
          style={{ fontFamily: "var(--font-albert-sans), sans-serif" }}
        >
          <span className="text-[var(--holo-blue)]">HOLO</span>
          <span className="text-[var(--holo-text)]">DLE</span>
        </h1>
        <p
          className="text-xs tracking-[0.25em] uppercase mt-1 text-[var(--holo-text-muted)]"
        >
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {showLeaderboardButton && (
          <button
            onClick={onLeaderboard}
            title="Leaderboard"
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors text-[var(--holo-blue)] bg-[var(--holo-bg-card)] border-[var(--holo-blue)]"
          >
            {showLeaderboard ? "x" : "🏆"}
          </button>
        )}
        {showButton && (
          <button
            onClick={onHowTo}
            title="How to play"
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors text-[var(--holo-blue)] bg-[var(--holo-bg-card)] border-[var(--holo-blue)]"
          >
            {showHowTo ? "x" : "?"}
          </button>
        )}
      </div>
    </div>
  );
}

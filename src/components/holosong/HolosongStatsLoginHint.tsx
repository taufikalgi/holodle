"use client";

export default function HolosongStatsLoginHint({
  onLogin,
}: {
  onLogin: () => void;
}) {
  return (
    <div className="holo-card p-4 mb-5 flex flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
        Log in with Google to save your daily stats and streak.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
      >
        Log in
      </button>
    </div>
  );
}

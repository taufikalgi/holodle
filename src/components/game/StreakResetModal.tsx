"use client";

export default function StreakResetModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Streak reset"
    >
      <div
        className="holo-card w-full max-w-sm p-6 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "var(--holo-off-white)", color: "var(--holo-text-muted)" }}
        >
          ✕
        </button>
        <h3 className="font-black text-sm tracking-widest uppercase" style={{ color: "var(--holo-text)" }}>
          Streak reset
        </h3>
        <p className="text-sm mt-2 font-semibold" style={{ color: "var(--holo-text-muted)" }}>
          You missed a day. Your streak was reset to 0. Win today to start a new streak!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: "var(--holo-blue)" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

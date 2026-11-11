"use client";

import Modal from "@/components/ui/Modal";

export default function StreakResetModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} label="Streak reset">
      <div className="p-6 text-center relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--holo-off-white)] text-[var(--holo-text-muted)]"
        >
          ✕
        </button>
        <h3 className="font-black text-sm tracking-widest uppercase text-[var(--holo-text)]">
          Streak reset
        </h3>
        <p className="text-sm mt-2 font-semibold text-[var(--holo-text-muted)]">
          You missed a day. Your streak was reset to 0. Win today to start a new streak!
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

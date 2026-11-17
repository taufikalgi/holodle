"use client";

import type { VisitorRange } from "@/hooks/useVisitorStats";

export default function RangeToggle({
  days,
  onChange,
}: {
  days: VisitorRange;
  onChange: (days: VisitorRange) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border p-1 border-[var(--holo-border)] bg-[var(--holo-bg-card)]"
      role="group"
      aria-label="Date range"
    >
      {([7, 30] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={days === value}
          className={`rounded-full px-4 py-1.5 text-xs font-black tracking-widest transition-colors ${
            days === value
              ? "bg-[var(--holo-blue)] text-white"
              : "text-[var(--holo-text-muted)] hover:bg-[var(--holo-off-white)]"
          }`}
        >
          {value}D
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ALL_BRANCHES } from "@/lib/talents";
import Modal from "./Modal";

interface BranchFilterModalProps {
  onStart: (branches: string[]) => void;
  onClose: () => void;
  initialBranches?: string[];
}

export default function BranchFilterModal({
  onStart,
  onClose,
  initialBranches,
}: BranchFilterModalProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialBranches ?? ALL_BRANCHES)
  );

  function toggle(branch: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(branch)) next.delete(branch);
      else next.add(branch);
      return next;
    });
  }

  const allSelected = selected.size === ALL_BRANCHES.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_BRANCHES));
    }
  }

  const canStart = selected.size > 0;

  return (
    <Modal onClose={onClose} label="Select talent branches">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <p
              className="text-xs font-black uppercase tracking-[0.24em]"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Select branches
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-3 py-2 text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)]"
              style={{ borderColor: "var(--holo-border)", color: "var(--holo-text)" }}
            >
              Cancel
            </button>
          </div>

          <div className="p-5">
            <button
              type="button"
              onClick={toggleAll}
              className="mb-3 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--holo-blue)" }}
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>

            <div className="space-y-2">
              {ALL_BRANCHES.map((branch) => (
                <label
                  key={branch}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-[var(--holo-off-white)]"
                  style={{
                    borderColor: selected.has(branch)
                      ? "var(--holo-blue)"
                      : "var(--holo-border)",
                    background: selected.has(branch)
                      ? "var(--holo-off-white)"
                      : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(branch)}
                    onChange={() => toggle(branch)}
                    className="h-4 w-4 accent-[var(--holo-blue)]"
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--holo-text)" }}
                  >
                    {branch}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStart([...selected])}
              className="mt-5 w-full rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--holo-blue)" }}
            >
              Start
            </button>
          </div>
    </Modal>
  );
}

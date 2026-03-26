"use client";

import { useRef } from "react";
import { type Talent } from "@/lib/talents";

export default function TalentSearchInput({
  input,
  suggestions,
  showDropdown,
  onInput,
  onGuess,
  onClear,
  onFocus,
  dropdownRef,
}: {
  input: string;
  suggestions: Talent[];
  showDropdown: boolean;
  onInput: (val: string) => void;
  onGuess: (talent: Talent) => void;
  onClear: () => void;
  onFocus: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="holo-card p-4 mb-5">
      <p
        className="text-xs uppercase tracking-widest font-bold mb-3"
        style={{ color: "var(--holo-text-muted)" }}
      >
        Type a talent name
      </p>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onFocus={onFocus}
          placeholder="e.g. Pekora, Suisei…"
          className="holo-input w-full rounded-xl px-4 py-3 text-sm"
          autoComplete="off"
        />
        {input && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "var(--holo-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="mt-2 rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--holo-border)", background: "white" }}
        >
          {suggestions.map((t) => (
            <button
              key={t.name}
              onClick={() => onGuess(t)}
              className="dropdown-item w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-0 transition-colors"
              style={{ borderColor: "var(--holo-border)" }}
            >
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                {t.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && input.length > 1 && suggestions.length === 0 && (
        <div
          className="mt-2 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--holo-border)",
            color: "var(--holo-text-muted)",
            background: "white",
          }}
        >
          No talents found — try a different name!
        </div>
      )}
    </div>
  );
}

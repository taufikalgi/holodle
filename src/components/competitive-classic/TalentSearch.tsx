"use client";

import { useMemo, type RefObject } from "react";
import type { TalentChoice } from "./types";

export default function TalentSearch({
  talents,
  input,
  onInput,
  onSelect,
  onClear,
  showDropdown,
  dropdownRef,
  inputRef,
  disabled,
}: {
  talents: TalentChoice[];
  input: string;
  onInput: (value: string) => void;
  onSelect: (talent: TalentChoice) => void;
  onClear: () => void;
  showDropdown: boolean;
  dropdownRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  const suggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];

    return talents
      .filter((talent) => {
        const haystack = [talent.name, ...talent.altNames].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [input, talents]);

  return (
    <div className="holo-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--holo-text-muted)" }}
          >
            Guess a talent
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--holo-text-muted)" }}>
            Search the fetched catalog and submit one name per round.
          </p>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-xs font-bold"
          style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
        >
          {talents.length} talents
        </div>
      </div>

      <div className="relative mt-4">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => onInput(input)}
          disabled={disabled}
          placeholder={disabled ? "Session ended" : "Type a talent name or alt name"}
          className="holo-input w-full rounded-2xl px-4 py-3.5 text-sm"
          autoComplete="off"
        />
        {input && !disabled && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: "var(--holo-text-muted)" }}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="mt-3 max-h-72 overflow-auto rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: "var(--holo-border)" }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((talent) => (
              <button
                key={talent.id}
                onClick={() => onSelect(talent)}
                className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--holo-off-white)]"
                style={{ borderColor: "var(--holo-border)" }}
              >
                <img
                  src={talent.photoUrl}
                  alt={talent.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                    {talent.name}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-sm" style={{ color: "var(--holo-text-muted)" }}>
              No talents found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

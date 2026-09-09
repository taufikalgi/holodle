"use client";

import type { SortDirection, SortKey } from "@/lib/talent-sort";

const SORTABLE_HEADERS: Array<{ key: SortKey; label: string }> = [
  { key: "name", label: "Talent" },
  { key: "branch", label: "Branch" },
  { key: "lore_archetype", label: "Archetype" },
  { key: "debut_year", label: "Debut" },
  { key: "height", label: "Height" },
  { key: "birth_month", label: "Birthday" },
];

interface TableHeaderProps {
  sortKey: SortKey | null;
  sortDirection: SortDirection;
  onSortToggle: (key: SortKey) => void;
}

export default function TableHeader({ sortKey, sortDirection, onSortToggle }: TableHeaderProps) {
  return (
    <thead>
      <tr className="bg-[var(--holo-off-white)]">
        {SORTABLE_HEADERS.map(({ key, label }) => {
          const active = sortKey === key;
          const indicator = active ? (sortDirection === "asc" ? "↑" : "↓") : "↕";

          return (
            <th
              key={key}
              style={{
                padding: "11px 16px",
                textAlign: "left",
                fontSize: 11,
                fontWeight: 800,
                color: active ? "var(--holo-blue-dark)" : "var(--holo-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                borderBottom: "1.5px solid var(--holo-border)",
                whiteSpace: "nowrap",
              }}
            >
              <button
                type="button"
                onClick={() => onSortToggle(key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  font: "inherit",
                  color: "inherit",
                }}
                aria-label={`Sort by ${label}`}
              >
                {label}
                <span aria-hidden="true" style={{ fontSize: 10 }}>
                  {indicator}
                </span>
              </button>
            </th>
          );
        })}
        {["Alt names", ""].map((h) => (
          <th
            key={h}
            style={{
              padding: "11px 16px",
              textAlign: "left",
              fontSize: 11,
              fontWeight: 800,
              color: "var(--holo-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "1.5px solid var(--holo-border)",
              whiteSpace: "nowrap",
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

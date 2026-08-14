"use client";

import type { Talent } from "@/lib/talent-api";
import { MONTH_ORDER } from "@/lib/talents";

export type SortKey =
  | "name"
  | "branch"
  | "lore_archetype"
  | "debut_year"
  | "height"
  | "birth_month";
export type SortDirection = "asc" | "desc";

const BRANCH_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  JP: { bg: "#ede0f5", color: "#6a2485", border: "#d4a8e8" },
  EN: { bg: "#dff0e8", color: "#185a32", border: "#86efac" },
  ID: { bg: "#faeedd", color: "#7a4a0a", border: "#fbbf6d" },
  DEV_IS: { bg: "#e0eeff", color: "#1a4a8a", border: "#93c5fd" },
  ReGLOSS: { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
  STARS: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
};

const SORTABLE_HEADERS: Array<{ key: SortKey; label: string }> = [
  { key: "name", label: "Talent" },
  { key: "branch", label: "Branch" },
  { key: "lore_archetype", label: "Archetype" },
  { key: "debut_year", label: "Debut" },
  { key: "height", label: "Height" },
  { key: "birth_month", label: "Birthday" },
];

export function compareTalentsByKey(a: Talent, b: Talent, key: SortKey) {
  const aValue = a[key];
  const bValue = b[key];

  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (key === "debut_year" || key === "height") {
    return Number(aValue) - Number(bValue);
  }

  if (key === "birth_month") {
    const aMonth = MONTH_ORDER[String(aValue)] ?? Number.MAX_SAFE_INTEGER;
    const bMonth = MONTH_ORDER[String(bValue)] ?? Number.MAX_SAFE_INTEGER;
    return aMonth - bMonth;
  }

  return String(aValue).localeCompare(String(bValue));
}

function getBranchStyle(branch: string) {
  return (
    BRANCH_COLORS[branch] ?? {
      bg: "var(--holo-off-white)",
      color: "var(--holo-text-muted)",
      border: "var(--holo-border)",
    }
  );
}

interface AdminTableProps {
  talents: Talent[];
  loading: boolean;
  filtered: Talent[];
  sortKey: SortKey | null;
  sortDirection: SortDirection;
  onSortToggle: (key: SortKey) => void;
  onEdit: (talent: Talent) => void;
  onCrop: (talent: Talent) => void;
  search: string;
  branchFilter: string;
  archetypeFilter: string;
  onClearFilters: () => void;
}

export default function AdminTable({
  talents,
  loading,
  filtered,
  sortKey,
  sortDirection,
  onSortToggle,
  onEdit,
  onCrop,
  search,
  branchFilter,
  archetypeFilter,
  onClearFilters,
}: AdminTableProps) {
  return (
    <>
      <div className="holo-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1.5px solid var(--holo-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--holo-text-muted)" }}>
            {loading
              ? "Loading..."
              : `Showing ${filtered.length} of ${talents.length} talent${talents.length !== 1 ? "s" : ""}`}
          </span>
          {(search || branchFilter || archetypeFilter) && (
            <button
              onClick={onClearFilters}
              style={{
                fontSize: 12,
                color: "var(--holo-rose)",
                background: "none",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--holo-off-white)" }}>
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
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            height: 14,
                            borderRadius: 7,
                            background: "var(--holo-border)",
                            opacity: 0.6,
                            width: j === 0 ? 140 : j === 6 ? 100 : 60,
                            animation: "pulse 1.5s ease infinite",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "3.5rem",
                      textAlign: "center",
                      color: "var(--holo-text-muted)",
                      fontSize: 15,
                    }}
                  >
                    🎨 No talents found
                  </td>
                </tr>
              ) : (
                filtered.map((talent, idx) => {
                  const bs = getBranchStyle(talent.branch);
                  return (
                    <tr
                      key={talent.id}
                      className="row-reveal"
                      style={{
                        animationDelay: `${Math.min(idx * 30, 300)}ms`,
                        borderBottom: "1px solid var(--holo-border)",
                      }}
                    >
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {talent.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={talent.image_url}
                              alt={talent.name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid var(--holo-border)",
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, var(--holo-blue-light), var(--holo-blue))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#fff",
                                flexShrink: 0,
                              }}
                            >
                              {talent.name[0]}
                            </div>
                          )}
                          <span
                            style={{ fontWeight: 700, fontSize: 14, color: "var(--holo-text)" }}
                          >
                            {talent.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: bs.bg,
                            color: bs.color,
                            border: `1px solid ${bs.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {talent.branch}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "var(--holo-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {talent.lore_archetype || "—"}
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--holo-text)",
                        }}
                      >
                        {talent.debut_year || "—"}
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--holo-text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {talent.height ? `${talent.height} cm` : "—"}
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "var(--holo-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {talent.birth_month || "—"}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {talent.alt_names.length === 0 ? (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--holo-border)",
                                fontStyle: "italic",
                              }}
                            >
                              none
                            </span>
                          ) : (
                            talent.alt_names.map((a: string) => (
                              <span
                                key={a}
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: "rgba(0,180,216,0.10)",
                                  border: "1px solid rgba(0,180,216,0.25)",
                                  color: "var(--holo-blue-dark)",
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {a}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => onEdit(talent)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              border: "1.5px solid var(--holo-border)",
                              background: "var(--holo-off-white)",
                              color: "var(--holo-blue-dark)",
                              fontFamily: '"Baloo 2", sans-serif',
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "var(--holo-blue)";
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "rgba(0,180,216,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "var(--holo-border)";
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "var(--holo-off-white)";
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => onCrop(talent)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1.5px solid rgba(0,180,216,0.35)",
                              background: "rgba(0,180,216,0.10)",
                              color: "var(--holo-blue-dark)",
                              fontFamily: '"Baloo 2", sans-serif',
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "var(--holo-blue)";
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "rgba(0,180,216,0.18)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "rgba(0,180,216,0.35)";
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "rgba(0,180,216,0.10)";
                            }}
                          >
                            ✂️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
}

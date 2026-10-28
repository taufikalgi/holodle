"use client";

import type { AdminTalent as Talent } from "@/lib/talents";
import type { SortDirection, SortKey } from "@/lib/talent-sort";
import TableHeader from "./TableHeader";
import TalentRow from "./TalentRow";
import { TableEmpty, TableSkeleton } from "./TableStates";

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
            <TableHeader
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortToggle={onSortToggle}
            />
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <TableEmpty />
              ) : (
                filtered.map((talent, idx) => (
                  <TalentRow
                    key={talent.id}
                    talent={talent}
                    index={idx}
                    onEdit={onEdit}
                    onCrop={onCrop}
                  />
                ))
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

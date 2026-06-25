"use client";

interface AdminToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  branchFilter: string;
  onBranchFilterChange: (v: string) => void;
  archetypeFilter: string;
  onArchetypeFilterChange: (v: string) => void;
  branches: string[];
  archetypes: string[];
  talentCount: number;
  onRefresh: () => void;
  onAdd: () => void;
}

const selectStyle: React.CSSProperties = {
  padding: "9px 13px",
  borderRadius: 10,
  border: "2px solid var(--holo-border)",
  background: "var(--holo-off-white)",
  color: "var(--holo-text)",
  fontFamily: '"Baloo 2", sans-serif',
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

export default function AdminToolbar({
  search,
  onSearchChange,
  branchFilter,
  onBranchFilterChange,
  archetypeFilter,
  onArchetypeFilterChange,
  branches,
  archetypes,
  onRefresh,
  onAdd,
}: AdminToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 16,
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          className="holo-input"
          style={{
            width: "100%",
            padding: "9px 13px 9px 36px",
            borderRadius: 10,
            fontSize: 14,
          }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or alt name..."
        />
      </div>

      <select
        style={selectStyle}
        value={branchFilter}
        onChange={(e) => onBranchFilterChange(e.target.value)}
      >
        <option value="">All branches</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        style={selectStyle}
        value={archetypeFilter}
        onChange={(e) => onArchetypeFilterChange(e.target.value)}
      >
        <option value="">All archetypes</option>
        {archetypes.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <button
        onClick={onRefresh}
        style={{
          padding: "9px 16px",
          borderRadius: 10,
          border: "1.5px solid var(--holo-border)",
          background: "var(--holo-off-white)",
          color: "var(--holo-text-muted)",
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        ↺ Refresh
      </button>

      <button
        onClick={onAdd}
        style={{
          padding: "9px 20px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
          color: "#fff",
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,119,163,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        ✨ Add talent
      </button>
    </div>
  );
}

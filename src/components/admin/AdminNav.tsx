import type { ReactNode } from "react";

export default function AdminNav({
  subtitle,
  backLabel,
  onBack,
  meta,
  userChip,
  onLogout,
}: {
  subtitle: string;
  backLabel?: string;
  onBack?: () => void;
  meta: ReactNode;
  userChip?: ReactNode;
  onLogout: () => void;
}) {
  return (
    <nav
      style={{
        background: "var(--holo-bg-card)",
        borderBottom: "1.5px solid var(--holo-border)",
        padding: "0 2rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 2px 12px rgba(0,119,163,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-blue-dark)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {backLabel}
          </button>
        ) : (
          <span style={{ fontSize: 24 }}>🎨</span>
        )}
        <div>
          <span
            className="shimmer-text"
            style={{ fontFamily: "var(--font-albert-sans), sans-serif", fontWeight: 800, fontSize: 18 }}
          >
            Holodle Admin
          </span>
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              color: "var(--holo-text-muted)",
              fontWeight: 600,
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: 13, color: "var(--holo-text-muted)", fontWeight: 600 }}>
          {meta}
        </span>
        {userChip}
        <button
          type="button"
          onClick={onLogout}
          style={{
            padding: "8px 18px",
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
          Sign out
        </button>
      </div>
    </nav>
  );
}

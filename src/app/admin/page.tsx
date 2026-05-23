"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminAuth, getToken } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import type { Talent } from "@/lib/talent-api";
import TalentModal from "@/components/ui/TalentModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080" + "/api/v1";

const BRANCH_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  JP: { bg: "#ede0f5", color: "#6a2485", border: "#d4a8e8" },
  EN: { bg: "#dff0e8", color: "#185a32", border: "#86efac" },
  ID: { bg: "#faeedd", color: "#7a4a0a", border: "#fbbf6d" },
  DEV_IS: { bg: "#e0eeff", color: "#1a4a8a", border: "#93c5fd" },
  ReGLOSS: { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
  STARS: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
};

function getBranchStyle(branch: string) {
  return (
    BRANCH_COLORS[branch] ?? {
      bg: "var(--holo-off-white)",
      color: "var(--holo-text-muted)",
      border: "var(--holo-border)",
    }
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, login, logout } = useAdminAuth();
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; talent?: Talent } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/talent`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setTalents(data.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch talents");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Redirect to login if not authed
  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) fetchTalents();
  }, [authLoading, user, fetchTalents]);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const archetypes = useMemo(
    () => [...new Set(talents.map((t) => t.lore_archetype).filter(Boolean))].sort(),
    [talents]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return talents.filter(
      (t) =>
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.alt_names.some((a: string) => a.toLowerCase().includes(q))) &&
        (!branchFilter || t.branch === branchFilter) &&
        (!archetypeFilter || t.lore_archetype === archetypeFilter)
    );
  }, [talents, search, branchFilter, archetypeFilter]);

  const branches = useMemo(() => [...new Set(talents.map((t) => t.branch))].sort(), [talents]);

  const onSaved = () => {
    fetchTalents();
    showToast(modal?.mode === "create" ? "Talent created! 🎨" : "Talent updated! ✨");
  };

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading…
        </span>
      </main>
    );
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const selectStyle: React.CSSProperties = {
    padding: "9px 13px",
    borderRadius: 10,
    border: "2px solid var(--holo-border)",
    background: "var(--holo-off-white)",
    color: "var(--holo-text)",
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--holo-bg)",
        fontFamily: '"Nunito", sans-serif',
      }}
    >
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
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
          <span style={{ fontSize: 24 }}>🎨</span>
          <div>
            <span
              className="shimmer-text"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 800,
                fontSize: 18,
              }}
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
              Talent Management
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, color: "var(--holo-text-muted)", fontWeight: 600 }}>
            {talents.length} talents
          </span>

          {/* User avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--holo-border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--holo-blue-light), var(--holo-blue))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--holo-text)" }}>
              {user.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or alt name..."
            />
          </div>

          {/* Branch filter */}
          <select
            style={selectStyle}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Archetype filter */}
          <select
            style={selectStyle}
            value={archetypeFilter}
            onChange={(e) => setArchetypeFilter(e.target.value)}
          >
            <option value="">All archetypes</option>
            {archetypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={fetchTalents}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ↺ Refresh
          </button>

          {/* Add */}
          <button
            onClick={() => setModal({ mode: "create" })}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
              color: "#fff",
              fontFamily: '"Nunito", sans-serif',
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

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div
            className="cell-wrong"
            style={{ padding: "12px 16px", borderRadius: 12, marginBottom: "1rem", fontSize: 14 }}
          >
            ⚠ {error}
            <button
              onClick={fetchTalents}
              style={{
                marginLeft: 12,
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Table card ───────────────────────────────────────────────────── */}
        <div className="holo-card" style={{ overflow: "hidden" }}>
          {/* Count strip */}
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
                onClick={() => {
                  setSearch("");
                  setBranchFilter("");
                  setArchetypeFilter("");
                }}
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
                  {[
                    "Talent",
                    "Branch",
                    "Archetype",
                    "Debut",
                    "Height",
                    "Birthday",
                    "Alt names",
                    "",
                  ].map((h) => (
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
                        {/* Talent name + avatar */}
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

                        {/* Branch badge */}
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

                        {/* Archetype */}
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

                        {/* Debut */}
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

                        {/* Height */}
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

                        {/* Birthday */}
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

                        {/* Alt names */}
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

                        {/* Actions */}
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => setModal({ mode: "edit", talent })}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              border: "1.5px solid var(--holo-border)",
                              background: "var(--holo-off-white)",
                              color: "var(--holo-blue-dark)",
                              fontFamily: '"Nunito", sans-serif',
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modal && (
        <TalentModal
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.talent : null}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          apiBase={API_BASE}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={toast.type === "ok" ? "win-banner" : "lose-banner"}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            padding: "14px 22px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 14,
            zIndex: 100,
            animation: "bounceIn 0.4s ease forwards",
            maxWidth: 320,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          60% { transform: scale(1.03) translateY(0); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

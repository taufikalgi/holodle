"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, getToken } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Talent } from "@/lib/talent-api";
import TalentModal from "@/components/ui/TalentModal";
import { AdminToolbar, AdminTable, compareTalentsByKey, AdminToast } from "@/components/admin";
import type { SortKey, SortDirection } from "@/components/admin";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1`;

export default function AdminPage() {
  const { user, loading: authLoading, login, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
      const res = await fetch(`${API_BASE}/talent/`, {
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
    const results = talents.filter(
      (t) =>
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.alt_names.some((a: string) => a.toLowerCase().includes(q))) &&
        (!branchFilter || t.branch === branchFilter) &&
        (!archetypeFilter || t.lore_archetype === archetypeFilter)
    );

    if (!sortKey) return results;

    return [...results].sort((a, b) => {
      const diff = compareTalentsByKey(a, b, sortKey);
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [talents, search, branchFilter, archetypeFilter, sortKey, sortDirection]);

  const branches = useMemo(() => [...new Set(talents.map((t) => t.branch))].sort(), [talents]);

  const onSaved = () => {
    fetchTalents();
    showToast(modal?.mode === "create" ? "Talent created! 🎨" : "Talent updated! ✨");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortKey(null);
  };

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--holo-bg)",
        fontFamily: '"Baloo 2", sans-serif',
      }}
    >
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
                fontFamily: "var(--font-albert-sans), sans-serif",
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

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <AdminToolbar
          search={search}
          onSearchChange={setSearch}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          archetypeFilter={archetypeFilter}
          onArchetypeFilterChange={setArchetypeFilter}
          branches={branches}
          archetypes={archetypes}
          talentCount={talents.length}
          onRefresh={fetchTalents}
          onAdd={() => setModal({ mode: "create" })}
        />

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

        <AdminTable
          talents={talents}
          loading={loading}
          filtered={filtered}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortToggle={toggleSort}
          onEdit={(t) => setModal({ mode: "edit", talent: t })}
          onCrop={(t) => router.push(`/admin/avatar-crops?talentId=${encodeURIComponent(t.id)}`)}
          search={search}
          branchFilter={branchFilter}
          archetypeFilter={archetypeFilter}
          onClearFilters={() => {
            setSearch("");
            setBranchFilter("");
            setArchetypeFilter("");
          }}
        />
      </main>

      {modal && (
        <TalentModal
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.talent : null}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          apiBase={API_BASE}
        />
      )}

      {toast && <AdminToast message={toast.msg} type={toast.type} />}
    </div>
  );
}

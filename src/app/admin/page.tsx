"use client";

import { useRouter } from "next/navigation";
import TalentModal from "@/components/ui/TalentModal";
import { AdminToolbar, AdminTable, AdminToast } from "@/components/admin";
import AdminNav from "@/components/admin/AdminNav";
import { useAdminTalents } from "@/hooks/useAdminTalents";

export default function AdminPage() {
  const a = useAdminTalents();
  const router = useRouter();

  if (a.authLoading || !a.user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]"
      >
        <span
          className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]"
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
      <AdminNav
        subtitle="Talent Management"
        meta={`${a.talents.length} talents`}
        userChip={
          <div className="flex items-center gap-2">
            {a.user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.user.picture}
                alt={a.user.name}
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
                {a.user.name[0]?.toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--holo-text)" }}>
              {a.user.name}
            </span>
          </div>
        }
        onLogout={a.handleLogout}
      />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <AdminToolbar
          search={a.search}
          onSearchChange={a.setSearch}
          branchFilter={a.branchFilter}
          onBranchFilterChange={a.setBranchFilter}
          archetypeFilter={a.archetypeFilter}
          onArchetypeFilterChange={a.setArchetypeFilter}
          branches={a.branches}
          archetypes={a.archetypes}
          talentCount={a.talents.length}
          onRefresh={a.fetchTalents}
          onAdd={() => a.setModal({ mode: "create" })}
        />

        {a.error && (
          <div
            className="cell-wrong"
            style={{ padding: "12px 16px", borderRadius: 12, marginBottom: "1rem", fontSize: 14 }}
          >
            ⚠ {a.error}
            <button
              onClick={a.fetchTalents}
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
          talents={a.talents}
          loading={a.loading}
          filtered={a.filtered}
          sortKey={a.sortKey}
          sortDirection={a.sortDirection}
          onSortToggle={a.toggleSort}
          onEdit={(t) => a.setModal({ mode: "edit", talent: t })}
          onCrop={(t) => router.push(`/admin/avatar-crops?talentId=${encodeURIComponent(t.id)}`)}
          search={a.search}
          branchFilter={a.branchFilter}
          archetypeFilter={a.archetypeFilter}
          onClearFilters={() => {
            a.setSearch("");
            a.setBranchFilter("");
            a.setArchetypeFilter("");
          }}
        />
      </main>

      {a.modal && (
        <TalentModal
          mode={a.modal.mode}
          initial={a.modal.mode === "edit" ? a.modal.talent : null}
          onClose={() => a.setModal(null)}
          onSaved={a.onSaved}
        />
      )}

      {a.toast && <AdminToast message={a.toast.msg} type={a.toast.type} />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminTalent } from "@/lib/talents";
import ConfirmModal from "@/components/ui/ConfirmModal";
import TalentModal from "@/components/ui/TalentModal";
import { AdminToolbar, AdminTable, AdminToast } from "@/components/admin";
import { AdminLoading, AdminShell } from "@/components/admin/AdminShell";
import { useAdminTalents } from "@/hooks/useAdminTalents";

export default function AdminPage() {
  const a = useAdminTalents();
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<AdminTalent | null>(null);
  const [deleteError, setDeleteError] = useState("");

  if (a.authLoading || !a.user) return <AdminLoading />;

  return (
    <>
      <AdminShell
        subtitle="Talent Management"
        meta={`${a.talents.length} talents`}
        user={a.user}
        onLogout={a.handleLogout}
      >
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
          onDelete={(t) => {
            setDeleteError("");
            setPendingDelete(t);
          }}
          deletingId={a.deletingId}
          search={a.search}
          branchFilter={a.branchFilter}
          archetypeFilter={a.archetypeFilter}
          onClearFilters={() => {
            a.setSearch("");
            a.setBranchFilter("");
            a.setArchetypeFilter("");
          }}
        />
    </AdminShell>

      {a.modal && (
        <TalentModal
          mode={a.modal.mode}
          initial={a.modal.mode === "edit" ? a.modal.talent : null}
          onClose={() => a.setModal(null)}
          onSaved={a.onSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete talent"
          message={`Delete ${pendingDelete.name}? This hides the talent from the game.`}
          confirmLabel="Delete"
          destructive
          loading={a.deletingId === pendingDelete.id}
          error={deleteError}
          onConfirm={async () => {
            setDeleteError("");
            const error = await a.handleDelete(pendingDelete);
            if (error) {
              setDeleteError(error);
            } else {
              setPendingDelete(null);
            }
          }}
          onClose={() => {
            setPendingDelete(null);
            setDeleteError("");
          }}
        />
      )}

      {a.toast && <AdminToast message={a.toast.msg} type={a.toast.type} />}
    </>
  );
}

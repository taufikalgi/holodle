"use client";

import { AdminToast } from "@/components/admin";
import { AdminLoading, AdminShell } from "@/components/admin/AdminShell";
import HolosongAdminTable from "@/components/admin/holosong/HolosongAdminTable";
import HolosongAdminToolbar from "@/components/admin/holosong/HolosongAdminToolbar";
import HolosongSongModal from "@/components/admin/holosong/HolosongSongModal";
import { useHolosongAdmin } from "@/hooks/useHolosongAdmin";

export default function HolosongAdminPage() {
  const a = useHolosongAdmin();

  if (a.authLoading || !a.user) return <AdminLoading />;

  return (
    <AdminShell
      subtitle="Holosong Catalog"
      meta={`${a.pageData.total} songs`}
      user={a.user}
      onLogout={a.handleLogout}
    >
        <HolosongAdminToolbar
          search={a.search}
          onSearchChange={a.setSearch}
          status={a.statusFilter}
          onStatusChange={a.setStatusFilter}
          onRefresh={a.fetchSongs}
          onRefreshPreviews={a.refreshPreviews}
          refreshingPreviews={a.refreshingPreviews}
          total={a.pageData.total}
        />

        {a.error && (
          <div className="cell-wrong rounded-xl px-4 py-3 text-sm font-semibold mb-4">
            ⚠ {a.error}
            <button
              type="button"
              onClick={a.fetchSongs}
              className="ml-3 underline font-black"
            >
              Retry
            </button>
          </div>
        )}

        <HolosongAdminTable
          songs={a.pageData.songs}
          loading={a.loading}
          busyId={a.busyId}
          page={a.page}
          pageSize={a.pageData.page_size || 20}
          total={a.pageData.total}
          hasMore={a.pageData.has_more}
          onEdit={a.setEditing}
          onApprove={a.approve}
          onReject={a.reject}
          onPrev={() => a.setPage(Math.max(1, a.page - 1))}
          onNext={() => a.setPage(a.page + 1)}
        />

      {a.editing && (
        <HolosongSongModal
          song={a.editing}
          onClose={() => a.setEditing(null)}
          onSave={a.saveEdit}
        />
      )}

      {a.toast && <AdminToast message={a.toast.msg} type={a.toast.type} />}
    </AdminShell>
  );
}

"use client";

import { AdminToast } from "@/components/admin";
import AdminNav from "@/components/admin/AdminNav";
import HolosongAdminTable from "@/components/admin/holosong/HolosongAdminTable";
import HolosongAdminToolbar from "@/components/admin/holosong/HolosongAdminToolbar";
import HolosongSongModal from "@/components/admin/holosong/HolosongSongModal";
import { useHolosongAdmin } from "@/hooks/useHolosongAdmin";

export default function HolosongAdminPage() {
  const a = useHolosongAdmin();

  if (a.authLoading || !a.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]">
        <span className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]">
          Loading…
        </span>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--holo-bg)]"
      style={{ fontFamily: '"Baloo 2", sans-serif' }}
    >
      <AdminNav
        subtitle="Holosong Catalog"
        meta={`${a.pageData.total} songs`}
        userChip={
          <div className="flex items-center gap-2">
            {a.user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.user.picture}
                alt={a.user.name}
                className="w-[30px] h-[30px] rounded-full object-cover border-2 border-[var(--holo-border)]"
              />
            ) : (
              <div className="w-[30px] h-[30px] rounded-full bg-[var(--holo-blue)] flex items-center justify-center text-xs font-extrabold text-white">
                {a.user.name[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-[13px] font-bold text-[var(--holo-text)]">
              {a.user.name}
            </span>
          </div>
        }
        onLogout={a.handleLogout}
      />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
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
      </main>

      {a.editing && (
        <HolosongSongModal
          song={a.editing}
          onClose={() => a.setEditing(null)}
          onSave={a.saveEdit}
        />
      )}

      {a.toast && <AdminToast message={a.toast.msg} type={a.toast.type} />}
    </div>
  );
}

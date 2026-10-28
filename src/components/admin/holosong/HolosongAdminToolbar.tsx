"use client";

import type { HolosongSongStatus } from "@/lib/holosong-admin-api";

export default function HolosongAdminToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onRefresh,
  onRefreshPreviews,
  refreshingPreviews,
  total,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: "" | HolosongSongStatus;
  onStatusChange: (value: "" | HolosongSongStatus) => void;
  onRefresh: () => void;
  onRefreshPreviews: () => void;
  refreshingPreviews: boolean;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
          🔍
        </span>
        <input
          className="holo-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title or artist..."
        />
      </div>

      <select
        className="holo-input rounded-xl px-3 py-2.5 text-sm font-semibold cursor-pointer"
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value as "" | HolosongSongStatus)
        }
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <span className="text-xs font-bold text-[var(--holo-text-muted)]">
        {total} song{total !== 1 ? "s" : ""}
      </span>

      <button
        type="button"
        onClick={onRefresh}
        className="px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)] transition-colors hover:text-[var(--holo-text)]"
      >
        ↺ Refresh
      </button>

      <button
        type="button"
        onClick={onRefreshPreviews}
        disabled={refreshingPreviews}
        className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50 bg-[var(--holo-blue)]"
      >
        {refreshingPreviews ? "Refreshing previews…" : "Refresh previews"}
      </button>
    </div>
  );
}

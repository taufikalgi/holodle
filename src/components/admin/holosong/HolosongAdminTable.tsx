"use client";

import type { HolosongAdminSong } from "@/lib/holosong-admin-api";
import HolosongAdminClipPlayer from "./HolosongAdminClipPlayer";

const STATUS_CLASS: Record<HolosongAdminSong["status"], string> = {
  approved: "tag-correct",
  pending: "tag-wrong-close",
  rejected: "tag-wrong",
};

export default function HolosongAdminTable({
  songs,
  loading,
  busyId,
  page,
  pageSize,
  total,
  hasMore,
  onEdit,
  onApprove,
  onReject,
  onPrev,
  onNext,
}: {
  songs: HolosongAdminSong[];
  loading: boolean;
  busyId: string | null;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onEdit: (song: HolosongAdminSong) => void;
  onApprove: (song: HolosongAdminSong) => void;
  onReject: (song: HolosongAdminSong) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = songs.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = songs.length === 0 ? 0 : start + songs.length - 1;

  return (
    <div className="holo-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--holo-off-white)]">
              {[
                { label: "Song", className: "" },
                { label: "Artist", className: "" },
                { label: "Album", className: "hidden xl:table-cell" },
                { label: "Status", className: "" },
                { label: "Preview", className: "" },
                { label: "Actions", className: "" },
              ].map(({ label, className }) => (
                <th
                  key={label}
                  className={`px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--holo-text-muted)] border-b border-[var(--holo-border)] whitespace-nowrap ${className}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-sm font-semibold text-[var(--holo-text-muted)]"
                >
                  Loading songs…
                </td>
              </tr>
            ) : songs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-sm font-semibold text-[var(--holo-text-muted)]"
                >
                  🎵 No Holosong songs found
                </td>
              </tr>
            ) : (
              songs.map((song) => {
                const busy = busyId === song.id;
                return (
                  <tr
                    key={song.id}
                    className="row-reveal border-b border-[var(--holo-border)] last:border-0"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {song.artwork_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={song.artwork_url}
                            alt={song.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[var(--holo-border)] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--holo-off-white)] border border-[var(--holo-border)] flex items-center justify-center flex-shrink-0">
                            🎵
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--holo-text)] truncate max-w-[180px]">
                            {song.title}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--holo-text-muted)] truncate max-w-[180px]">
                            iTunes ID {song.itunes_track_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-sm text-[var(--holo-text-muted)] font-semibold">
                      <span className="block truncate max-w-[140px]">
                        {song.artist}
                      </span>
                    </td>

                    <td className="hidden xl:table-cell px-3 py-3 text-sm text-[var(--holo-text-muted)]">
                      <span className="block truncate max-w-[120px]">
                        {song.album || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${STATUS_CLASS[song.status]}`}
                      >
                        {song.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-xs font-bold whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <HolosongAdminClipPlayer
                          previewUrl={song.preview_url}
                          clipStartMs={song.clip_start_ms}
                        />
                        {song.track_view_url && (
                          <a
                            href={song.track_view_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[var(--holo-text-muted)] underline"
                          >
                            Apple Music ↗
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(song)}
                          disabled={busy}
                          className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-blue-dark)] disabled:opacity-50"
                        >
                          ✏️ Edit
                        </button>
                        {song.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => onApprove(song)}
                            disabled={busy}
                            className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-green-300 bg-green-50 text-green-700 disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {song.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => onReject(song)}
                            disabled={busy}
                            className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-red-300 bg-red-50 text-red-600 disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--holo-border)]">
        <span className="text-xs font-semibold text-[var(--holo-text-muted)]">
          {loading
            ? "Loading..."
            : total === 0
              ? "No songs"
              : `Showing ${start}–${end} of ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)] disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs font-bold text-[var(--holo-text)]">
            Page {page}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasMore || loading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

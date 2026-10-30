"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import type {
  HolosongAdminSong,
  HolosongAdminSongUpdate,
} from "@/lib/holosong-admin-api";
import HolosongAdminClipPlayer from "./HolosongAdminClipPlayer";

const inputStyle =
  "holo-input w-full rounded-xl px-3 py-2.5 text-sm";

export default function HolosongSongModal({
  song,
  onClose,
  onSave,
}: {
  song: HolosongAdminSong;
  onClose: () => void;
  onSave: (update: HolosongAdminSongUpdate) => Promise<void>;
}) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [album, setAlbum] = useState(song.album ?? "");
  const [clipStart, setClipStart] = useState(String(song.clip_start_ms ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError("Title and artist are required.");
      return;
    }

    const parsedClipStart = Number(clipStart);
    if (
      !Number.isInteger(parsedClipStart) ||
      parsedClipStart < 0 ||
      parsedClipStart >= 30000
    ) {
      setError("Clip start must be a whole number between 0 and 29999 ms.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        clip_start_ms: parsedClipStart,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update song");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} label="Edit Holosong song" maxWidth="max-w-xl">
      <div className="holo-card p-6 animate-bounce-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-[var(--holo-text)]">
            ✏️ Edit Song
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 rounded-xl border border-[var(--holo-border)] bg-[var(--holo-off-white)] p-3">
          {song.artwork_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={song.artwork_url}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[var(--holo-bg-card)] flex items-center justify-center">
              🎵
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-mono text-[var(--holo-text-muted)]">
              iTunes ID {song.itunes_track_id}
            </p>
            <p className="text-xs font-bold text-[var(--holo-text-muted)]">
              Status: {song.status}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-extrabold uppercase tracking-widest mb-1.5 text-[var(--holo-text-muted)]">
              Title
            </span>
            <input
              className={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="block text-xs font-extrabold uppercase tracking-widest mb-1.5 text-[var(--holo-text-muted)]">
              Artist
            </span>
            <input
              className={inputStyle}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="block text-xs font-extrabold uppercase tracking-widest mb-1.5 text-[var(--holo-text-muted)]">
              Album
            </span>
            <input
              className={inputStyle}
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-extrabold uppercase tracking-widest mb-1.5 text-[var(--holo-text-muted)]">
              Clip start (ms)
            </span>
            <input
              className={inputStyle}
              type="number"
              min={0}
              max={29999}
              step={1}
              value={clipStart}
              onChange={(e) => setClipStart(e.target.value)}
            />
            <span className="mt-1 block text-[11px] font-semibold text-[var(--holo-text-muted)]">
              Where the 30-second preview should start. 0 plays from the beginning.
            </span>
          </label>

          <div className="rounded-xl border border-[var(--holo-border)] bg-[var(--holo-off-white)] p-3">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[var(--holo-text-muted)]">
              Preview
            </p>
            <HolosongAdminClipPlayer
              previewUrl={song.preview_url}
              clipStartMs={Number.isFinite(Number(clipStart)) ? Number(clipStart) : 0}
              onClipStartChange={(ms) => setClipStart(String(ms))}
            />
            <span className="mt-2 block text-[11px] font-semibold text-[var(--holo-text-muted)]">
              Click the bar to set where the clip starts.
            </span>
          </div>

          {error && (
            <div className="cell-wrong rounded-xl px-3 py-2 text-sm font-semibold">
              ⚠ {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-[var(--holo-border)] bg-[var(--holo-off-white)] text-[var(--holo-text-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50 bg-[var(--holo-blue)]"
            >
              {saving ? "Saving..." : "💾 Update"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

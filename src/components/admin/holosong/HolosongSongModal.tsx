"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import type {
  HolosongAdminSong,
  HolosongAdminSongUpdate,
} from "@/lib/holosong-admin-api";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError("Title and artist are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
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

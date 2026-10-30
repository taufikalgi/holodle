import { authedJson } from "./api-client";
import type { HolosongSong } from "./holosong-api";

export type HolosongSongStatus = "pending" | "approved" | "rejected";

export interface HolosongAdminSong extends HolosongSong {
  status: HolosongSongStatus;
  created_at?: string;
  updated_at?: string;
}

export interface HolosongAdminSongPage {
  songs: HolosongAdminSong[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface HolosongAdminSongUpdate {
  title: string;
  artist: string;
  album: string;
  clip_start_ms?: number;
}

export interface HolosongAdminQuery {
  status?: HolosongSongStatus | "";
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchHolosongAdminSongs(
  query: HolosongAdminQuery = {}
): Promise<HolosongAdminSongPage> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.q?.trim()) params.set("q", query.q.trim());
  params.set("page", String(query.page ?? 1));
  params.set("page_size", String(query.pageSize ?? 20));

  const data = await authedJson<HolosongAdminSongPage>(
    `/api/v1/holosong/admin/songs?${params.toString()}`
  );

  return {
    songs: Array.isArray(data?.songs) ? data.songs : [],
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? query.page ?? 1),
    page_size: Number(data?.page_size ?? query.pageSize ?? 20),
    has_more: Boolean(data?.has_more),
  };
}

export async function updateHolosongAdminSong(
  id: string,
  update: HolosongAdminSongUpdate
): Promise<void> {
  await authedJson<unknown>(
    `/api/v1/holosong/admin/songs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(update),
    }
  );
}

export async function approveHolosongAdminSong(id: string): Promise<void> {
  await authedJson<unknown>(
    `/api/v1/holosong/admin/songs/${encodeURIComponent(id)}/approve`,
    { method: "POST" }
  );
}

export async function rejectHolosongAdminSong(id: string): Promise<void> {
  await authedJson<unknown>(
    `/api/v1/holosong/admin/songs/${encodeURIComponent(id)}/reject`,
    { method: "POST" }
  );
}

export async function refreshHolosongPreviews(): Promise<void> {
  await authedJson<unknown>("/api/v1/holosong/admin/refresh-previews", {
    method: "POST",
  });
}

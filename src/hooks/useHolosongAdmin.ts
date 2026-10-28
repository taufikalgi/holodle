"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/errors";
import {
  approveHolosongAdminSong,
  fetchHolosongAdminSongs,
  refreshHolosongPreviews,
  rejectHolosongAdminSong,
  updateHolosongAdminSong,
  type HolosongAdminSong,
  type HolosongAdminSongPage,
  type HolosongAdminSongUpdate,
  type HolosongSongStatus,
} from "@/lib/holosong-admin-api";

const PAGE_SIZE = 20;

const emptyPage: HolosongAdminSongPage = {
  songs: [],
  total: 0,
  page: 1,
  page_size: PAGE_SIZE,
  has_more: false,
};

export function useHolosongAdmin() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();

  const [pageData, setPageData] = useState<HolosongAdminSongPage>(emptyPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | HolosongSongStatus>("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<HolosongAdminSong | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshingPreviews, setRefreshingPreviews] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(
    null
  );
  const requestId = useRef(0);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchSongs = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await fetchHolosongAdminSongs({
        status: statusFilter,
        q: debouncedSearch,
        page,
        pageSize: PAGE_SIZE,
      });
      if (requestId.current !== id) return;
      setPageData(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (requestId.current !== id) return;
      setError(e instanceof Error ? e.message : "Failed to fetch Holosong songs");
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page, router]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) void fetchSongs();
  }, [authLoading, user, fetchSongs]);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const changeStatus = useCallback((value: "" | HolosongSongStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const runAction = useCallback(
    async (song: HolosongAdminSong, action: () => Promise<void>, success: string) => {
      setBusyId(song.id);
      try {
        await action();
        showToast(success);
        await fetchSongs();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/admin/login");
          return;
        }
        showToast(e instanceof Error ? e.message : "Action failed", "err");
      } finally {
        setBusyId(null);
      }
    },
    [fetchSongs, router, showToast]
  );

  const approve = useCallback(
    (song: HolosongAdminSong) =>
      runAction(song, () => approveHolosongAdminSong(song.id), "Song approved ✨"),
    [runAction]
  );

  const reject = useCallback(
    (song: HolosongAdminSong) =>
      runAction(song, () => rejectHolosongAdminSong(song.id), "Song rejected"),
    [runAction]
  );

  const saveEdit = useCallback(
    async (update: HolosongAdminSongUpdate) => {
      if (!editing) return;
      try {
        await updateHolosongAdminSong(editing.id, update);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/admin/login");
        }
        throw e;
      }
      setEditing(null);
      showToast("Song updated ✨");
      await fetchSongs();
    },
    [editing, fetchSongs, router, showToast]
  );

  const refreshPreviews = useCallback(async () => {
    setRefreshingPreviews(true);
    try {
      await refreshHolosongPreviews();
      showToast("Preview URLs refreshed");
      await fetchSongs();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      showToast(
        e instanceof Error ? e.message : "Failed to refresh previews",
        "err"
      );
    } finally {
      setRefreshingPreviews(false);
    }
  }, [fetchSongs, router, showToast]);

  return {
    user,
    authLoading,
    pageData,
    loading,
    error,
    search,
    setSearch: changeSearch,
    statusFilter,
    setStatusFilter: changeStatus,
    page,
    setPage,
    editing,
    setEditing,
    busyId,
    refreshingPreviews,
    toast,
    fetchSongs,
    approve,
    reject,
    saveEdit,
    refreshPreviews,
    handleLogout,
  };
}

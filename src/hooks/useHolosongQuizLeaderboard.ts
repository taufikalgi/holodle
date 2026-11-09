"use client";

import { useCallback, useRef, useState } from "react";
import {
  fetchHolosongQuizLeaderboard,
  holosongQuizLeaderboardHasMore,
  type HolosongQuizLeaderboardEntry,
} from "@/lib/holosong-quiz-api";

export function useHolosongQuizLeaderboard() {
  const [entries, setEntries] = useState<HolosongQuizLeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchHolosongQuizLeaderboard(1);
      setEntries(data.entries);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(holosongQuizLeaderboardHasMore(data));
      loadedRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadIfNeeded = useCallback(() => {
    if (!loadedRef.current) void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const data = await fetchHolosongQuizLeaderboard(page + 1);
      setEntries((prev) => [...prev, ...data.entries]);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(holosongQuizLeaderboardHasMore(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard.");
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page]);

  return {
    entries,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadIfNeeded,
    loadMore,
  };
}

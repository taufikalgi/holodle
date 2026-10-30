"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  searchHolosongSongs,
  type HolosongSearchField,
  type HolosongSongSummary,
} from "@/lib/holosong-api";

const DEBOUNCE_MS = 250;

export function useHolosongSearch(
  enabled: boolean,
  field: HolosongSearchField = "q"
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HolosongSongSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  const trimmed = query.trim();
  const active = enabled && trimmed.length >= 2;

  const reset = useCallback(() => {
    requestId.current += 1;
    setResults([]);
    setNextCursor(undefined);
    setHasMore(false);
  }, []);

  useEffect(() => {
    reset();
    setError("");
  }, [field, reset]);

  useEffect(() => {
    const id = ++requestId.current;
    if (!active) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      searchHolosongSongs({ query: trimmed, field })
        .then((page) => {
          if (requestId.current !== id) return;
          setResults(page.songs);
          setNextCursor(page.next_cursor);
          setHasMore(page.has_more);
          setError("");
        })
        .catch((e) => {
          if (requestId.current !== id) return;
          setResults([]);
          setNextCursor(undefined);
          setHasMore(false);
          setError(e instanceof Error ? e.message : "Search failed");
        })
        .finally(() => {
          if (requestId.current === id) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmed, field, active]);

  const loadMore = useCallback(async () => {
    if (!active || !hasMore || !nextCursor || loadingMoreRef.current) return;

    const id = requestId.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await searchHolosongSongs({
        query: trimmed,
        field,
        cursor: nextCursor,
      });
      if (requestId.current !== id) return;
      setResults((current) => [...current, ...page.songs]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
      setError("");
    } catch (e) {
      if (requestId.current !== id) return;
      setError(e instanceof Error ? e.message : "Failed to load more songs");
    } finally {
      loadingMoreRef.current = false;
      if (requestId.current === id) setLoadingMore(false);
    }
  }, [active, hasMore, nextCursor, trimmed, field]);

  const updateQuery = useCallback((value: string) => {
    setQuery(value);
    setError("");
  }, []);

  const clear = useCallback(() => {
    requestId.current += 1;
    setQuery("");
    setResults([]);
    setNextCursor(undefined);
    setHasMore(false);
    setError("");
  }, []);

  return {
    query,
    setQuery: updateQuery,
    results: active ? results : [],
    loading: active && loading,
    loadingMore,
    hasMore: active ? hasMore : false,
    loadMore,
    error: active ? error : "",
    clear,
  };
}

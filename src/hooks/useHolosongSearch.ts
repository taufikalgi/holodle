"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  searchHolosongSongs,
  type HolosongSongSummary,
} from "@/lib/holosong-api";

const DEBOUNCE_MS = 250;

export function useHolosongSearch(enabled: boolean) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HolosongSongSummary[]>([]);
  const [settledQuery, setSettledQuery] = useState("");
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const trimmed = query.trim();
  const active = enabled && trimmed.length >= 2;

  useEffect(() => {
    const id = ++requestId.current;
    if (!enabled || trimmed.length < 2) return;

    const timer = window.setTimeout(() => {
      searchHolosongSongs(trimmed)
        .then((songs) => {
          if (requestId.current !== id) return;
          setResults(songs);
          setSettledQuery(trimmed);
        })
        .catch((e) => {
          if (requestId.current !== id) return;
          setResults([]);
          setSettledQuery(trimmed);
          setError(e instanceof Error ? e.message : "Search failed");
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmed, enabled]);

  const updateQuery = useCallback((value: string) => {
    setQuery(value);
    setError("");
  }, []);

  const clear = useCallback(() => {
    requestId.current += 1;
    setQuery("");
    setResults([]);
    setSettledQuery("");
    setError("");
  }, []);

  return {
    query,
    setQuery: updateQuery,
    results: active ? results : [],
    loading: active && settledQuery !== trimmed,
    error: active ? error : "",
    clear,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  holosongLoadError,
  holosongSubmitError,
  statusOf,
} from "@/lib/api-errors";
import { deriveGameStatus } from "@/lib/game-status";
import {
  createHolosongEndless,
  fetchHolosongDaily,
  fetchHolosongSession,
  fetchHolosongStats,
  holosongAttemptsLeft,
  isHolosongFinished,
  submitHolosongGuess,
  type HolosongSession,
  type HolosongSessionMode,
  type HolosongStats,
} from "@/lib/holosong-api";

export type HolosongLoadStatus = "loading" | "ready" | "unavailable" | "error";

export function useHolosongGame(mode: HolosongSessionMode) {
  const [session, setSession] = useState<HolosongSession | null>(null);
  const [stats, setStats] = useState<HolosongStats | null>(null);
  const [statsAuthRequired, setStatsAuthRequired] = useState(false);
  const [loadStatus, setLoadStatus] = useState<HolosongLoadStatus>("loading");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchHolosongStats());
      setStatsAuthRequired(false);
    } catch (e) {
      const status = statusOf(e);
      setStatsAuthRequired(status === 401 || status === 403);
    }
  }, []);

  const loadDaily = useCallback(async () => {
    setLoadStatus("loading");
    setError("");
    try {
      const next = await fetchHolosongDaily();
      setSession(next);
      setLoadStatus("ready");
      void refreshStats();
    } catch (e) {
      const status = statusOf(e);
      const { loadStatus: nextStatus, message } = holosongLoadError(
        status,
        "Holosong",
        e
      );
      setLoadStatus(nextStatus);
      setError(message);
    }
  }, [refreshStats]);

  const startEndless = useCallback(async () => {
    setLoadStatus("loading");
    setError("");
    try {
      setSession(await createHolosongEndless());
      setLoadStatus("ready");
    } catch (e) {
      const status = statusOf(e);
      const { loadStatus: nextStatus, message } = holosongLoadError(
        status,
        "Holosong",
        e
      );
      setLoadStatus(nextStatus);
      setError(message);
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void (mode === "daily" ? loadDaily() : startEndless());
  }, [mode, loadDaily, startEndless]);

  const submit = useCallback(
    async (songId?: string) => {
      if (!session || submitting || isHolosongFinished(session)) return;

      setSubmitting(true);
      setError("");
      try {
        const next = await submitHolosongGuess(
          session.id,
          songId,
          session.version
        );
        setSession(next);
        if (mode === "daily" && isHolosongFinished(next)) void refreshStats();
      } catch (e) {
        const status = statusOf(e);
        if (status === 409) {
          try {
            const fresh = await fetchHolosongSession(session.id);
            setSession(fresh);
            setError("Session refreshed — try again.");
          } catch {
            setError("Session expired. Reload the page.");
          }
        } else {
          setError(holosongSubmitError(status, e));
        }
      } finally {
        setSubmitting(false);
      }
    },
    [session, submitting, mode, refreshStats]
  );

  const retry = useCallback(() => {
    void (mode === "daily" ? loadDaily() : startEndless());
  }, [mode, loadDaily, startEndless]);

  const newRun = useCallback(() => {
    void startEndless();
  }, [startEndless]);

  const status = deriveGameStatus({
    loading: loadStatus === "loading",
    error: loadStatus === "error" ? error : "",
    empty: loadStatus === "unavailable",
    gameOver: isHolosongFinished(session),
    won: session?.status === "won",
  });

  return {
    session,
    stats,
    statsAuthRequired,
    loadStatus,
    error,
    submitting,
    status,
    attemptsLeft: holosongAttemptsLeft(session),
    submit,
    retry,
    newRun,
  };
}

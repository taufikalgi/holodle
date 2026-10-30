"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/errors";
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

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
}

export function useHolosongGame(mode: HolosongSessionMode) {
  const [session, setSession] = useState<HolosongSession | null>(null);
  const [stats, setStats] = useState<HolosongStats | null>(null);
  const [loadStatus, setLoadStatus] = useState<HolosongLoadStatus>("loading");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchHolosongStats());
    } catch {
      // Stats are decorative; the round must still be playable.
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
      setLoadStatus(status === 404 ? "unavailable" : "error");
      setError(
        status === 404
          ? "No Holosong songs are available yet. Try again later."
          : status === 401
            ? "Please sign in to play Holosong."
            : messageOf(e, "Failed to load Holosong.")
      );
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
      setLoadStatus("error");
      setError(
        status === 401
          ? "Please sign in to play Holosong."
          : messageOf(e, "Failed to start an endless session.")
      );
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
          setError(
            status === 401
              ? "Your session expired. Please sign in again."
              : status === 403
                ? "This session belongs to another user."
                : status === 404
                  ? "Session or song not found."
                  : status === 429
                    ? "Too many guesses — wait a moment and try again."
                    : messageOf(e, "Guess failed. Try again.")
          );
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

  const newSong = useCallback(() => {
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
    loadStatus,
    error,
    submitting,
    status,
    attemptsLeft: holosongAttemptsLeft(session),
    submit,
    retry,
    newSong,
  };
}

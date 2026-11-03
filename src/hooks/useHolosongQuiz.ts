"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/errors";
import { deriveGameStatus } from "@/lib/game-status";
import {
  fetchHolosongQuizDaily,
  fetchHolosongQuizSession,
  fetchHolosongQuizStats,
  isHolosongQuizFinished,
  startHolosongQuizEndless,
  submitHolosongQuizGuess,
  type HolosongQuizMode,
  type HolosongQuizSession,
  type HolosongQuizStats,
} from "@/lib/holosong-quiz-api";

export type HolosongQuizLoadStatus = "loading" | "ready" | "unavailable" | "error";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
}

export function useHolosongQuiz(mode: HolosongQuizMode) {
  const [session, setSession] = useState<HolosongQuizSession | null>(null);
  const [stats, setStats] = useState<HolosongQuizStats | null>(null);
  const [statsAuthRequired, setStatsAuthRequired] = useState(false);
  const [loadStatus, setLoadStatus] = useState<HolosongQuizLoadStatus>("loading");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await fetchHolosongQuizStats());
      setStatsAuthRequired(false);
    } catch (e) {
      const status = statusOf(e);
      setStatsAuthRequired(status === 401 || status === 403);
    }
  }, []);

  const load = useCallback(async () => {
    setLoadStatus("loading");
    setError("");
    try {
      const next =
        mode === "daily" ? await fetchHolosongQuizDaily() : await startHolosongQuizEndless();
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
            ? "Please sign in to play Holosong Quiz."
            : messageOf(e, "Failed to load Holosong Quiz.")
      );
    }
  }, [mode, refreshStats]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void load();
  }, [load]);

  const submit = useCallback(
    async (songId: string) => {
      if (!session || submitting || isHolosongQuizFinished(session)) return;

      setSubmitting(true);
      setError("");
      try {
        const next = await submitHolosongQuizGuess(session.id, songId, session.version);
        setSession(next);
        if (isHolosongQuizFinished(next)) void refreshStats();
      } catch (e) {
        const status = statusOf(e);
        if (status === 409) {
          try {
            const fresh = await fetchHolosongQuizSession(session.id);
            setSession(fresh);
            setError(
              isHolosongQuizFinished(fresh)
                ? "This round is already finished."
                : "Session refreshed — try again."
            );
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
    [session, submitting, refreshStats]
  );

  const retry = useCallback(() => {
    void load();
  }, [load]);

  const newRun = useCallback(() => {
    void load();
  }, [load]);

  const status = deriveGameStatus({
    loading: loadStatus === "loading",
    error: loadStatus === "error" ? error : "",
    empty: loadStatus === "unavailable",
    gameOver: isHolosongQuizFinished(session),
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
    submit,
    retry,
    newRun,
  };
}

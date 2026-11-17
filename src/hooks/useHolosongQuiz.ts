"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  holosongLoadError,
  holosongSubmitError,
  statusOf,
} from "@/lib/api-errors";
import { deriveGameStatus } from "@/lib/game-status";
import {
  fetchHolosongQuizDaily,
  fetchHolosongQuizSession,
  fetchHolosongQuizStats,
  isHolosongQuizCorrectAdvance,
  isHolosongQuizFinished,
  startHolosongQuizEndless,
  submitHolosongQuizGuess,
  type HolosongQuizMode,
  type HolosongQuizOption,
  type HolosongQuizSession,
  type HolosongQuizStats,
} from "@/lib/holosong-quiz-api";

export type HolosongQuizLoadStatus = "loading" | "ready" | "unavailable" | "error";

export function useHolosongQuiz(mode: HolosongQuizMode) {
  const [session, setSession] = useState<HolosongQuizSession | null>(null);
  const [stats, setStats] = useState<HolosongQuizStats | null>(null);
  const [statsAuthRequired, setStatsAuthRequired] = useState(false);
  const [loadStatus, setLoadStatus] = useState<HolosongQuizLoadStatus>("loading");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [correctReveal, setCorrectReveal] = useState<HolosongQuizOption | null>(null);
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
    setCorrectReveal(null);
    try {
      const next =
        mode === "daily" ? await fetchHolosongQuizDaily() : await startHolosongQuizEndless();
      setSession(next);
      setLoadStatus("ready");
      void refreshStats();
    } catch (e) {
      const status = statusOf(e);
      const { loadStatus: nextStatus, message } = holosongLoadError(
        status,
        "Holosong Quiz",
        e
      );
      setLoadStatus(nextStatus);
      setError(message);
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
      const chosen = session.options.find((option) => option.song_id === songId);
      try {
        const next = await submitHolosongQuizGuess(session.id, songId, session.version);
        setSession(next);
        setCorrectReveal(
          chosen && isHolosongQuizCorrectAdvance(mode, session, next) ? chosen : null
        );
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
          setError(holosongSubmitError(status, e));
        }
      } finally {
        setSubmitting(false);
      }
    },
    [session, submitting, refreshStats, mode]
  );

  const retry = useCallback(() => {
    void load();
  }, [load]);

  const newRun = useCallback(() => {
    void load();
  }, [load]);

  const nextRound = useCallback(() => {
    setCorrectReveal(null);
  }, []);

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
    correctReveal,
    nextRound,
  };
}

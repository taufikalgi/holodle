"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/errors";
import { createGameSession, submitSessionGuess } from "@/lib/commands";
import { fetchSession, fetchSessionTalents } from "@/lib/queries";
import {
  redirectToLogin,
  clearStoredHistory,
  formatTimer,
  getEmptySessionHistoryState,
  getStoredHistoryState,
  setStoredHistoryState,
} from "@/components/competitive-classic/utils";
import { useSessionMachine } from "@/hooks/useGameMachine";
import type {
  AuthUser,
  GameSession,
  GuessEntry,
  TalentChoice,
} from "@/components/competitive-classic/types";

const SESSION_KEY = "competitive-classic-session-id";

export function useCompetitiveSession(user: AuthUser | null) {
  const [talents, setTalents] = useState<TalentChoice[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);
  const [talentError, setTalentError] = useState("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [currentRoundHistory, setCurrentRoundHistory] = useState<GuessEntry[]>([]);
  const [previousRounds, setPreviousRounds] = useState<GuessEntry[][]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "ok" | "err" } | null>(null);
  const [now, setNow] = useState(Date.now());

  const guessedIds = useMemo(
    () => new Set(currentRoundHistory.map((item) => item.talent.id)),
    [currentRoundHistory]
  );

  const expiresAt = session ? Date.parse(session.expires_at) : null;
  const expired = expiresAt !== null && expiresAt <= now;
  const sessionStatus = useSessionMachine({
    user,
    loading: sessionLoading || talentsLoading,
    session,
    ended: sessionEnded,
    expired,
    submitting: submittingId !== null,
    error: sessionError,
  });
  const active = sessionStatus === "active" || sessionStatus === "submitting";
  const timeLeftMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const timeLeftText = session ? formatTimer(timeLeftMs) : "--:--";

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    redirectToLogin();
  }, []);

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError("");
    setSessionEnded(false);
    const storedSessionId = localStorage.getItem(SESSION_KEY);

    if (!storedSessionId) {
      setSession(null);
      setCurrentRoundHistory([]);
      setPreviousRounds([]);
      setSessionLoading(false);
      return;
    }

    if (storedSessionId) {
      try {
        const loaded = await fetchSession(storedSessionId);
        const expiresAtMs = Date.parse(loaded.expires_at);
        if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
          setSession(loaded);
          setSessionEnded(true);
          const stored = getStoredHistoryState(loaded.id);
          setCurrentRoundHistory(stored.currentRound);
          setPreviousRounds(stored.previousRounds);
          setSessionLoading(false);
          return;
        }

        setSession(loaded);
        const stored = getStoredHistoryState(loaded.id);
        setCurrentRoundHistory(stored.currentRound);
        setPreviousRounds(stored.previousRounds);
        setStoredHistoryState(loaded.id, stored);
        setSessionLoading(false);
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized();
          setSessionLoading(false);
          return;
        }
        if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
          localStorage.removeItem(SESSION_KEY);
          clearStoredHistory(storedSessionId);
          setSession(null);
          setSessionEnded(false);
          setSessionError("");
          setSessionLoading(false);
          return;
        }

        localStorage.removeItem(SESSION_KEY);
        clearStoredHistory(storedSessionId);
      }
    }
  }, [handleUnauthorized]);

  const createSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError("");
    setSessionEnded(false);
    try {
      const created = await createGameSession();
      localStorage.setItem(SESSION_KEY, created.id);
      setStoredHistoryState(created.id, getEmptySessionHistoryState());
      setSession(created);
      setCurrentRoundHistory([]);
      setPreviousRounds([]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleUnauthorized();
        setSessionLoading(false);
        return;
      }
      setSessionError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSessionLoading(false);
    }
  }, [handleUnauthorized]);

  const startNewSession = useCallback(async () => {
    if (session?.id) {
      localStorage.removeItem(SESSION_KEY);
      clearStoredHistory(session.id);
    }
    setSession(null);
    setCurrentRoundHistory([]);
    setPreviousRounds([]);
    await createSession();
  }, [createSession, session?.id]);

  const submitGuess = useCallback(
    async (talent: TalentChoice) => {
      if (!session || !active || submittingId) return;
      if (guessedIds.has(talent.id)) return;

      setSubmittingId(talent.id);
      setSessionError("");

      try {
        const data = await submitSessionGuess(session.id, talent.id);

        const entry: GuessEntry = {
          talent,
          comparison: data.comparison,
          correct: data.correct,
          submittedAt: new Date().toISOString(),
        };

        if (data.correct) {
          const completedRound = [...currentRoundHistory, entry];
          setPreviousRounds((prevRounds) => [...prevRounds, completedRound]);
          setCurrentRoundHistory([]);
        } else {
          setCurrentRoundHistory((prev) => [...prev, entry]);
        }

        setSession((prev) =>
          prev
            ? {
                ...prev,
                score: data.session.score,
                correct_guesses: data.session.correct_guesses,
                wrong_answers: data.session.wrong_answers,
                round_number: data.session.round_number,
                updated_at: new Date().toISOString(),
              }
            : prev
        );
        setToast({
          message: data.correct ? "Correct guess." : "Wrong answer.",
          type: data.correct ? "ok" : "err",
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized();
          return;
        }
        if (err instanceof ApiError && /expired/i.test(err.message)) {
          setSessionEnded(true);
          setSessionError("Game session expired.");
          return;
        }
        setSessionError(err instanceof Error ? err.message : "Failed to submit guess");
      } finally {
        setSubmittingId(null);
      }
    },
    [active, currentRoundHistory, guessedIds, handleUnauthorized, session, submittingId]
  );

  useEffect(() => {
    if (!user) {
      setTalentsLoading(false);
      setSessionLoading(false);
      return;
    }
    let alive = true;

    const loadTalents = async () => {
      setTalentsLoading(true);
      setTalentError("");
      try {
        const choices = await fetchSessionTalents();
        if (!alive) return;
        setTalents(choices);
      } catch (err) {
        if (!alive) return;
        if (!(err instanceof ApiError && err.status === 401)) {
          setTalentError(err instanceof Error ? err.message : "Failed to fetch talents");
        }
      } finally {
        if (alive) setTalentsLoading(false);
      }
    };

    void loadTalents();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || talentsLoading) return;
    void loadSession();
  }, [loadSession, talentsLoading, user]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session || sessionEnded) return;
    const expiresAtMs = Date.parse(session.expires_at);
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= now) {
      setSessionEnded(true);
      setSessionError("Game session expired.");
    }
  }, [now, session, sessionEnded]);

  useEffect(() => {
    if (!session?.id) return;
    localStorage.setItem(SESSION_KEY, session.id);
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;
    setStoredHistoryState(session.id, {
      currentRound: currentRoundHistory,
      previousRounds,
    });
  }, [currentRoundHistory, previousRounds, session?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearInterval(timer);
  }, [toast]);

  return {
    talents,
    talentsLoading,
    talentError,
    session,
    sessionLoading,
    sessionError,
    setSessionError,
    currentRoundHistory,
    previousRounds,
    toast,
    sessionStatus,
    active,
    timeLeftText,
    guessedIds,
    startNewSession,
    submitGuess,
  };
}

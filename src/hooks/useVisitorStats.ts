"use client";

import { useCallback, useEffect, useState } from "react";
import { requestErrorMessage, statusOf } from "@/lib/api-errors";
import {
  fetchVisitors,
  type VisitorStatsResponse,
} from "@/lib/visitors-api";

export type VisitorRange = 7 | 30;

export function useVisitorStats(enabled = true) {
  const [days, setDaysState] = useState<VisitorRange>(7);
  const [data, setData] = useState<VisitorStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;

    fetchVisitors(days, controller.signal)
      .then((next) => {
        if (active) setData(next);
      })
      .catch((reason: unknown) => {
        if (!active || controller.signal.aborted) return;
        const status = statusOf(reason);
        setUnavailable(status === 404 || status === 501);
        setError(
          status === 403
            ? "Admin access required."
            : requestErrorMessage(
                status,
                "Could not load visitor stats. Try again."
              )
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [days, attempt, enabled]);

  const setDays = useCallback(
    (next: VisitorRange) => {
      if (next === days) return;
      setDaysState(next);
      setLoading(true);
      setError("");
      setUnavailable(false);
    },
    [days]
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError("");
    setUnavailable(false);
    setAttempt((value) => value + 1);
  }, []);

  return { days, setDays, data, loading, error, unavailable, retry };
}

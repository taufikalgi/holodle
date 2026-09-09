"use client";

import { useCallback, useRef, useState } from "react";
import { fetchLeaderboardPage } from "@/lib/queries";
import {
  addDays,
  addMonths,
  getMondayDate,
  toIsoDate,
  toMonthString,
} from "@/components/competitive-classic/utils";
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
} from "@/components/competitive-classic/types";

const MIN_MONTH = "2026-06";

export function useLeaderboard(onError: (msg: string) => void) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardLoadingMore, setLeaderboardLoadingMore] = useState(false);
  const [leaderboardTotal, setLeaderboardTotal] = useState(0);
  const [leaderboardHasMore, setLeaderboardHasMore] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [week, setWeek] = useState(() => toIsoDate(getMondayDate(new Date())));
  const [month, setMonth] = useState(() => toMonthString(new Date()));

  // Ref so callbacks stay stable when the page passes an inline lambda;
  // otherwise fetchLeaderboard identity would churn and refetch in a loop.
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardLoadingMore(false);
    setLeaderboard([]);
    setLeaderboardPage(0);
    try {
      const data = await fetchLeaderboardPage({ period, page: 1, week, month });
      setLeaderboard(data.entries);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      onErrorRef.current(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [period, week, month]);

  const loadMoreLeaderboard = useCallback(async () => {
    if (leaderboardLoading || leaderboardLoadingMore || !leaderboardHasMore) return;
    setLeaderboardLoadingMore(true);
    try {
      const data = await fetchLeaderboardPage({
        period,
        page: leaderboardPage + 1,
        week,
        month,
      });
      setLeaderboard((prev) => [...prev, ...data.entries]);
      setLeaderboardTotal(data.total);
      setLeaderboardHasMore(data.has_more);
      setLeaderboardPage(data.page);
    } catch (err) {
      onErrorRef.current(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLeaderboardLoadingMore(false);
    }
  }, [
    period,
    week,
    month,
    leaderboardHasMore,
    leaderboardLoading,
    leaderboardLoadingMore,
    leaderboardPage,
  ]);

  const changePeriod = useCallback((next: LeaderboardPeriod) => {
    setPeriod(next);
    if (next === "weekly") setWeek(toIsoDate(getMondayDate(new Date())));
    if (next === "monthly") setMonth(toMonthString(new Date()));
  }, []);

  const navigatePeriod = useCallback(
    (direction: 1 | -1) => {
      if (period === "weekly") {
        setWeek((w) => toIsoDate(addDays(new Date(w + "T00:00:00"), direction * 7)));
        return;
      }
      if (period === "monthly") {
        setMonth((m) => {
          const next = toMonthString(addMonths(new Date(m + "-01T00:00:00"), direction));
          const max = toMonthString(new Date());
          if (next < MIN_MONTH) return MIN_MONTH;
          if (next > max) return max;
          return next;
        });
      }
    },
    [period]
  );

  const currentMonth = toMonthString(new Date());
  const prevMonth = toMonthString(addMonths(new Date(month + "-01T00:00:00"), -1));
  const nextMonth = toMonthString(addMonths(new Date(month + "-01T00:00:00"), 1));
  const monthPrevDisabled = prevMonth < MIN_MONTH;
  const monthNextDisabled = nextMonth > currentMonth;

  return {
    leaderboard,
    leaderboardLoading,
    leaderboardLoadingMore,
    leaderboardTotal,
    leaderboardHasMore,
    leaderboardPage,
    period,
    week,
    month,
    monthPrevDisabled,
    monthNextDisabled,
    fetchLeaderboard,
    loadMoreLeaderboard,
    changePeriod,
    navigatePeriod,
  };
}

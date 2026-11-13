import { authedJson } from "./api-client";
import { ApiError } from "./errors";
import { isRecord } from "./type-guards";

export interface VisitorStatsPoint {
  date: string;
  active_players: number;
  new_players: number;
  new_guests: number;
  classic_sessions: number;
  holosong_sessions: number;
  holosong_quiz_sessions: number;
  guesses: number;
}

export interface VisitorStatsTotals {
  active_players: number;
  new_players: number;
  new_guests: number;
  classic_sessions: number;
  holosong_sessions: number;
  holosong_quiz_sessions: number;
  guesses: number;
}

export interface VisitorStatsResponse {
  range_days: number;
  totals: VisitorStatsTotals;
  series: VisitorStatsPoint[];
  generated_at: string;
  privacy_note: string;
}

export type VisitorMetric = "active_players" | "sessions" | "guesses";

const POINT_KEYS = [
  "active_players",
  "new_players",
  "new_guests",
  "classic_sessions",
  "holosong_sessions",
  "holosong_quiz_sessions",
  "guesses",
] as const;

function isVisitorPoint(value: unknown): value is VisitorStatsPoint {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    POINT_KEYS.every((key) => typeof value[key] === "number")
  );
}

function isVisitorTotals(value: unknown): value is VisitorStatsTotals {
  return isRecord(value) && POINT_KEYS.every((key) => typeof value[key] === "number");
}

export function parseVisitorsResponse(value: unknown): VisitorStatsResponse {
  if (
    !isRecord(value) ||
    typeof value.range_days !== "number" ||
    !isVisitorTotals(value.totals) ||
    !Array.isArray(value.series) ||
    !value.series.every(isVisitorPoint) ||
    typeof value.generated_at !== "string" ||
    typeof value.privacy_note !== "string"
  ) {
    throw new ApiError("invalid visitor stats payload", 500);
  }

  return value as unknown as VisitorStatsResponse;
}

export function buildVisitorsPath(days: number): string {
  const safeDays = Math.min(90, Math.max(1, Math.floor(days)));
  return `/api/v1/stats/visitors?days=${safeDays}`;
}

export async function fetchVisitors(
  days: number,
  signal?: AbortSignal
): Promise<VisitorStatsResponse> {
  const data = await authedJson<unknown>(buildVisitorsPath(days), { signal });
  return parseVisitorsResponse(data);
}

export function sessionsForTotals(totals: VisitorStatsTotals): number {
  return (
    totals.classic_sessions +
    totals.holosong_sessions +
    totals.holosong_quiz_sessions
  );
}

export function sessionsForPoint(point: VisitorStatsPoint): number {
  return sessionsForTotals(point);
}

export function metricValue(point: VisitorStatsPoint, metric: VisitorMetric): number {
  return metric === "sessions" ? sessionsForPoint(point) : point[metric];
}

export function getChartMax(series: VisitorStatsPoint[], metric: VisitorMetric): number {
  return series.reduce((max, point) => Math.max(max, metricValue(point, metric)), 0);
}

export function formatVisitorDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

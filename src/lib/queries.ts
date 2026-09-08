import { authedJson, publicJson } from "./api-client";
import { ApiError } from "./errors";
import { normalizeTalent, type ApiTalent } from "./talents";
import type { Talent as AdminTalent } from "./talent-api";
import type {
  GameSession,
  LeaderboardPeriod,
  LeaderboardResponse,
  TalentChoice,
} from "@/components/competitive-classic/types";

/**
 * Read operations (queries). All go through the shared api-client;
 * 401s surface as ApiError so callers decide (e.g. route to login).
 */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/** Load-bearing fields only — corrupt rows are dropped, never fatal. */
function isAdminTalent(x: unknown): x is AdminTalent {
  return (
    isRecord(x) &&
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.branch === "string" &&
    Array.isArray(x.alt_names)
  );
}

function isValidSession(x: unknown): x is GameSession {
  return (
    isRecord(x) &&
    typeof x.id === "string" &&
    typeof x.expires_at === "string" &&
    typeof x.score === "number" &&
    typeof x.round_number === "number"
  );
}

function isValidLeaderboard(x: unknown): x is LeaderboardResponse {
  return (
    isRecord(x) &&
    Array.isArray(x.entries) &&
    typeof x.total === "number" &&
    typeof x.has_more === "boolean" &&
    typeof x.page === "number"
  );
}

/** Admin talent list (snake_case wire shape). */
export async function fetchTalentList(): Promise<AdminTalent[]> {
  const data = await authedJson<AdminTalent[]>("/api/v1/talent/");
  if (!Array.isArray(data)) throw new ApiError("invalid talents payload", 500);
  return data.filter(isAdminTalent);
}

export async function fetchSession(sessionId: string): Promise<GameSession> {
  const data = await authedJson<GameSession>(`/api/v1/game-session/${sessionId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!isValidSession(data)) throw new ApiError("invalid session payload", 500);
  return data;
}

export async function fetchSessionTalents(): Promise<TalentChoice[]> {
  const data = await authedJson<ApiTalent[]>("/api/v1/talent/", {
    method: "GET",
    credentials: "include",
  });
  if (!Array.isArray(data)) throw new ApiError("invalid talents payload", 500);
  return data
    .filter(
      (t): t is ApiTalent =>
        isRecord(t) && typeof t.id === "string" && typeof t.name === "string"
    )
    .map(normalizeTalent);
}

export async function fetchLeaderboardPage(args: {
  period: LeaderboardPeriod;
  page: number;
  week: string;
  month: string;
}): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({
    period: args.period,
    page: String(args.page),
    page_size: "20",
  });
  if (args.period === "weekly") params.set("week", args.week);
  if (args.period === "monthly") params.set("month", args.month);
  const data = await publicJson<LeaderboardResponse>(
    `/api/v1/game-session/leaderboard?${params.toString()}`
  );
  if (!isValidLeaderboard(data)) throw new ApiError("invalid leaderboard payload", 500);
  return data;
}

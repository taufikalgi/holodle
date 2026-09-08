import { authedJson, publicJson } from "./api-client";
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

/** Admin talent list (snake_case wire shape). */
export function fetchTalentList(): Promise<AdminTalent[]> {
  return authedJson<AdminTalent[]>("/api/v1/talent/");
}

export function fetchSession(sessionId: string): Promise<GameSession> {
  return authedJson<GameSession>(`/api/v1/game-session/${sessionId}`, {
    method: "GET",
    credentials: "include",
  });
}

export async function fetchSessionTalents(): Promise<TalentChoice[]> {
  const data = await authedJson<ApiTalent[]>("/api/v1/talent/", {
    method: "GET",
    credentials: "include",
  });
  return data.map(normalizeTalent);
}

export function fetchLeaderboardPage(args: {
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
  return publicJson<LeaderboardResponse>(
    `/api/v1/game-session/leaderboard?${params.toString()}`
  );
}

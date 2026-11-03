import { authedJson, publicJson } from "./api-client";
import type { HolosongSong } from "./holosong-api";

export type HolosongQuizMode = "daily" | "endless";
export type HolosongQuizStatus = "ongoing" | "won" | "lost";

export interface HolosongQuizOption {
  song_id: string;
  title: string;
  artist: string;
  artwork_url?: string;
}

export interface HolosongQuizGuess {
  round_number: number;
  song_id: string;
  song_title?: string;
  song_artist?: string;
  correct: boolean;
  guessed_at: string;
}

export interface HolosongQuizSession {
  id: string;
  mode: HolosongQuizMode;
  challenge_date?: string;
  status: HolosongQuizStatus;
  guesses_used: number;
  round_number: number;
  clip_seconds: number;
  clip_start_ms: number;
  preview_url: string;
  options: HolosongQuizOption[];
  board: HolosongQuizGuess[];
  rounds_played: number;
  rounds_won: number;
  current_streak: number;
  longest_streak: number;
  version: number;
  answer?: HolosongSong;
}

export interface HolosongQuizDailyStats {
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
}

export interface HolosongQuizEndlessStats {
  runs_played: number;
  best_streak: number;
  current_streak: number;
  total_correct: number;
}

export interface HolosongQuizStats {
  daily: HolosongQuizDailyStats;
  endless: HolosongQuizEndlessStats;
}

export interface HolosongQuizLeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  picture?: string;
  longest_streak: number;
}

export interface HolosongQuizLeaderboard {
  entries: HolosongQuizLeaderboardEntry[];
  total: number;
  page: number;
  page_size: number;
}

export const HOLOSONG_QUIZ_CLIP_SECONDS = 5;
export const HOLOSONG_QUIZ_OPTION_COUNT = 3;
export const HOLOSONG_QUIZ_LEADERBOARD_PAGE_SIZE = 20;

export function isHolosongQuizFinished(session: HolosongQuizSession | null): boolean {
  return session?.status === "won" || session?.status === "lost";
}

export function holosongQuizLeaderboardHasMore(
  data: Pick<HolosongQuizLeaderboard, "page" | "page_size" | "total">
): boolean {
  return data.page * data.page_size < data.total;
}

export function buildHolosongQuizLeaderboardPath(
  page = 1,
  pageSize = HOLOSONG_QUIZ_LEADERBOARD_PAGE_SIZE
): string {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(Math.max(1, Math.floor(pageSize)), 100);
  return `/api/v1/holosong/quiz/leaderboard?page=${safePage}&page_size=${safeSize}`;
}

export async function fetchHolosongQuizDaily(): Promise<HolosongQuizSession> {
  return authedJson<HolosongQuizSession>("/api/v1/holosong/quiz/daily");
}

export async function startHolosongQuizEndless(): Promise<HolosongQuizSession> {
  return authedJson<HolosongQuizSession>("/api/v1/holosong/quiz/endless", {
    method: "POST",
  });
}

export async function fetchHolosongQuizSession(id: string): Promise<HolosongQuizSession> {
  return authedJson<HolosongQuizSession>(`/api/v1/holosong/quiz/session/${encodeURIComponent(id)}`);
}

export async function submitHolosongQuizGuess(
  sessionId: string,
  songId: string,
  expectedVersion: number
): Promise<HolosongQuizSession> {
  return authedJson<HolosongQuizSession>(
    `/api/v1/holosong/quiz/session/${encodeURIComponent(sessionId)}/guess`,
    {
      method: "POST",
      body: JSON.stringify({
        song_id: songId,
        expected_version: expectedVersion,
      }),
    }
  );
}

export async function fetchHolosongQuizStats(): Promise<HolosongQuizStats> {
  return authedJson<HolosongQuizStats>("/api/v1/holosong/quiz/stats");
}

export async function fetchHolosongQuizLeaderboard(
  page = 1,
  pageSize = HOLOSONG_QUIZ_LEADERBOARD_PAGE_SIZE
): Promise<HolosongQuizLeaderboard> {
  return publicJson<HolosongQuizLeaderboard>(buildHolosongQuizLeaderboardPath(page, pageSize));
}

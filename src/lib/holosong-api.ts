import { authedJson } from "./api-client";

export type HolosongSessionStatus = "ongoing" | "won" | "lost";
export type HolosongSessionMode = "daily" | "endless";

export interface HolosongGuess {
  guess_number: number;
  round_number?: number;
  song_id?: string;
  song_title?: string;
  song_artist?: string;
  skipped: boolean;
  correct: boolean;
  guessed_at: string;
}

export interface HolosongSong {
  id: string;
  itunes_track_id: number;
  title: string;
  artist: string;
  album?: string;
  artwork_url?: string;
  preview_url?: string;
  track_view_url?: string;
  release_date?: string;
  status?: "pending" | "approved" | "rejected";
}

export interface HolosongSession {
  id: string;
  mode: HolosongSessionMode;
  challenge_date?: string;
  status: HolosongSessionStatus;
  attempts: number;
  guesses_used: number;
  clip_seconds: number;
  preview_url: string;
  board: HolosongGuess[];
  round_number: number;
  rounds_played: number;
  rounds_won: number;
  current_streak: number;
  longest_streak: number;
  win_rate_percentage: number;
  version: number;
  answer?: HolosongSong;
}

export interface HolosongSongSummary {
  id: string;
  title: string;
  artist: string;
  artwork_url?: string;
}

export interface HolosongStats {
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  average_guesses: number;
  guess_distribution: number[];
}

export const HOLOSONG_MAX_ATTEMPTS = 5;
export const HOLOSONG_CLIP_STEPS = [0.13, 0.53, 2, 8, 15] as const;
export const HOLOSONG_MAX_CLIP_SECONDS =
  HOLOSONG_CLIP_STEPS[HOLOSONG_CLIP_STEPS.length - 1];

export function isHolosongFinished(session: HolosongSession | null): boolean {
  return session?.status === "won" || session?.status === "lost";
}

export function holosongAttemptsLeft(session: HolosongSession | null): number {
  if (!session) return HOLOSONG_MAX_ATTEMPTS;
  return Math.max(0, session.attempts - session.guesses_used);
}

/** Short clips show one decimal (0.13 -> "0.1s"); whole clips stay compact. */
export function formatHolosongClip(seconds: number): string {
  const rounded = Math.round(seconds * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}s`;
}

export function formatHolosongWinRate(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

/** Cumulative step-bar width up to the given clip, as a percentage. */
export function holosongClipBarPercent(seconds: number): number {
  const found = HOLOSONG_CLIP_STEPS.findIndex(
    (step) => step >= seconds - 0.001
  );
  const lastIndex =
    found === -1 ? HOLOSONG_CLIP_STEPS.length - 1 : found;
  const total = HOLOSONG_CLIP_STEPS.reduce((sum, step) => sum + step, 0);
  const used = HOLOSONG_CLIP_STEPS.slice(0, lastIndex + 1).reduce(
    (sum, step) => sum + step,
    0
  );
  return (used / total) * 100;
}

export async function fetchHolosongDaily(): Promise<HolosongSession> {
  return authedJson<HolosongSession>("/api/v1/holosong/daily");
}

export async function createHolosongEndless(): Promise<HolosongSession> {
  return authedJson<HolosongSession>("/api/v1/holosong/endless", {
    method: "POST",
  });
}

export async function fetchHolosongSession(id: string): Promise<HolosongSession> {
  return authedJson<HolosongSession>(
    `/api/v1/holosong/session/${encodeURIComponent(id)}`
  );
}

export async function submitHolosongGuess(
  sessionId: string,
  songId: string | undefined,
  expectedVersion: number
): Promise<HolosongSession> {
  return authedJson<HolosongSession>(
    `/api/v1/holosong/session/${encodeURIComponent(sessionId)}/guess`,
    {
      method: "POST",
      body: JSON.stringify({
        song_id: songId ?? "",
        expected_version: expectedVersion,
      }),
    }
  );
}

export async function searchHolosongSongs(
  query: string,
  limit = 10
): Promise<HolosongSongSummary[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    q,
    limit: String(Math.min(Math.max(limit, 1), 20)),
  });
  return authedJson<HolosongSongSummary[]>(
    `/api/v1/holosong/search?${params.toString()}`
  );
}

export async function fetchHolosongStats(): Promise<HolosongStats> {
  return authedJson<HolosongStats>("/api/v1/holosong/stats");
}

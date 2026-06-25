import type { Talent, CompareResult } from "@/lib/talents";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export type TalentChoice = Talent;
export type Comparison = CompareResult;

export type SessionSummary = {
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  round_number: number;
};

export type GameSession = {
  id: string;
  user_id: string;
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  round_number: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

export type GuessEntry = {
  talent: TalentChoice;
  comparison: Comparison;
  correct: boolean;
  submittedAt: string;
};

export type SessionHistoryState = {
  currentRound: GuessEntry[];
  previousRounds: GuessEntry[][];
};

export type LeaderboardEntry = {
  session_id: string;
  user_id: string;
  user_name: string;
  user_picture: string;
  score: number;
  correct_guesses: number;
  wrong_answers: number;
  expires_at: string;
  finished_at: string;
  rank: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

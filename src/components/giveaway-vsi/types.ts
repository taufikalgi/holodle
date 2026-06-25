export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export type ApiTalent = {
  id: string;
  name: string;
  branch: string;
  debut_year: number | null;
  lore_archetype: string;
  height: number | null;
  birth_month: string;
  image_url: string;
  alt_names: string[];
};

export type TalentChoice = {
  id: string;
  name: string;
  branch: string;
  debutYear: number | null;
  loreArchetype: string;
  height: number | null;
  birthMonth: string;
  photoUrl: string;
  altNames: string[];
};

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

export type ComparisonStatus = "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";

export type Comparison = {
  name: "correct" | "wrong";
  branch: "correct" | "wrong";
  debutYear: ComparisonStatus;
  loreArchetype: "correct" | "wrong";
  height: ComparisonStatus;
  birthMonth: ComparisonStatus;
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

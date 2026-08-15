import type { Talent } from "@/lib/talents";
import type { CropArea } from "@/lib/avatar-crops";
import type { AvatarRound } from "@/lib/avatar-api";

export type { AvatarRound };

export type AvatarGuess = { talent: Talent; correct: boolean };
export type AvatarStats = { streak: number; bestStreak: number; totalPlayed: number; totalWon: number };

export interface DailyState {
  talent: Talent | null;
  areas: CropArea[];
  guesses: AvatarGuess[];
  gameOver: boolean;
  won: boolean;
  date: string;
}

export interface EndlessRoundState {
  round: AvatarRound | null;
  guesses: AvatarGuess[];
  gameOver: boolean;
  won: boolean;
}

export interface EndlessPersisted {
  stats: AvatarStats;
  recentTalentIds: string[];
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isTalentLike(x: unknown): x is Talent {
  if (!isRecord(x)) return false;
  return typeof x.id === "string" && typeof x.name === "string";
}

function isCropAreaLike(x: unknown): boolean {
  if (!isRecord(x)) return false;
  return (
    typeof x.id === "string" &&
    typeof x.x === "number" &&
    typeof x.y === "number" &&
    typeof x.w === "number" &&
    typeof x.h === "number" &&
    (x.difficulty === "easy" || x.difficulty === "medium" || x.difficulty === "hard")
  );
}

function isGuessLike(x: unknown): boolean {
  if (!isRecord(x)) return false;
  return isTalentLike(x.talent) && typeof x.correct === "boolean";
}

export function isValidDailyState(data: unknown, date: string): data is DailyState {
  if (!isRecord(data)) return false;
  return (
    (data.talent === null || isTalentLike(data.talent)) &&
    Array.isArray(data.areas) &&
    data.areas.every(isCropAreaLike) &&
    Array.isArray(data.guesses) &&
    data.guesses.every(isGuessLike) &&
    typeof data.gameOver === "boolean" &&
    typeof data.won === "boolean" &&
    typeof data.date === "string" &&
    data.date === date
  );
}

export function isValidEndlessRoundState(data: unknown): data is EndlessRoundState {
  if (!isRecord(data)) return false;
  const r = isRecord(data.round) ? data.round : null;
  return (
    (data.round === null ||
      (r !== null &&
        isTalentLike(r.talent) &&
        Array.isArray(r.areas) &&
        r.areas.every(isCropAreaLike))) &&
    Array.isArray(data.guesses) &&
    data.guesses.every(isGuessLike) &&
    typeof data.gameOver === "boolean" &&
    typeof data.won === "boolean"
  );
}

export function isValidEndlessPersisted(data: unknown): data is EndlessPersisted {
  if (!isRecord(data)) return false;
  const st = isRecord(data.stats) ? data.stats : null;
  return (
    st !== null &&
    typeof st.streak === "number" &&
    typeof st.bestStreak === "number" &&
    typeof st.totalPlayed === "number" &&
    typeof st.totalWon === "number" &&
    Array.isArray(data.recentTalentIds) &&
    data.recentTalentIds.every((id: unknown) => typeof id === "string")
  );
}
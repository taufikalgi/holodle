import { compareTalents, type CompareResult, type Talent } from "./talents";

/** Single deterministic UI state for guess-flow games. */
export type GameStatus = "loading" | "playing" | "won" | "lost" | "empty" | "error";

export function deriveGameStatus(args: {
  loading: boolean;
  error: string;
  empty: boolean;
  gameOver: boolean;
  won: boolean;
}): GameStatus {
  if (args.loading) return "loading";
  if (args.error) return "error";
  if (args.empty) return "empty";
  if (args.gameOver) return args.won ? "won" : "lost";
  return "playing";
}

export type AvatarRoundStatus = "loading" | "ready" | "noValid" | "error";

/** Folds avatar round-load state + game outcome into one GameStatus. */
export function deriveAvatarStatus(
  round: AvatarRoundStatus,
  gameOver: boolean,
  won: boolean
): GameStatus {
  if (round === "loading") return "loading";
  if (round === "error") return "error";
  if (round === "noValid") return "empty";
  if (gameOver) return won ? "won" : "lost";
  return "playing";
}

export interface ClassicTransition {
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  won: boolean;
}

/**
 * Pure classic guess transition. Returns null when the guess changes nothing
 * (duplicate talent) so callers stay idempotent.
 */
export function applyClassicGuess(
  guesses: { talent: Talent; result: CompareResult }[],
  talent: Talent,
  answer: Talent,
  maxGuesses: number
): ClassicTransition | null {
  if (guesses.some((g) => g.talent.id === talent.id)) return null;
  const result = compareTalents(talent, answer);
  const won = talent.id === answer.id;
  const next = [...guesses, { talent, result }];
  return { guesses: next, gameOver: won || next.length >= maxGuesses, won };
}

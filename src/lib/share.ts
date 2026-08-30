import type { CompareResult } from "@/lib/talents";

function resultToEmoji(result: CompareResult): string {
  const cell = (status: string) =>
    status === "correct" ? "🟩" : status.endsWith("close") ? "🟨" : "⬛";
  return [
    cell(result.name),
    cell(result.branch),
    cell(result.debutYear),
    cell(result.loreArchetype),
    cell(result.height),
    cell(result.birthMonth),
  ].join("");
}

interface GridShareOptions {
  gameLabel: string;
  guesses: CompareResult[];
  maxGuesses: number;
  won: boolean;
  url?: string;
}

export function buildGridShareText({
  gameLabel,
  guesses,
  maxGuesses,
  won,
  url,
}: GridShareOptions): string {
  const guessCount = guesses.length;
  const score = maxGuesses > 0 ? `${guessCount}/${maxGuesses}` : "";
  const header = score ? `${gameLabel} ${score}` : gameLabel;
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const lines = [header, ""];
  lines.push(...guesses.map(resultToEmoji));
  lines.push("");
  if (shareUrl) lines.push(`Play Today's Game: ${shareUrl}`);
  return lines.join("\n");
}

export function buildAvatarShareText({
  mode,
  guessCount,
  maxGuesses,
  streak = 0,
  guesses,
  url,
}: {
  mode: string;
  guessCount: number;
  maxGuesses: number;
  streak?: number;
  guesses: boolean[];
  url?: string;
}): string {
  const score = maxGuesses > 0 ? `${guessCount}/${maxGuesses}` : "";
  const streakPart = streak > 0 ? ` — Streak ${streak} 🔥` : "";
  const header = `HOLODLE ${mode}${score ? ` ${score}` : ""}${streakPart}`;
  const row = guesses.map((correct) => (correct ? "🟩" : "🟥")).join("");
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const lines = [header, "", row, ""];
  if (shareUrl) lines.push(`Play Today's Game: ${shareUrl}`);
  return lines.join("\n");
}

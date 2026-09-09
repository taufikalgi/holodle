import { authedJson } from "./api-client";
import type { TalentFormData } from "./talents";
import type {
  Comparison,
  GameSession,
  SessionSummary,
} from "@/components/competitive-classic/types";

/**
 * Write operations (commands). Every mutating request carries an
 * Idempotency-Key so a retried request (timeout, double click that slips
 * past the UI guard) never applies twice server-side.
 */

function idempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function withIdempotency(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Idempotency-Key", idempotencyKey());
  return { ...init, headers };
}

export function createGameSession(): Promise<GameSession> {
  return authedJson<GameSession>(
    "/api/v1/game-session/create",
    withIdempotency({ method: "POST", credentials: "include" })
  );
}

export interface SessionGuessResult {
  correct: boolean;
  comparison: Comparison;
  session: SessionSummary;
}

export function submitSessionGuess(
  sessionId: string,
  talentId: string
): Promise<SessionGuessResult> {
  return authedJson<SessionGuessResult>(
    `/api/v1/game-session/${sessionId}/answer`,
    withIdempotency({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ talent_id: talentId }),
    })
  );
}

export async function saveTalent(
  mode: "create" | "edit",
  payload: TalentFormData & { alt_names: string[] }
): Promise<void> {
  await authedJson<Record<string, unknown>>(
    `/api/v1/talent/${mode === "create" ? "create" : "update"}`,
    withIdempotency({
      method: mode === "create" ? "POST" : "PUT",
      credentials: "include",
      body: JSON.stringify(payload),
    })
  );
}

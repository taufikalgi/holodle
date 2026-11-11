import { ApiError } from "./errors";

export function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
}

export function holosongLoadError(
  status: number,
  label: string,
  error: unknown
): { loadStatus: "unavailable" | "error"; message: string } {
  if (status === 404) {
    return {
      loadStatus: "unavailable",
      message: "No Holosong songs are available yet. Try again later.",
    };
  }
  return {
    loadStatus: "error",
    message:
      status === 401
        ? `Please sign in to play ${label}.`
        : messageOf(error, `Failed to load ${label}.`),
  };
}

export function holosongSubmitError(status: number, error: unknown): string {
  if (status === 401) return "Your session expired. Please sign in again.";
  if (status === 403) return "This session belongs to another user.";
  if (status === 404) return "Session or song not found.";
  if (status === 429) return "Too many guesses — wait a moment and try again.";
  return messageOf(error, "Guess failed. Try again.");
}

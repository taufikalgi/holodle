export const AUTH_REDIRECT_KEY = "auth_redirect_to";
export const DEFAULT_AUTH_REDIRECT = "/classic/competitive";

export const AUTH_REDIRECT_PATHS: ReadonlySet<string> = new Set([
  "/",
  "/login",
  "/classic/competitive",
  "/classic/daily",
  "/classic/endless",
  "/avatar/daily",
  "/avatar/endless",
  "/holosong/daily",
  "/holosong/endless",
  "/holosong/quiz/daily",
  "/holosong/quiz/endless",
  "/admin",
]);

export function getAuthRedirectTarget(
  target: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
): string {
  return target && AUTH_REDIRECT_PATHS.has(target) ? target : fallback;
}

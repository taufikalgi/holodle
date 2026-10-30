import { ApiError } from "./errors";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name} (check .env / deployment env)`);
  return value;
}

export function apiBaseUrl(): string {
  return requiredEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
}

export function googleAuthUrl(): string {
  return requiredEnv(
    "NEXT_PUBLIC_GOOGLE_AUTH_URL",
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
  );
}

export interface Envelope<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/** Single envelope reader — throws ApiError on !ok or success === false. */
export async function readEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok) {
    const message =
      json?.error || json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, res.headers.get("Retry-After"));
  }
  if (!json || json.success === false) {
    throw new ApiError(
      json?.message ?? json?.error ?? "Request failed",
      res.status,
      res.headers.get("Retry-After")
    );
  }
  return json.data as T;
}

const TOKEN_KEY = "token";

/** Stored JWT or null (safe on server). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove the stored JWT (safe on server). */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

function jsonHeaders(token: string | null, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function assertPath(path: string): void {
  if (/^https?:\/\//.test(path)) {
    throw new Error(`api-client expects a path, got a full URL: ${path}`);
  }
}

/** Unauthenticated request against API base. */
export function publicFetch(path: string, init?: RequestInit): Promise<Response> {
  assertPath(path);
  return fetch(`${apiBaseUrl()}${path}`, init);
}

/** Authenticated request — sends the browser's session cookie and Bearer token. */
export function authFetch(path: string, init?: RequestInit): Promise<Response> {
  assertPath(path);
  const token = getToken();
  return fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: jsonHeaders(token, init),
  });
}

/** GET-style helper: fetch + unwrap envelope. */
export async function publicJson<T>(path: string, init?: RequestInit): Promise<T> {
  return readEnvelope<T>(await publicFetch(path, init));
}

/** Authenticated helper: fetch + unwrap envelope. */
export async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  return readEnvelope<T>(await authFetch(path, init));
}

import { ApiError } from "./errors";
import { emitAppEvent } from "./events";

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
  const text = await res.text().catch(() => "");
  let json: Envelope<T> | null = null;

  if (text) {
    try {
      json = JSON.parse(text) as Envelope<T>;
    } catch {
      throw new ApiError(
        res.ok ? "Invalid JSON response" : `Request failed (${res.status})`,
        res.status,
        res.headers.get("Retry-After")
      );
    }
  }

  if (!res.ok) {
    const message =
      json?.error || json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, res.headers.get("Retry-After"));
  }
  if (json && json.success === false) {
    throw new ApiError(
      json.message ?? json.error ?? "Request failed",
      res.status,
      res.headers.get("Retry-After")
    );
  }
  return (json?.data ?? undefined) as T;
}

/** Remove a legacy stored JWT (safe on server). */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

function jsonHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
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

/** Authenticated request — sends the browser's session cookie. */
export function authFetch(path: string, init?: RequestInit): Promise<Response> {
  assertPath(path);
  return fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: jsonHeaders(init),
  }).then((response) => {
    if (response.status === 401) {
      clearToken();
      emitAppEvent("holodle:unauthorized", undefined);
    }
    return response;
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

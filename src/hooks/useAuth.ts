"use client";

import { useCallback, useEffect, useState } from "react";
import { parseJwt } from "@/lib/jwt";
import { API_ENDPOINTS } from "@/app/api/apiEndpoints";

const TOKEN_KEY = "token";
const AUTH_REDIRECT_KEY = "auth_redirect_to";
const GIVEAWAY_SESSION_KEY = "giveaway-vsi-session-id";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/** Returns the stored JWT or null */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Authenticated fetch wrapper */
export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const base = API_ENDPOINTS.apiUrl ?? "http://localhost:8080";
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

interface UseAuthOptions {
  requireAdmin?: boolean;
}

export function useAuth({ requireAdmin }: UseAuthOptions = {}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      localStorage.setItem(TOKEN_KEY, decodeURIComponent(hash.slice(7)));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    if (Date.now() / 1000 > Number(payload.exp ?? 0)) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    if (requireAdmin) {
      const isAdmin =
        payload.role === "admin" ||
        payload.is_admin === true ||
        (Array.isArray(payload.roles) && (payload.roles as string[]).includes("admin"));
      if (!isAdmin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
    }

    const userId = String(payload.user_id ?? payload.sub ?? "");
    const email = String(payload.email ?? "");
    if (!userId || !email) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    const name = email.split("@")[0];
    fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${userId}/picture`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser({ id: userId, email, name, picture: data?.data?.picture_url });
      })
      .catch(() => {
        setUser({ id: userId, email, name });
      })
      .finally(() => setLoading(false));
  }, [requireAdmin]);

  const login = useCallback(() => {
    const redirectPath = requireAdmin ? "/admin" : "/giveaway-vsi";
    sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
    window.location.href = API_ENDPOINTS.googleAuthUrl;
  }, [requireAdmin]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GIVEAWAY_SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, unauthorized, login, logout };
}

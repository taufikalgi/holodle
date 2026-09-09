"use client";

import { useCallback, useEffect, useState } from "react";
import { parseJwt } from "@/lib/jwt";
import { emitAppEvent, onAppEvent } from "@/lib/events";
import {
  apiBaseUrl,
  authFetch,
  getToken,
  googleAuthUrl,
} from "@/lib/api-client";

export { authFetch, getToken };

const TOKEN_KEY = "token";
const AUTH_REDIRECT_KEY = "auth_redirect_to";
const COMPETITIVE_SESSION_KEY = "competitive-classic-session-id";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface UseAuthOptions {
  requireAdmin?: boolean;
}

export function useAuth({ requireAdmin }: UseAuthOptions = {}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        setUnauthorized(false);
        return;
      }
      const payload = parseJwt(token);
      if (!payload || Date.now() / 1000 > Number(payload.exp ?? 0)) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
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
          setUser(null);
          setLoading(false);
          return;
        }
      }
      const userId = String(payload.user_id ?? payload.sub ?? "");
      const email = String(payload.email ?? "");
      if (!userId || !email) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setLoading(false);
        return;
      }
      const name = email.split("@")[0];
      fetch(`${apiBaseUrl()}/api/v1/user/${userId}/picture`, {
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
    };

    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      localStorage.setItem(TOKEN_KEY, decodeURIComponent(hash.slice(7)));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    syncFromStorage();

    const onAuthChange = () => syncFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) syncFromStorage();
    };
    const offAuthChange = onAppEvent("holodle:auth-change", onAuthChange);
    window.addEventListener("storage", onStorage);
    return () => {
      offAuthChange();
      window.removeEventListener("storage", onStorage);
    };
  }, [requireAdmin]);

  const login = useCallback(
    (redirectTo?: string) => {
      const validPaths = new Set([
        "/",
        "/login",
        "/classic/competitive",
        "/classic/daily",
        "/classic/endless",
        "/avatar/daily",
        "/avatar/endless",
        "/admin",
      ]);
      let redirectPath: string;
      if (redirectTo && validPaths.has(redirectTo)) {
        redirectPath = redirectTo;
      } else if (requireAdmin) {
        redirectPath = "/admin";
      } else {
        redirectPath = "/classic/competitive";
      }
      sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
      window.location.href = googleAuthUrl();
    },
    [requireAdmin]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COMPETITIVE_SESSION_KEY);
    setUser(null);
    setLoading(false);
    setUnauthorized(false);
    // Notify other useAuth instances (e.g. Navbar) in same tab
    emitAppEvent("holodle:auth-change", undefined);
  }, []);

  return { user, loading, unauthorized, login, logout };
}

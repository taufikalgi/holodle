"use client";

import { useCallback, useEffect, useState } from "react";
import { emitAppEvent, onAppEvent } from "@/lib/events";
import { clearAllCompetitiveHistory } from "@/lib/session-history";
import {
  authFetch,
  googleAuthUrl,
  readEnvelope,
} from "@/lib/api-client";

export { authFetch };

const AUTH_REDIRECT_KEY = "auth_redirect_to";
const COMPETITIVE_SESSION_KEY = "competitive-classic-session-id";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
  is_admin?: boolean;
  roles?: string[];
}

interface AuthMeResponse {
  id?: string;
  user_id?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  picture_url?: string;
  role?: string;
  is_admin?: boolean;
  roles?: string[];
  user?: AuthMeResponse;
}

interface UseAuthOptions {
  requireAdmin?: boolean;
}

export function useAuth({ requireAdmin }: UseAuthOptions = {}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let active = true;
    const syncFromSession = async () => {
      setLoading(true);
      setUnauthorized(false);
      try {
        const response = await authFetch("/api/v1/auth/me", { method: "GET" });
        if (!response.ok) {
          if (response.status === 403 && requireAdmin) setUnauthorized(true);
          if (active) setUser(null);
          return;
        }
        const result = await readEnvelope<AuthMeResponse>(response);
        const identity = result.user ?? result;
        const id = String(identity.id ?? identity.user_id ?? identity.sub ?? "");
        const email = String(identity.email ?? "");
        if (!id || !email) {
          if (active) setUser(null);
          return;
        }
        const authUser: AuthUser = {
          id,
          email,
          name: String(identity.name ?? email.split("@")[0]),
          picture: identity.picture ?? identity.picture_url,
          role: identity.role,
          is_admin: identity.is_admin,
          roles: identity.roles,
        };
        const isAdmin =
          authUser.role === "admin" ||
          authUser.is_admin === true ||
          authUser.roles?.includes("admin") === true;
        if (requireAdmin && !isAdmin) {
          if (active) {
            setUnauthorized(true);
            setUser(null);
          }
          return;
        }
        if (active) setUser(authUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    syncFromSession();
    const onAuthChange = () => syncFromSession();
    const offAuthChange = onAppEvent("holodle:auth-change", onAuthChange);
    return () => {
      active = false;
      offAuthChange();
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
        "/holosong/daily",
        "/holosong/endless",
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

  const logout = useCallback(async () => {
    try {
      await authFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Clear the local UI even if the server is unavailable.
    }
    localStorage.removeItem(COMPETITIVE_SESSION_KEY);
    clearAllCompetitiveHistory();
    setUser(null);
    setLoading(false);
    setUnauthorized(false);
    // Notify other useAuth instances (e.g. Navbar) in same tab
    emitAppEvent("holodle:auth-change", undefined);
  }, []);

  return { user, loading, unauthorized, login, logout };
}

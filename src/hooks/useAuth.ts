"use client";

import { useCallback, useEffect, useState } from "react";
import { emitAppEvent, onAppEvent } from "@/lib/events";
import { clearAllCompetitiveHistory } from "@/lib/session-history";
import {
  authFetch,
  clearToken,
  googleAuthUrl,
  readEnvelope,
} from "@/lib/api-client";
import {
  AUTH_REDIRECT_KEY,
  DEFAULT_AUTH_REDIRECT,
  getAuthRedirectTarget,
} from "@/lib/auth-redirect";

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
  provider?: string;
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
          if (response.status === 401) clearToken();
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
        if (identity.provider === "guest") {
          clearToken();
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
    const offUnauthorized = onAppEvent("holodle:unauthorized", () => {
      if (!active) return;
      setUser(null);
    });
    return () => {
      active = false;
      offAuthChange();
      offUnauthorized();
    };
  }, [requireAdmin]);

  const login = useCallback(
    (redirectTo?: string) => {
      const redirectPath = getAuthRedirectTarget(
        redirectTo,
        requireAdmin ? "/admin" : DEFAULT_AUTH_REDIRECT
      );
      sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
      window.location.href = googleAuthUrl();
    },
    [requireAdmin]
  );

  const logout = useCallback(async () => {
    let revoked = false;
    try {
      const response = await authFetch("/api/v1/auth/logout", { method: "POST" });
      revoked = response.ok || response.status === 401;
    } catch {
      // Clear the local UI even if the server is unavailable.
    }
    clearToken();
    localStorage.removeItem(COMPETITIVE_SESSION_KEY);
    clearAllCompetitiveHistory();
    setUser(null);
    setLoading(false);
    setUnauthorized(false);
    emitAppEvent("holodle:notice", {
      message: revoked
        ? "Signed out on all devices."
        : "Signed out on this device. Could not reach the server.",
    });
    // Notify other useAuth instances (e.g. Navbar) in same tab
    emitAppEvent("holodle:auth-change", undefined);
  }, []);

  return { user, loading, unauthorized, login, logout };
}

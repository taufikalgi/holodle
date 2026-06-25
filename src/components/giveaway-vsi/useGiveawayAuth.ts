"use client";

import { useCallback, useEffect, useState } from "react";
import { parseJwt } from "@/lib/jwt";
import { getToken } from "@/hooks/useAdminAuth";
import { API_ENDPOINTS } from "@/app/api/apiEndpoints";
import { redirectToLogin } from "./utils";
import type { AuthUser } from "./types";

const TOKEN_KEY = "token";
const SESSION_KEY = "giveaway-vsi-session-id";

export function useGiveawayAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

    const expiresAt = Number(payload.exp ?? 0);
    if (Date.now() / 1000 > expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    const userId = String(payload.user_id ?? payload.sub ?? "");
    const email = String(payload.email ?? "");
    const name = email ? email.split("@")[0] : String(payload.name ?? "Player");

    if (!userId || !email) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${userId}/picture`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        setUser({
          id: userId,
          email,
          name,
          picture: json?.data?.picture_url,
        });
      })
      .catch(() => {
        setUser({ id: userId, email, name });
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(() => {
    redirectToLogin();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}

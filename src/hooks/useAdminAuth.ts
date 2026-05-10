import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/app/api/apiEndpoints";

const TOKEN_KEY = "token";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // 1. Grab token from hash redirect (#token=<jwt>)
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      localStorage.setItem(TOKEN_KEY, hash.slice(7));
      window.history.replaceState(null, "", window.location.pathname);
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

    // 2. Check expiry
    const isExpired = Date.now() / 1000 > ((payload.exp as number) ?? 0);
    if (isExpired) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    // 3. Check admin role — adjust field name to match your JWT payload
    const isAdmin =
      payload.role === "admin" ||
      payload.is_admin === true ||
      (Array.isArray(payload.roles) && (payload.roles as string[]).includes("admin"));

    if (!isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    // 4. Fetch profile picture
    const userId = payload.user_id as string;
    fetch(`${API_ENDPOINTS.apiUrl}/api/v1/user/${userId}/picture`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser({
          id: userId,
          email: payload.email as string,
          name: (payload.email as string).split("@")[0],
          picture: data?.data?.picture_url,
        });
      })
      .catch(() => {
        setUser({
          id: userId,
          email: payload.email as string,
          name: (payload.email as string).split("@")[0],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = API_ENDPOINTS.googleAuthUrl;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return { user, loading, unauthorized, login, logout };
}

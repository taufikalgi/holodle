"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/competitive-classic/AuthGate";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const target = sessionStorage.getItem("auth_redirect_to");
      const validPaths = new Set([
        "/",
        "/login",
        "/classic/competitive",
        "/classic/daily",
        "/classic/endless",
        "/avatar/daily",
        "/avatar/endless",
        "/holosong/daily",
        "/holosong/practice",
        "/admin",
      ]);
      const redirectTo = target && validPaths.has(target) ? target : "/classic/competitive";
      if (target) sessionStorage.removeItem("auth_redirect_to");
      router.replace(redirectTo);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]"
      >
        <span
          className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]"
        >
          Loading...
        </span>
      </main>
    );
  }

  if (user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]"
      >
        <span
          className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]"
        >
          Redirecting...
        </span>
      </main>
    );
  }

  return <AuthGate onLogin={() => login()} />;
}

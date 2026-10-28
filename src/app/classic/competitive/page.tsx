"use client";

import { useAuth } from "@/hooks/useAuth";
import CompetitiveClassicGame from "@/components/competitive-classic/CompetitiveClassicGame";

export default function CompetitiveClassicPage() {
  const { user, loading, login, logout } = useAuth();

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

  return <CompetitiveClassicGame user={user} onLogin={login} onLogout={logout} />;
}
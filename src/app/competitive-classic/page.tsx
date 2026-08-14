"use client";

import { useAuth } from "@/hooks/useAuth";
import AuthGate from "@/components/competitive-classic/AuthGate";
import CompetitiveClassicGame from "@/components/competitive-classic/CompetitiveClassicGame";

export default function CompetitiveClassicPage() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading...
        </span>
      </main>
    );
  }

  if (!user) return <AuthGate onLogin={login} />;

  return <CompetitiveClassicGame user={user} onLogout={logout} />;
}
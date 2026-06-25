"use client";

import { useGiveawayAuth } from "@/components/giveaway-vsi/useGiveawayAuth";
import AuthGate from "@/components/giveaway-vsi/AuthGate";
import GiveawayVsiGame from "@/components/giveaway-vsi/GiveawayVsiGame";

export default function GiveawayVsiPage() {
  const { user, loading, login, logout } = useGiveawayAuth();

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

  return <GiveawayVsiGame user={user} onLogout={logout} />;
}

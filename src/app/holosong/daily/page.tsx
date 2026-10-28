"use client";

import AuthGate from "@/components/competitive-classic/AuthGate";
import HolosongGame from "@/components/holosong/HolosongGame";
import { useAuth } from "@/hooks/useAuth";

export default function HolosongDailyPage() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]">
        <span className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]">
          Loading...
        </span>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthGate
        onLogin={() => login("/holosong/daily")}
        subtitle="Guess the Hololive song"
        message={
          <>
            Sign in to play <strong>Holosong Daily</strong>.
          </>
        }
      />
    );
  }

  return <HolosongGame mode="daily" />;
}

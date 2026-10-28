"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GoogleIcon, PageHeader } from "@/components/ui";

export default function AuthGate({
  onLogin,
  subtitle = "Daily Hololive Talent Guessing Game",
  message,
}: {
  onLogin: () => void;
  subtitle?: string;
  message?: ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-[var(--holo-bg)]"
    >
      <div
        className="bg-[var(--holo-bg-card)] rounded-3xl shadow-xl p-10 flex flex-col items-center gap-5 text-center justify-center"
        style={{ maxWidth: 400, width: "100%", border: "1px solid var(--holo-border)" }}
      >
        <Link
          href="/"
          className="text-sm font-bold transition-colors hover:opacity-70 text-[var(--holo-blue)]"
        >
          ← Back to Home
        </Link>
        <PageHeader
          subtitle={subtitle}
          onHowTo={() => {}}
          onLeaderboard={() => {}}
          showHowTo={false}
          showButton={false}
          showLeaderboard={false}
          showLeaderboardButton={false}
        />

        <hr className="w-full border-[var(--holo-border)]" />

        <p className="text-sm text-[var(--holo-text-muted)]" style={{ lineHeight: 1.6 }}>
          {message ?? (
            <>
              Sign in untuk ikut <strong>Competitive Classic</strong> bang.
            </>
          )}
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80 border-[1.5px] border-solid border-[var(--holo-border)] bg-[var(--holo-bg-card)] text-[var(--holo-text)]"
          style={{
            cursor: "pointer",
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </main>
  );
}

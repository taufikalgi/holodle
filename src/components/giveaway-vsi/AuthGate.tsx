"use client";

import { GoogleIcon, PageHeader } from "@/components/ui";

export default function AuthGate({ onLogin }: { onLogin: () => void }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--holo-bg)" }}
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-5 text-center justify-center"
        style={{ maxWidth: 400, width: "100%", border: "1px solid var(--holo-border)" }}
      >
        <a
          href="/"
          className="text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: "var(--holo-blue)" }}
        >
          ← Back to Home
        </a>
        <PageHeader
          subtitle="Daily Hololive Talent Guessing Game"
          onHowTo={() => {}}
          onLeaderboard={() => {}}
          showHowTo={false}
          showButton={false}
          showLeaderboard={false}
          showLeaderboardButton={false}
        />

        <hr className="w-full" style={{ borderColor: "var(--holo-border)" }} />

        <p className="text-sm" style={{ color: "var(--holo-text-muted)", lineHeight: 1.6 }}>
          Sign in untuk ikut <strong>Giveaway VSI</strong> bang.
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
          style={{
            border: "1.5px solid var(--holo-border)",
            background: "white",
            color: "var(--holo-text)",
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

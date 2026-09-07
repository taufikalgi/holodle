"use client";

import GoogleIcon from "@/components/ui/GoogleIcon";

export default function LoginToPlayCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center">
      <div className="text-4xl" style={{ color: "var(--holo-blue)" }}>
        ▶
      </div>
      <h2 className="mt-3 text-2xl font-black" style={{ color: "var(--holo-blue)" }}>
        Login to play
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6"
        style={{ color: "var(--holo-text-muted)" }}
      >
        Sign in to start a competitive session and climb the leaderboard.
      </p>

      <button
        onClick={onLogin}
        className="mt-6 inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
        style={{ background: "var(--holo-blue)" }}
      >
        <span className="flex items-center justify-center rounded-full bg-white p-1">
          <GoogleIcon />
        </span>
        Continue with Google
      </button>
    </div>
  );
}

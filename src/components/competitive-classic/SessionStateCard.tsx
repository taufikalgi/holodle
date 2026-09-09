"use client";

import GoogleIcon from "@/components/ui/GoogleIcon";

export default function SessionStateCard({
  variant,
  loading,
  onStart,
  onLogin,
}: {
  variant: "start" | "login";
  loading?: boolean;
  onStart?: () => void;
  onLogin?: () => void;
}) {
  const login = variant === "login";
  return (
    <div className="win-banner rounded-3xl p-6 md:p-8 text-center">
      <div className="text-4xl text-[var(--holo-blue)]">
        ▶
      </div>
      <h2 className="mt-3 text-2xl font-black text-[var(--holo-blue)]">
        {login ? "Login to play" : "Start a session to play"}
      </h2>
      <p
        className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--holo-text-muted)]"
      >
        {login
          ? "Sign in to start a competitive session and climb the leaderboard."
          : "A round is only created when you start it. Open a session first, then submit guesses."}
      </p>

      {login ? (
        <button
          onClick={onLogin}
          className="mt-6 inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          <span className="flex items-center justify-center rounded-full bg-white p-1">
            <GoogleIcon />
          </span>
          Continue with Google
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 bg-[var(--holo-blue)]"
        >
          {loading ? "Starting..." : "Start session"}
        </button>
      )}
    </div>
  );
}

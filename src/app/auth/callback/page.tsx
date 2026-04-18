"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      setStatus("error");
      setMessage(
        error === "google_oauth_failed"
          ? "Google sign-in was cancelled or failed."
          : "Authentication failed. Please try again."
      );
      setTimeout(() => router.replace("/login"), 3000);
      return;
    }

    // Store the JWT — use httpOnly cookie in production via an API route
    // for now localStorage is fine for development
    localStorage.setItem("token", token);

    setStatus("success");
    setMessage("Signed in successfully!");
    setTimeout(() => router.replace("/giveaway-vsi"), 1500);
  }, [searchParams, router]);

  return (
    <div className="callback-root">
      <div className="card">
        <div className={`icon-ring ${status}`}>
          {status === "loading" && <Spinner />}
          {status === "success" && <CheckIcon />}
          {status === "error" && <CrossIcon />}
        </div>

        <p className={`status-label ${status}`}>
          {status === "loading" && "Authenticating"}
          {status === "success" && "Welcome back"}
          {status === "error" && "Access denied"}
        </p>

        <p className="message">{message}</p>

        {status === "error" && (
          <button className="retry-btn" onClick={() => router.replace("/login")}>
            Back to login
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .callback-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.06) 0%, transparent 70%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.025) 39px,
              rgba(255,255,255,0.025) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.025) 39px,
              rgba(255,255,255,0.025) 40px
            );
          font-family: 'DM Sans', sans-serif;
        }

        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 52px 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          backdrop-filter: blur(12px);
          min-width: 320px;
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Icon ring ── */
        .icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.12);
          transition: border-color 0.4s ease, background 0.4s ease;
        }
        .icon-ring.success {
          border-color: rgba(134, 239, 172, 0.5);
          background: rgba(134, 239, 172, 0.06);
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .icon-ring.error {
          border-color: rgba(252, 165, 165, 0.5);
          background: rgba(252, 165, 165, 0.06);
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* ── Spinner ── */
        .spinner {
          width: 24px;
          height: 24px;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-top-color: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Check / Cross SVGs ── */
        .check-svg { stroke: #86efac; }
        .cross-svg  { stroke: #fca5a5; }

        /* ── Labels ── */
        .status-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          transition: color 0.4s ease;
        }
        .status-label.success { color: rgba(134, 239, 172, 0.7); }
        .status-label.error   { color: rgba(252, 165, 165, 0.7); }

        .message {
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          text-align: center;
          line-height: 1.6;
          max-width: 240px;
          font-family: 'DM Mono', monospace;
        }

        /* ── Retry button ── */
        .retry-btn {
          margin-top: 4px;
          padding: 9px 22px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 2px;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .retry-btn:hover {
          border-color: rgba(255,255,255,0.35);
          color: rgba(255,255,255,0.85);
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return <div className="spinner" />;
}

function CheckIcon() {
  return (
    <svg
      className="check-svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="cross-svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

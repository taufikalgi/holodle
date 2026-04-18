"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "error";

export default function AuthCallbackContent() {
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

    localStorage.setItem("token", token);
    setStatus("success");
    setMessage("Signed in successfully!");
    setTimeout(() => router.replace("/giveaway-vsi"), 1500);
  }, [searchParams, router]);

  return (
    <div className="callback-root">
      {/* Logo */}
      <div className="logo">
        <span className="logo-holo">HOLO</span>
        <span className="logo-dle">DLE</span>
      </div>

      <div className="card">
        <div className={`icon-ring ${status}`}>
          {status === "loading" && <Spinner />}
          {status === "success" && <CheckIcon />}
          {status === "error" && <CrossIcon />}
        </div>

        <p className={`status-label ${status}`}>
          {status === "loading" && "Authenticating"}
          {status === "success" && "Welcome back!"}
          {status === "error" && "Access denied"}
        </p>

        <p className="message">{message}</p>

        {status === "error" && (
          <button className="retry-btn" onClick={() => router.replace("/login")}>
            ← Back to login
          </button>
        )}
      </div>

      <p className="footer">Holodle — Fan-made game. Not affiliated with Cover Corp.</p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .callback-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          background: linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%);
          font-family: 'Poppins', sans-serif;
          padding: 24px;
        }

        /* ── Logo ── */
        .logo {
          display: flex;
          align-items: baseline;
          line-height: 1;
          user-select: none;
        }
        .logo-holo {
          font-size: 36px;
          font-weight: 900;
          color: #0891b2;
          letter-spacing: -1px;
        }
        .logo-dle {
          font-size: 36px;
          font-weight: 900;
          color: #1e293b;
          letter-spacing: -1px;
        }

        /* ── Card ── */
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 48px 44px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
          min-width: 300px;
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
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          transition: border-color 0.4s ease, background 0.4s ease;
        }
        .icon-ring.loading {
          border-color: #bae6fd;
          background: #f0f9ff;
        }
        .icon-ring.success {
          border-color: #bbf7d0;
          background: #f0fdf4;
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .icon-ring.error {
          border-color: #fecaca;
          background: #fef2f2;
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
          border: 2px solid #bae6fd;
          border-top-color: #0891b2;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Status label ── */
        .status-label {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.01em;
        }
        .status-label.loading { color: #0891b2; }
        .status-label.success { color: #16a34a; }
        .status-label.error   { color: #dc2626; }

        /* ── Message ── */
        .message {
          font-size: 13px;
          font-weight: 400;
          color: #64748b;
          text-align: center;
          line-height: 1.6;
          max-width: 220px;
        }

        /* ── Retry button ── */
        .retry-btn {
          margin-top: 4px;
          padding: 10px 24px;
          background: #0891b2;
          border: none;
          border-radius: 99px;
          color: white;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .retry-btn:hover { opacity: 0.8; }

        /* ── Footer ── */
        .footer {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#16a34a"
      strokeWidth="2"
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#dc2626"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

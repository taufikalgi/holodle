"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { GoogleIcon } from "@/components/ui";

export default function AdminLoginPage() {
  const { user, loading, unauthorized, login } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

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
          Loading…
        </span>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "var(--holo-bg)",
        fontFamily: '"Baloo 2", sans-serif',
        padding: "1.5rem",
      }}
    >
      <div
        className="holo-card animate-bounce-in"
        style={{
          maxWidth: 400,
          width: "100%",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--holo-blue-light), var(--holo-blue))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            boxShadow: "0 4px 20px rgba(0,180,216,0.3)",
          }}
        >
          🎨
        </div>

        <div>
          <h1
            className="shimmer-text"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: 26,
              fontWeight: 800,
              margin: "0 0 4px",
            }}
          >
            Holodle Admin
          </h1>
          <p style={{ fontSize: 14, color: "var(--holo-text-muted)", margin: 0 }}>
            Talent Management Portal
          </p>
        </div>

        <hr
          style={{ width: "100%", border: "none", borderTop: "1.5px solid var(--holo-border)" }}
        />

        {unauthorized ? (
          <div
            className="cell-wrong"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              textAlign: "left",
            }}
          >
            <strong>Access denied.</strong>
            <br />
            <span style={{ fontSize: 13 }}>This account does not have admin privileges.</span>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--holo-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Sign in with your admin Google account to access the talent management portal.
          </p>
        )}

        <button
          onClick={login}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 12,
            border: "1.5px solid var(--holo-border)",
            background: "white",
            color: "var(--holo-text)",
            fontFamily: '"Baloo 2", sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.75")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={{ fontSize: 11, color: "var(--holo-text-muted)", opacity: 0.5, margin: 0 }}>
          Admin access only — Holodle fan-made project
        </p>
      </div>
    </main>
  );
}

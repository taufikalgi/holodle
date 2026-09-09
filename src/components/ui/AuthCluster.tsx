"use client";

import Image from "next/image";
import GoogleIcon from "@/components/ui/GoogleIcon";
import type { AuthUser } from "@/hooks/useAuth";

export default function AuthCluster({
  user,
  loading,
  onLogin,
  onLogout,
  mobile,
  onNavigate,
}: {
  user: AuthUser | null;
  loading: boolean;
  onLogin: () => void;
  onLogout?: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (loading) return null;
  if (user) {
    if (mobile) {
      return (
        <div
          className="flex items-center gap-3 pt-2 border-t mt-1"
          style={{ borderColor: "var(--holo-border)" }}
        >
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name}
              width={28}
              height={28}
              className="rounded-full"
              style={{ border: "2px solid var(--holo-border)" }}
            />
          )}
          <span className="text-xs font-semibold" style={{ color: "var(--holo-text)" }}>
            {user.name}
          </span>
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                onNavigate?.();
              }}
              className="ml-auto text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-70"
              style={{ background: "#ef4444", color: "white", border: "none" }}
            >
              Sign out
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center gap-3">
        {user.picture && (
          <Image
            src={user.picture}
            alt={user.name}
            width={28}
            height={28}
            className="rounded-full"
            style={{ border: "2px solid var(--holo-border)" }}
          />
        )}
        <span className="text-xs font-semibold" style={{ color: "var(--holo-text)" }}>
          {user.name}
        </span>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-70"
            style={{ background: "#ef4444", color: "white", border: "none" }}
          >
            Sign out
          </button>
        )}
      </div>
    );
  }
  if (mobile) {
    return (
      <div className="pt-2 border-t mt-1" style={{ borderColor: "var(--holo-border)" }}>
        <button
          onClick={() => {
            onLogin();
            onNavigate?.();
          }}
          className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-full transition-opacity hover:opacity-80"
          style={{
            border: "1.5px solid var(--holo-border)",
            background: "var(--holo-bg-card)",
            color: "var(--holo-text)",
          }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onLogin}
      className="hidden md:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
      style={{
        border: "1.5px solid var(--holo-border)",
        background: "var(--holo-bg-card)",
        color: "var(--holo-text)",
      }}
    >
      <GoogleIcon />
      Sign in
    </button>
  );
}

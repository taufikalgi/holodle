"use client";

import type { ReactNode } from "react";
import { Navbar, Footer } from "@/components/ui";

export function GameShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <Navbar title={title} />
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      <Footer />
    </main>
  );
}

export function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="text-center py-14">
      <p className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]">
        {text}
      </p>
    </div>
  );
}

export function ClassicErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-center">
      <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
      >
        Retry
      </button>
    </div>
  );
}

export function AvatarEmptyBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="holo-card p-8 text-center">
      <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
        No playable talents yet.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
      >
        Retry
      </button>
    </div>
  );
}

export function AvatarErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      {message}{" "}
      <button type="button" onClick={onRetry} className="underline font-black">
        Retry
      </button>
    </div>
  );
}

export function ZeroGuessHint({ line1, line2, compact }: { line1: string; line2?: string; compact?: boolean }) {
  return (
    <div className={`text-center ${compact ? "py-6" : "py-14"}`}>
      <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
        {line1}
      </p>
      {line2 && (
        <p className="text-xs mt-1 opacity-50 text-[var(--holo-text-muted)]">
          {line2}
        </p>
      )}
    </div>
  );
}

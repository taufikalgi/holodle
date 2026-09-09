"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--holo-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-[var(--holo-text)]">
          Admin panel crashed
        </p>
        <p className="text-xs mt-2 opacity-60 text-[var(--holo-text-muted)]">
          {error.message || "Unexpected error."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-[var(--holo-blue)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

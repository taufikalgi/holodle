export default function Loading() {
  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading…
        </p>
      </div>
    </main>
  );
}

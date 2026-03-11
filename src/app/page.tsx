import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--holo-bg)" }}>
      <h1 className="text-5xl font-black tracking-widest mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <span className="shimmer-text">HOLO</span>
        <span style={{ color: "var(--holo-text)" }}>DLE</span>
      </h1>
      <p className="text-sm tracking-widest uppercase mb-12" style={{ color: "var(--holo-text-muted)" }}>
        Choose your game
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        <Link href="/classic" className="holo-card p-8 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow group">
          <span className="text-5xl">🎭</span>
          <h2 className="text-xl font-black" style={{ color: "var(--holo-text)" }}>Classic</h2>
          <p className="text-sm text-center" style={{ color: "var(--holo-text-muted)" }}>
            Guess the talent by their attributes — branch, debut year, archetype and more.
          </p>
        </Link>

        <Link href="/photo" className="holo-card p-8 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow group">
          <span className="text-5xl">📸</span>
          <h2 className="text-xl font-black" style={{ color: "var(--holo-text)" }}>Photo</h2>
          <p className="text-sm text-center" style={{ color: "var(--holo-text-muted)" }}>
            Guess the talent from a cropped zoomed photo — hints reveal more each try.
          </p>
        </Link>
      </div>

      <p className="text-xs mt-16 opacity-40" style={{ color: "var(--holo-text-muted)" }}>
        Fan-made · Not affiliated with Cover Corp
      </p>
    </main>
  );
}
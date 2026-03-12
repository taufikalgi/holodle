import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";
import { GameMode, GAMES } from "@/lib/game-modes";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--holo-bg)" }}
    >
      <h1
        className="text-5xl font-black tracking-widest mb-2"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <span className="shimmer-text">HOLO</span>
        <span style={{ color: "var(--holo-text)" }}>DLE</span>
      </h1>
      <p
        className="text-sm tracking-widest uppercase mb-12"
        style={{ color: "var(--holo-text-muted)" }}
      >
        Prove your LOVE to your OSHI
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        {GAMES.map((game: GameMode) => (
          <GameCard key={game.href} {...game} />
        ))}
      </div>

      <Footer />
    </main>
  );
}

import Footer from "@/components/ui/Footer";
import GameCard from "@/components/ui/GameCard";
import { GameMode, GAMES } from "@/lib/game-modes";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center mt-16"
      style={{ background: "var(--holo-bg)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#00B4D8]" />
        <span className="text-[#00B4D8] text-xs">✦</span>
        <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#00B4D8]" />
      </div>
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

      <div className="grid grid-cols-1 md:grid-cols gap-6 w-full max-w-2xl px-4">
        {GAMES.map((game: GameMode) => (
          <GameCard key={game.href} {...game} />
        ))}
      </div>

      <Footer />
    </main>
  );
}

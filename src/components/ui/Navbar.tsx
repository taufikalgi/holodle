import Link from "next/link";
import { GameMode, GAMES } from "@/lib/game-modes";

export default function Navbar({ title }: { title: string }) {
  return (
    <nav
      className="w-full px-4 py-3 flex items-center gap-4 border-b"
      style={{ background: "white", borderColor: "var(--holo-border)" }}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-70"
        style={{ color: "var(--holo-blue)" }}
      >
        ← Home
      </Link>
      {GAMES.map((game: GameMode) => (
        <Link
          key={game.title}
          href={game.href}
          className="text-sm font-black tracking-widest relative group"
          style={{ color: "var(--holo-text)" }}
        >
          {game.title.toUpperCase()}
          <span
            className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-in-out"
            style={{ background: "var(--holo-blue)" }}
          />
        </Link>
      ))}
    </nav>
  );
}

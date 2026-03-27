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
          href={game.href}
          className="text-sm font-black tracking-widest"
          style={{ color: "var(--holo-text)" }}
        >
          {game.title.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

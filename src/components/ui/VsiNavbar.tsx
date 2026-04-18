import Link from "next/link";
import { GameMode, GAMES } from "@/lib/game-modes";

interface User {
  name: string;
  picture?: string;
}

export default function VsiNavbar({
  title,
  user,
  onLogout,
}: {
  title: string;
  user?: User;
  onLogout?: () => void;
}) {
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

      {/* User info */}
      {user && (
        <div className="ml-auto flex items-center gap-3">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-7 h-7 rounded-full"
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
      )}
    </nav>
  );
}

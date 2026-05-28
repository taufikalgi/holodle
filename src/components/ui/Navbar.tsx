"use client";

import Link from "next/link";
import { useState } from "react";
import { GameMode, GAMES } from "@/lib/game-modes";

export default function Navbar({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="w-full border-b"
      style={{ background: "white", borderColor: "var(--holo-border)" }}
    >
      <div className="px-4 py-3 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-bold transition-colors hover:opacity-70"
          style={{ color: "var(--holo-blue)" }}
        >
          ← Home
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
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
        </div>

        {/* Hamburger button */}
        <button
          className="md:hidden ml-auto flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block h-0.5 w-5 transition-all duration-300 origin-center"
            style={{
              background: "var(--holo-text)",
              transform: isOpen ? "translateY(8px) rotate(45deg)" : "",
            }}
          />
          <span
            className="block h-0.5 w-5 transition-all duration-300"
            style={{
              background: "var(--holo-text)",
              opacity: isOpen ? 0 : 1,
            }}
          />
          <span
            className="block h-0.5 w-5 transition-all duration-300 origin-center"
            style={{
              background: "var(--holo-text)",
              transform: isOpen ? "translateY(-8px) rotate(-45deg)" : "",
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 border-t" : "max-h-0"
        }`}
        style={{ borderColor: "var(--holo-border)" }}
      >
        <div className="px-4 py-3 flex flex-col gap-4">
          {GAMES.map((game: GameMode) => (
            <Link
              key={game.title}
              href={game.href}
              className="text-sm font-black tracking-widest"
              style={{ color: "var(--holo-text)" }}
              onClick={() => setIsOpen(false)}
            >
              {game.title.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

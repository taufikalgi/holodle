"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { GameMode, GAMES } from "@/lib/game-modes";

interface User {
  name: string;
  picture?: string;
}

export default function Navbar({
  title,
  user,
  onLogout,
}: {
  title: string;
  user?: User;
  onLogout?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

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
                className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                  isActive(game.href) ? "w-full" : "w-0 group-hover:w-full"
                }`}
                style={{ background: "var(--holo-blue)" }}
              />
            </Link>
          ))}
        </div>

        {/* Desktop user info */}
        {user && (
          <div className="hidden md:flex ml-auto items-center gap-3">
            {user.picture && (
              <Image
                src={user.picture}
                alt={user.name}
                width={28}
                height={28}
                className="rounded-full"
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
              className="text-sm font-black tracking-widest relative group self-start"
              style={{ color: "var(--holo-text)" }}
              onClick={() => setIsOpen(false)}
            >
              {game.title.toUpperCase()}
              <span
                className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                  isActive(game.href) ? "w-full" : "w-0 group-hover:w-full"
                }`}
                style={{ background: "var(--holo-blue)" }}
              />
            </Link>
          ))}

          {/* Mobile user info */}
          {user && (
            <div
              className="flex items-center gap-3 pt-2 border-t"
              style={{ borderColor: "var(--holo-border)" }}
            >
              {user.picture && (
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                  style={{ border: "2px solid var(--holo-border)" }}
                />
              )}
              <span className="text-xs font-semibold" style={{ color: "var(--holo-text)" }}>
                {user.name}
              </span>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="ml-auto text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-70"
                  style={{ background: "#ef4444", color: "white", border: "none" }}
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

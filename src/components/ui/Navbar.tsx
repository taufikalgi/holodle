"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { GAME_CATEGORIES } from "@/lib/game-modes";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useOutsideClick } from "@/hooks/useOutsideClick";

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
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const isCategoryActive = (id: string) => pathname.startsWith(`/${id}`);

  const desktopRef = useRef<HTMLDivElement>(null);
  useOutsideClick(desktopRef, () => setOpenCategory(null));

  useEffect(() => {
    if (!openCategory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCategory(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openCategory]);

  return (
    <nav
      className="w-full border-b"
      style={{ background: "var(--holo-bg-card)", borderColor: "var(--holo-border)" }}
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
        <div ref={desktopRef} className="hidden md:flex items-center gap-4">
          {GAME_CATEGORIES.map((category) => (
            <div key={category.id} className="relative">
              <button
                type="button"
                onClick={() => setOpenCategory((prev) => (prev === category.id ? null : category.id))}
                aria-expanded={openCategory === category.id}
                aria-haspopup="menu"
                className="text-sm font-black tracking-widest relative flex items-center gap-1"
                style={{ color: isCategoryActive(category.id) ? "var(--holo-blue)" : "var(--holo-text)" }}
              >
                {category.label.toUpperCase()}
                <span className={`inline-block text-xs transition-transform ${openCategory === category.id ? "rotate-180" : ""}`}>▾</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-in-out ${
                    isCategoryActive(category.id) ? "w-full" : "w-0"
                  }`}
                  style={{ background: "var(--holo-blue)" }}
                />
              </button>

              {openCategory === category.id && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-3 w-64 holo-card p-2 z-30 animate-slide-down overflow-hidden"
                >
                  {category.variants.map((variant) => (
                    <Link
                      key={variant.href}
                      href={variant.href}
                      role="menuitem"
                      onClick={() => setOpenCategory(null)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-[var(--holo-off-white)] ${
                        isActive(variant.href) ? "bg-[var(--holo-off-white)]" : ""
                      }`}
                      style={{ color: "var(--holo-text)" }}
                    >
                      <img src={variant.logo} alt={variant.alt} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                      <span>{variant.label.toUpperCase()}</span>
                      {isActive(variant.href) && (
                        <span className="ml-auto text-xs" style={{ color: "var(--holo-blue)" }}>
                          ●
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right-side cluster */}
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-3">
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
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
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

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] border-t" : "max-h-0"
        }`}
        style={{ borderColor: "var(--holo-border)" }}
      >
        <div className="px-4 py-3 flex flex-col gap-2">
          {GAME_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="rounded-xl"
              style={{ border: "1px solid var(--holo-border)", background: "var(--holo-bg-card)" }}
            >
              <button
                type="button"
                onClick={() => setExpandedCategory((prev) => (prev === category.id ? null : category.id))}
                aria-expanded={expandedCategory === category.id}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-black tracking-widest"
                style={{ color: isCategoryActive(category.id) ? "var(--holo-blue)" : "var(--holo-text)" }}
              >
                <span>{category.label.toUpperCase()}</span>
                <span className={`transition-transform ${expandedCategory === category.id ? "rotate-180" : ""}`}>▾</span>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${expandedCategory === category.id ? "max-h-64 border-t" : "max-h-0"}`} style={{ borderColor: "var(--holo-border)" }}>
                <div className="flex flex-col p-2 gap-1">
                  {category.variants.map((variant) => (
                    <Link
                      key={variant.href}
                      href={variant.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-bold ${isActive(variant.href) ? "bg-[var(--holo-off-white)]" : ""}`}
                      style={{ color: "var(--holo-text)" }}
                      onClick={() => {
                        setIsOpen(false);
                        setExpandedCategory(null);
                      }}
                    >
                      <img src={variant.logo} alt={variant.alt} className="w-6 h-6 rounded-full object-cover" />
                      {variant.label.toUpperCase()}
                      {isActive(variant.href) && (
                        <span className="ml-auto text-xs" style={{ color: "var(--holo-blue)" }}>
                          ●
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Mobile user info */}
          {user && (
            <div
              className="flex items-center gap-3 pt-2 border-t mt-1"
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

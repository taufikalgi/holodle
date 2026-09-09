"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { GAME_CATEGORIES } from "@/lib/game-modes";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export default function DesktopNav({
  openCategory,
  onToggleCategory,
  onClose,
  isActive,
  isCategoryActive,
}: {
  openCategory: string | null;
  onToggleCategory: (id: string) => void;
  onClose: () => void;
  isActive: (href: string) => boolean;
  isCategoryActive: (id: string) => boolean;
}) {
  const desktopRef = useRef<HTMLDivElement>(null);
  useOutsideClick(desktopRef, onClose);

  useEffect(() => {
    if (!openCategory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openCategory, onClose]);

  return (
    <div ref={desktopRef} className="hidden md:flex items-center gap-4">
      {GAME_CATEGORIES.map((category) => (
        <div key={category.id} className="relative">
          <button
            type="button"
            onClick={() => onToggleCategory(category.id)}
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
                  onClick={onClose}
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
  );
}

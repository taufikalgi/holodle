"use client";

import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import type { GameCategory } from "@/lib/game-modes";
import GameCard from "@/components/ui/GameCard";

export default function CategoryDropdown({ category }: { category: GameCategory }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="holo-card overflow-hidden w-full transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="px-5 py-5 flex items-center gap-3 w-full text-left"
      >
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
          style={{
            background: "var(--holo-off-white)",
            border: "1px solid var(--holo-border)",
            color: "var(--holo-text-muted)",
          }}
          aria-hidden
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <img
          src={category.variants[0]?.logo ?? ""}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          style={{ border: "1.5px solid var(--holo-border)" }}
        />
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-black tracking-widest leading-none" style={{ color: "var(--holo-text)" }}>
            {category.label.toUpperCase()}
          </h2>
          <p className="text-xs leading-tight mt-1" style={{ color: "var(--holo-text-muted)" }}>
            {category.id === "classic" ? "Guess by attributes — branch, debut, lore & more" : "Guess by cropped avatar — zoom reveals hints"}
          </p>
        </div>
      </button>

      {open && (
        <div
          className="grid gap-4 p-4 border-t animate-slide-down"
          style={{ borderColor: "var(--holo-border)", background: "var(--holo-off-white)" }}
        >
          {category.variants.map((variant) => (
            <GameCard
              key={variant.href}
              href={variant.href}
              logo={variant.logo}
              alt={variant.alt}
              title={variant.label}
              description={variant.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}

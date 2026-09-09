"use client";

import Link from "next/link";
import { GAME_CATEGORIES } from "@/lib/game-modes";

export default function MobileNav({
  expandedCategory,
  onToggleExpanded,
  onNavigate,
  isActive,
  isCategoryActive,
}: {
  expandedCategory: string | null;
  onToggleExpanded: (id: string) => void;
  onNavigate: () => void;
  isActive: (href: string) => boolean;
  isCategoryActive: (id: string) => boolean;
}) {
  return (
    <>
      {GAME_CATEGORIES.map((category) => (
        <div
          key={category.id}
          className="rounded-xl"
          style={{ border: "1px solid var(--holo-border)", background: "var(--holo-bg-card)" }}
        >
          <button
            type="button"
            onClick={() => onToggleExpanded(category.id)}
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
                  onClick={onNavigate}
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
    </>
  );
}

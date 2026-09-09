"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // Hydration-safe mount flag: false on server, true after hydration (same timing as a mount effect flip).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className="relative w-14 h-7 rounded-full border-2 flex items-center px-1"
        style={{ borderColor: "var(--holo-border)", background: "var(--holo-off-white)" }}
        aria-hidden
      >
        <span className="absolute left-1.5 text-[10px] leading-none">🌙</span>
        <span className="absolute right-1.5 text-[10px] leading-none opacity-60">☀️</span>
        <div
          className="absolute left-0.5 w-5 h-5 rounded-full shadow-sm"
          style={{ background: "white", border: "1px solid var(--holo-border)" }}
        />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex w-14 h-7 items-center rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        borderColor: "var(--holo-border)",
        background: isDark ? "var(--holo-text)" : "var(--holo-off-white)",
      }}
    >
      <span className="absolute left-1.5 text-[10px] leading-none select-none" aria-hidden>
        🌙
      </span>
      <span className="absolute right-1.5 text-[10px] leading-none select-none" aria-hidden>
        ☀️
      </span>
      <span
        className="absolute left-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
        style={{
          background: isDark ? "var(--holo-bg-card)" : "white",
          border: "1px solid var(--holo-border)",
          transform: isDark ? "translateX(28px)" : "translateX(0)",
        }}
      />
    </button>
  );
}
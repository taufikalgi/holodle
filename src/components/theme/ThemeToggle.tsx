"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch: server always renders light, client may be dark from localStorage/prefers-color-scheme.
  // Render stable placeholder until mounted, then render theme-aware content.
  if (!mounted) {
    return (
      <button
        aria-label="Switch to dark mode"
        title="Switch to dark mode"
        className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-colors"
        style={{
          borderColor: "var(--holo-border)",
          background: "var(--holo-off-white)",
          color: "var(--holo-text)",
        }}
        disabled
      >
        🌙
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-colors"
      style={{
        borderColor: "var(--holo-border)",
        background: "var(--holo-off-white)",
        color: "var(--holo-text)",
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
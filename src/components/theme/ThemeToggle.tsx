"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
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
import type { Talent } from "@/lib/talent-api";
import { MONTH_ORDER } from "@/lib/talents";

export type SortKey =
  | "name"
  | "branch"
  | "lore_archetype"
  | "debut_year"
  | "height"
  | "birth_month";
export type SortDirection = "asc" | "desc";

export const BRANCH_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  JP: { bg: "#ede0f5", color: "#6a2485", border: "#d4a8e8" },
  EN: { bg: "#dff0e8", color: "#185a32", border: "#86efac" },
  ID: { bg: "#faeedd", color: "#7a4a0a", border: "#fbbf6d" },
  DEV_IS: { bg: "#e0eeff", color: "#1a4a8a", border: "#93c5fd" },
  ReGLOSS: { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
  STARS: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
};

export function compareTalentsByKey(a: Talent, b: Talent, key: SortKey) {
  const aValue = a[key];
  const bValue = b[key];

  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (key === "debut_year" || key === "height") {
    return Number(aValue) - Number(bValue);
  }

  if (key === "birth_month") {
    const aMonth = MONTH_ORDER[String(aValue)] ?? Number.MAX_SAFE_INTEGER;
    const bMonth = MONTH_ORDER[String(bValue)] ?? Number.MAX_SAFE_INTEGER;
    return aMonth - bMonth;
  }

  return String(aValue).localeCompare(String(bValue));
}

export function getBranchStyle(branch: string) {
  return (
    BRANCH_COLORS[branch] ?? {
      bg: "var(--holo-off-white)",
      color: "var(--holo-text-muted)",
      border: "var(--holo-border)",
    }
  );
}

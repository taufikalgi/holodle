import { config } from "./config";
import { ApiError } from "./errors";

export type Branch = "JP" | "EN" | "ID" | "DEV_IS" | "Stars JP" | "Stars EN";

export interface Keypoint {
  label: string;
  x: number;
  y: number;
  zoom: number;
}

export interface Talent {
  id: string;
  name: string;
  branch: Branch;
  debutYear: number;
  loreArchetype: string;
  height: number;
  birthMonth: string;
  image: string;
  altNames: string[]; // alternative search names
  photoUrl: string;
  keypoints?: Keypoint[];
}


export type ApiTalent = {
  id: string;
  name: string;
  branch: Branch;
  debut_year: number | null;
  lore_archetype: string;
  height: number | null;
  birth_month: string;
  image_url: string;
  alt_names: string[];
};

export function normalizeTalent(talent: ApiTalent): Talent {
  return {
    id: talent.id,
    name: talent.name,
    branch: talent.branch,
    debutYear: talent.debut_year ?? 0,
    loreArchetype: talent.lore_archetype,
    height: talent.height ?? 0,
    birthMonth: talent.birth_month,
    photoUrl: talent.image_url,
    image: "",
    altNames: talent.alt_names ?? [],
  };
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const TALENTS: Talent[] = await (async () => {
  const res = await fetch(`${config.apiUrl}/api/v1/talent/`);
  const json = (await res.json().catch(() => null)) as ApiResponse<ApiTalent[]> | null;
  if (!res.ok) {
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status);
  }

  if (!json || json.success === false) {
    throw new ApiError(json?.message ?? "Request failed", res.status);
  }

  return json.data.map(normalizeTalent);
})();

export const ALL_TALENTS = TALENTS.filter(
  (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
);

export function getTalentOfTheDay(): Talent {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % ALL_TALENTS.length;
  return ALL_TALENTS[index];
}

export function searchTalents(query: string): Talent[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.altNames && t.altNames.some((alt) => alt.toLowerCase().includes(q)))
  ).slice(0, 8);
}

export type CompareResult = {
  name: "correct" | "wrong";
  branch: "correct" | "wrong";
  debutYear: "correct" | "higher" | "higher-close" | "lower" | "lower-close";
  loreArchetype: "correct" | "wrong";
  height: "correct" | "higher" | "higher-close" | "lower" | "lower-close";
  birthMonth: "correct" | "higher" | "higher-close" | "lower" | "lower-close";
};

export const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const MONTH_MAP = MONTH_ORDER;

type MonthKey = keyof typeof MONTH_MAP;

function isValidMonth(month: string): month is MonthKey {
  return month in MONTH_MAP;
}

function getMonthNumber(month: string): number {
  if (!isValidMonth(month)) throw new Error(`Invalid month: ${month}`);
  return MONTH_MAP[month];
}

export function getLoreArchetypeCategory(loreArchetype: string): string {
  if (loreArchetype.toLocaleLowerCase() === "human") {
    return "Human";
  } else if (loreArchetype.toLocaleLowerCase() === "animal") {
    return "Animal";
  } else {
    return "Unique (" + loreArchetype + ")";
  }
}

export function compareTalents(guess: Talent, answer: Talent): CompareResult {
  const guessMonth = getMonthNumber(guess.birthMonth);
  const answerMonth = getMonthNumber(answer.birthMonth);
  const monthDiff = Math.abs(guessMonth - answerMonth);
  return {
    name: guess.name === answer.name ? "correct" : "wrong",
    branch: guess.branch === answer.branch ? "correct" : "wrong",
    debutYear:
      guess.debutYear === answer.debutYear
        ? "correct"
        : guess.debutYear > answer.debutYear
          ? Math.abs(guess.debutYear - answer.debutYear) <= 1
            ? "higher-close"
            : "higher"
          : Math.abs(guess.debutYear - answer.debutYear) <= 1
            ? "lower-close"
            : "lower",
    loreArchetype:
      getLoreArchetypeCategory(guess.loreArchetype).split(" ")[0] ===
      getLoreArchetypeCategory(answer.loreArchetype).split(" ")[0]
        ? "correct"
        : "wrong",
    height:
      guess.height === answer.height
        ? "correct"
        : guess.height > answer.height
          ? Math.abs(guess.height - answer.height) <= 5
            ? "higher-close"
            : "higher"
          : Math.abs(guess.height - answer.height) <= 5
            ? "lower-close"
            : "lower",
    birthMonth:
      guess.birthMonth === answer.birthMonth
        ? "correct"
        : guessMonth > answerMonth
          ? monthDiff <= 2
            ? "higher-close"
            : "higher"
          : monthDiff <= 2
            ? "lower-close"
            : "lower",
  };
}

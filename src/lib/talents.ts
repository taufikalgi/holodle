import { publicJson } from "./api-client";

export type Branch = "JP" | "EN" | "ID" | "DEV_IS" | "Stars JP" | "Stars EN";

export const ALL_BRANCHES: Branch[] = ["JP", "EN", "ID", "DEV_IS", "Stars JP", "Stars EN"];

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
  avatarUrl: string;
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
  avatar_url: string;
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
    avatarUrl: talent.avatar_url,
    altNames: talent.alt_names ?? [],
  };
}

let poolCache: Talent[] | null = null;
let poolInflight: Promise<Talent[]> | null = null;

function dedupeByName(talents: Talent[]): Talent[] {
  return talents.filter(
    (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
  );
}

/** Fetches + normalizes the talent pool. Cached; concurrent calls share one request. */
export function loadTalents(): Promise<Talent[]> {
  if (poolCache) return Promise.resolve(poolCache);
  if (!poolInflight) {
    poolInflight = publicJson<ApiTalent[]>("/api/v1/talent/").then(
      (data) => {
        poolCache = dedupeByName(data.map(normalizeTalent));
        return poolCache;
      },
      (err) => {
        poolInflight = null;
        throw err;
      }
    );
  }
  return poolInflight;
}

export function getTalentOfTheDay(pool: Talent[], date = new Date()): Talent | null {
  if (pool.length === 0) return null;
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return pool[seed % pool.length];
}

export function getDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function filterTalentsByBranch(
  talents: Talent[],
  branches: string[]
): Talent[] {
  if (branches.length === 0) return talents;
  return talents.filter((t) => branches.includes(t.branch));
}

export function searchTalents(
  query: string,
  pool: Talent[] = []
): Talent[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return pool
    .filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.altNames && t.altNames.some((alt) => alt.toLowerCase().includes(q)))
    )
    .slice(0, 8);
}

export type CompareResult = {
  name: "correct" | "wrong";
  branch: "correct" | "wrong";
  debutYear: "correct" | "higher" | "higher-close" | "lower" | "lower-close";
  loreArchetype: "correct" | "wrong";
  height: "correct" | "higher" | "higher-close" | "lower" | "lower-close";
  birthMonth: "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close";
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

type MonthKey = keyof typeof MONTH_ORDER;

function isValidMonth(month: string): month is MonthKey {
  return month in MONTH_ORDER;
}

/** Unknown/empty month → null (caller treats as non-comparable, never throws). */
function monthNumber(month: string): number | null {
  if (!isValidMonth(month)) return null;
  return MONTH_ORDER[month];
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
  const guessMonth = monthNumber(guess.birthMonth);
  const answerMonth = monthNumber(answer.birthMonth);
  const monthDiff =
    guessMonth !== null && answerMonth !== null
      ? Math.abs(guessMonth - answerMonth)
      : null;
  const birthMonth: CompareResult["birthMonth"] =
    guess.birthMonth === answer.birthMonth
      ? "correct"
      : monthDiff === null
        ? "wrong"
        : guessMonth! > answerMonth!
          ? monthDiff <= 2
            ? "higher-close"
            : "higher"
          : monthDiff <= 2
            ? "lower-close"
            : "lower";
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
    birthMonth,
  };
}

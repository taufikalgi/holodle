"use client";

export type Corner = "nw" | "ne" | "sw" | "se";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: "Easy", color: "#15803d", bg: "#dcfce7" },
  medium: { label: "Medium", color: "#a16207", bg: "#fef9c3" },
  hard: { label: "Hard", color: "#b91c1c", bg: "#fee2e2" },
};

export interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CropAreaData extends CropBox {
  difficulty: Difficulty;
}

export interface CropArea extends CropAreaData {
  id: string;
}

export interface EditableArea extends CropAreaData {
  key: string;
  id: string | null;
  dirty: boolean;
}

export interface MockTalent {
  id: string;
  name: string;
  branch: string;
  imageUrl: string;
}

export const MOCK_TALENTS: MockTalent[] = [
  {
    id: "mock-tokino-sora",
    name: "Tokino Sora",
    branch: "JP",
    imageUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tokino-Sora_pr-img_01.webp",
  },
  {
    id: "mock-roboco",
    name: "Roboco",
    branch: "JP",
    imageUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Robocosan_pr-img_01.webp",
  },
  {
    id: "mock-azki",
    name: "AZKi",
    branch: "JP",
    imageUrl: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/AZKi_pr-img_01.webp",
  },
  {
    id: "mock-sakura-miko",
    name: "Sakura Miko",
    branch: "JP",
    imageUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Sakura-Miko_pr-img_01.png",
  },
  {
    id: "mock-hoshimachi-suisei",
    name: "Hoshimachi Suisei",
    branch: "JP",
    imageUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Hoshimachi-Suisei_pr-img_01.png",
  },
];

const STORAGE_PREFIX = "holodle-mock-avatar-areas:";
const LATENCY = 650;

const keyFor = (talentId: string) => `${STORAGE_PREFIX}${talentId}`;

function readStored(talentId: string): CropArea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(keyFor(talentId));
    return raw ? (JSON.parse(raw) as CropArea[]) : [];
  } catch {
    return [];
  }
}

function writeStored(talentId: string, areas: CropArea[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(talentId), JSON.stringify(areas));
}

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

let seq = 0;
const nextId = () => `area-${Date.now()}-${++seq}`;

const roundBox = (box: CropAreaData) => ({
  x: Math.round(box.x),
  y: Math.round(box.y),
  w: Math.round(box.w),
  h: Math.round(box.h),
  difficulty: box.difficulty,
});

export async function fetchMockAreas(talentId: string): Promise<CropArea[]> {
  return wait(readStored(talentId).map((a) => ({ ...a })));
}

export async function createMockArea(talentId: string, box: CropAreaData): Promise<CropArea> {
  const area: CropArea = { id: nextId(), ...roundBox(box) };
  writeStored(talentId, [...readStored(talentId), area]);
  return wait({ ...area });
}

export async function updateMockArea(
  talentId: string,
  areaId: string,
  box: CropAreaData
): Promise<CropArea> {
  const next: CropArea = { id: areaId, ...roundBox(box) };
  writeStored(
    talentId,
    readStored(talentId).map((a) => (a.id === areaId ? next : a))
  );
  return wait({ ...next });
}

export async function deleteMockArea(talentId: string, areaId: string): Promise<void> {
  writeStored(
    talentId,
    readStored(talentId).filter((a) => a.id !== areaId)
  );
  return wait(undefined);
}

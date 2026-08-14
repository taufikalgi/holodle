"use client";

import { authFetch } from "@/hooks/useAuth";
import { ApiError } from "./errors";
import type { Talent } from "./talent-api";

export type { Talent };

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

const roundBox = (box: CropAreaData) => ({
  x: Math.round(box.x),
  y: Math.round(box.y),
  w: Math.round(box.w),
  h: Math.round(box.h),
  difficulty: box.difficulty,
});

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

async function read<T>(res: Response): Promise<Envelope<T>> {
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok) {
    const message = (json && "error" in json && (json as { error?: string }).error) || null;
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return json ?? {};
}

const areasPath = (talentId: string) =>
  `/api/v1/talent/${encodeURIComponent(talentId)}/areas`;
const areaPath = (talentId: string, areaId: string) =>
  `${areasPath(talentId)}/${encodeURIComponent(areaId)}`;

export async function fetchAreas(talentId: string): Promise<CropArea[]> {
  const res = await authFetch(areasPath(talentId));
  const json = await read<{ talent_id: string; areas: CropArea[] }>(res);
  return json.data?.areas ?? [];
}

export async function createArea(talentId: string, box: CropAreaData): Promise<CropArea> {
  const res = await authFetch(areasPath(talentId), {
    method: "POST",
    body: JSON.stringify(roundBox(box)),
  });
  const json = await read<CropArea>(res);
  if (!json.data?.id) throw new ApiError("failed to create crop area", 500);
  return json.data;
}

export async function updateArea(
  talentId: string,
  areaId: string,
  box: CropAreaData
): Promise<CropArea> {
  const res = await authFetch(areaPath(talentId, areaId), {
    method: "PUT",
    body: JSON.stringify(roundBox(box)),
  });
  const json = await read<CropArea>(res);
  if (!json.data?.id) throw new ApiError("failed to update crop area", 500);
  return json.data;
}

export async function deleteArea(talentId: string, areaId: string): Promise<void> {
  const res = await authFetch(areaPath(talentId, areaId), { method: "DELETE" });
  await read<null>(res);
}
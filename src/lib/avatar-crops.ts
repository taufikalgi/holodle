import { authFetch, readEnvelope } from "./api-client";
import { withIdempotency } from "./commands";
import { ApiError } from "./errors";
import type { AdminTalent as Talent } from "./talents";

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

export interface CropGenerationResult {
  talent_id: string;
  total_generated: number;
  areas: CropArea[];
  dry_run: boolean;
}

export interface TalentCropResult {
  talent_id: string;
  talent_name: string;
  success: boolean;
  areas_count: number;
  error?: string;
}

export interface BatchGenerationSummary {
  processed: number;
  succeeded: number;
  failed: number;
  details: TalentCropResult[];
}

export interface GenerateCropOptions {
  dryRun?: boolean;
  overwrite?: boolean;
}

const roundBox = (box: CropAreaData) => ({
  x: Math.round(box.x),
  y: Math.round(box.y),
  w: Math.round(box.w),
  h: Math.round(box.h),
  difficulty: box.difficulty,
});

const areasPath = (talentId: string) =>
  `/api/v1/talent/${encodeURIComponent(talentId)}/areas`;
const areaPath = (talentId: string, areaId: string) =>
  `${areasPath(talentId)}/${encodeURIComponent(areaId)}`;

export async function fetchAreas(talentId: string): Promise<CropArea[]> {
  const res = await authFetch(areasPath(talentId));
  const data = await readEnvelope<{ talent_id: string; areas: CropArea[] }>(res);
  return data?.areas ?? [];
}

export async function createArea(talentId: string, box: CropAreaData): Promise<CropArea> {
  const res = await authFetch(
    areasPath(talentId),
    withIdempotency({
      method: "POST",
      body: JSON.stringify(roundBox(box)),
    })
  );
  const data = await readEnvelope<CropArea>(res);
  if (!data?.id) throw new ApiError("failed to create crop area", 500);
  return data;
}

export async function updateArea(
  talentId: string,
  areaId: string,
  box: CropAreaData
): Promise<CropArea> {
  const res = await authFetch(
    areaPath(talentId, areaId),
    withIdempotency({
      method: "PUT",
      body: JSON.stringify(roundBox(box)),
    })
  );
  const data = await readEnvelope<CropArea>(res);
  if (!data?.id) throw new ApiError("failed to update crop area", 500);
  return data;
}

export async function deleteArea(talentId: string, areaId: string): Promise<void> {
  const res = await authFetch(
    areaPath(talentId, areaId),
    withIdempotency({ method: "DELETE" })
  );
  await readEnvelope<null>(res);
}

export async function generateCrops(
  talentId: string,
  options: GenerateCropOptions = {}
): Promise<CropGenerationResult> {
  const params = new URLSearchParams({
    dry_run: String(options.dryRun ?? true),
    overwrite: String(options.overwrite ?? false),
  });
  const res = await authFetch(
    `${areasPath(talentId)}/generate?${params.toString()}`,
    { method: "POST", credentials: "include" }
  );
  return readEnvelope<CropGenerationResult>(res);
}

export async function generateMissingCrops(
  dryRun = true,
  signal?: AbortSignal
): Promise<BatchGenerationSummary> {
  const params = new URLSearchParams({ dry_run: String(dryRun) });
  const res = await authFetch(
    `/api/v1/talent/areas/generate-missing?${params.toString()}`,
    { method: "POST", credentials: "include", signal }
  );
  return readEnvelope<BatchGenerationSummary>(res);
}

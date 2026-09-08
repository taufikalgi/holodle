import { apiBaseUrl, publicFetch, readEnvelope } from "./api-client";
import { ApiError } from "./errors";
import { getDateString, normalizeTalent } from "./talents";
import type { ApiTalent, Talent } from "./talents";
import type { CropArea } from "./avatar-crops";

export interface AvatarRound {
  talent: Talent;
  areas: CropArea[];
}

export interface AvatarTalentRecord {
  talent_id?: string;
  id?: string;
  talent?: ApiTalent;
  avatar_url?: string;
  areas?: CropArea[];
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function base(): string {
  return `${apiBaseUrl()}/api/v1`;
}

export async function fetchAvatarTalents(): Promise<AvatarTalentRecord[]> {
  const res = await publicFetch(`${base()}/avatar/talents`);
  const data = await readEnvelope<
    AvatarTalentRecord[] | { talents?: AvatarTalentRecord[] }
  >(res);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.talents)
      ? data.talents
      : null;
  if (!Array.isArray(list)) {
    throw new ApiError("invalid avatar talents payload", 500);
  }
  return list.filter((item) =>
    Boolean(
      item &&
        (typeof item.talent_id === "string" ||
          typeof item.id === "string" ||
          (item.talent && typeof item.talent.id === "string"))
    )
  );
}

export async function fetchAvatarAreas(talentId: string): Promise<CropArea[]> {
  const res = await publicFetch(`${base()}/avatar/${encodeURIComponent(talentId)}`);
  const data = await readEnvelope<
    { talent_id?: string; id?: string; avatar_url?: string; areas?: CropArea[] } | CropArea[]
  >(res);
  const areas = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.areas)
      ? data.areas
      : null;
  if (!Array.isArray(areas)) {
    throw new ApiError("invalid avatar crop payload", 500);
  }
  return areas;
}

export function getAvatarTalentPool(validTalents: AvatarTalentRecord[], pool: Talent[]): Talent[] {
  const joined = validTalents.flatMap((entry) => {
    if (entry.talent) return [normalizeTalent(entry.talent)];
    const id = entry.talent_id ?? entry.id;
    if (!id) return [];
    const match = pool.find((talent) => talent.id === id);
    return match ? [match] : [];
  });

  return joined.filter((talent, index, arr) => arr.findIndex((x) => x.id === talent.id) === index);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getAvatarTalentOfTheDay(pool: Talent[], date = getDateString()): Talent | null {
  if (pool.length === 0) return null;
  const seed = hashString(`avatar:${date}`);
  return pool[seed % pool.length];
}

export function pickRandomAvatarTalent(pool: Talent[], excludeIds: string[] = []): Talent | null {
  if (pool.length === 0) return null;
  const available = pool.filter((talent) => !excludeIds.includes(talent.id));
  const candidates = available.length > 0 ? available : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

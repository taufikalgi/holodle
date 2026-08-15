import { config } from "./config";
import { ApiError } from "./errors";
import { ALL_TALENTS, getDateString, normalizeTalent } from "./talents";
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

async function read<T>(res: Response): Promise<Envelope<T>> {
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok) {
    const message = json?.error || json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return json ?? {};
}

const BASE = `${config.apiUrl}/api/v1`;

export async function fetchAvatarTalents(): Promise<AvatarTalentRecord[]> {
  const res = await fetch(`${BASE}/avatar/talents`);
  const json = await read<AvatarTalentRecord[] | { talents?: AvatarTalentRecord[] }>(res);
  const data = Array.isArray(json.data)
    ? json.data
    : isRecord(json.data) && Array.isArray(json.data.talents)
      ? json.data.talents
      : null;
  if (!Array.isArray(data)) {
    throw new ApiError("invalid avatar talents payload", 500);
  }
  return data.filter((item) =>
    Boolean(
      item &&
        (typeof item.talent_id === "string" ||
          typeof item.id === "string" ||
          (item.talent && typeof item.talent.id === "string"))
    )
  );
}

export async function fetchAvatarAreas(talentId: string): Promise<CropArea[]> {
  const res = await fetch(`${BASE}/avatar/${encodeURIComponent(talentId)}`);
  const json = await read<{ talent_id?: string; id?: string; avatar_url?: string; areas?: CropArea[] } | CropArea[]>(res);
  const areas = Array.isArray(json.data)
    ? json.data
    : isRecord(json.data) && Array.isArray(json.data.areas)
      ? json.data.areas
      : null;
  if (!Array.isArray(areas)) {
    throw new ApiError("invalid avatar crop payload", 500);
  }
  return areas;
}

export function getAvatarTalentPool(validTalents: AvatarTalentRecord[]): Talent[] {
  const joined = validTalents.flatMap((entry) => {
    if (entry.talent) return [normalizeTalent(entry.talent)];
    const id = entry.talent_id ?? entry.id;
    if (!id) return [];
    const match = ALL_TALENTS.find((talent) => talent.id === id);
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

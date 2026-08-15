import { config } from "./config";
import { ApiError } from "./errors";
import { normalizeTalent } from "./talents";
import type { Talent } from "./talents";
import type { CropArea } from "./avatar-crops";

export interface AvatarRound {
  talent: Talent;
  areas: CropArea[];
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
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

export async function fetchAvatarValidCount(): Promise<number> {
  const res = await fetch(`${BASE}/avatar/valid-count`);
  const json = await read<{ count: number }>(res);
  return json.data?.count ?? 0;
}

export async function fetchAvatarRound(): Promise<AvatarRound> {
  const res = await fetch(`${BASE}/avatar/random`);
  const json = await read<{ talent: Parameters<typeof normalizeTalent>[0]; areas: CropArea[] }>(res);
  const data = json.data;
  if (!data || !data.talent || !Array.isArray(data.areas) || data.areas.length === 0) {
    throw new ApiError("invalid avatar round payload", 500);
  }
  return { talent: normalizeTalent(data.talent), areas: data.areas };
}
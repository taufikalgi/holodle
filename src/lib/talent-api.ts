export interface Talent {
  id: string;
  name: string;
  branch: string;
  debut_year: number | null;
  lore_archetype: string;
  height: number | null;
  birth_month: string;
  image_url: string;
  avatar_url: string;
  alt_names: string[];
}

export interface TalentsResponse {
  success: boolean;
  message: string;
  data: Talent[];
}

export type TalentFormData = Omit<Talent, "id"> & { id?: string };

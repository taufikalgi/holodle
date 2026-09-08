import type { ApiTalent } from "./talents";

export type Talent = ApiTalent;

export interface TalentsResponse {
  success: boolean;
  message: string;
  data: Talent[];
}

export type TalentFormData = Omit<Talent, "id" | "branch"> & {
  id?: string;
  // Draft strings — validated on submit (branch must be a valid Branch).
  branch: string;
};

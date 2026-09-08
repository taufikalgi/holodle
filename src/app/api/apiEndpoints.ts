import { config } from "@/lib/config";

// Compat re-export — prefer importing from "@/lib/api-client" directly.
export const API_ENDPOINTS = {
  get apiUrl() {
    return config.apiUrl;
  },
  get googleAuthUrl() {
    return config.googleAuthUrl;
  },
};

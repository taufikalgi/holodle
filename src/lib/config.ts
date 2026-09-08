import { apiBaseUrl, googleAuthUrl } from "./api-client";

export const config = {
  get googleAuthUrl() {
    return googleAuthUrl();
  },
  get apiUrl() {
    return apiBaseUrl();
  },
};

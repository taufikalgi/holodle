import { config } from "@/lib/config";

export const API_ENDPOINTS = {
  apiUrl: config.apiUrl, // base URL for API requests (e.g. fetching user picture)
  googleAuthUrl: config.googleAuthUrl, // redirects user to Google OAuth
};

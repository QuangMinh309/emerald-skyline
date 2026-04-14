import Constants from "expo-constants";

const API_PREFIX = "/api/v1";
const DEPLOY_API_BASE_URL = "https://emerald-skyline-be.onrender.com/api/v1";

export const resolveApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  // Default to deployed backend for demos when no local env is configured.
  if (DEPLOY_API_BASE_URL) {
    return DEPLOY_API_BASE_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    "";
  const hostName = hostUri.split(":")[0];

  if (hostName) {
    return `http://${hostName}:4000${API_PREFIX}`;
  }

  return `http://localhost:4000${API_PREFIX}`;
};

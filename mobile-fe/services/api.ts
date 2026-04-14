import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { router } from "expo-router";
import {
  clearAuthStorage,
  getAccessToken,
  setAccessToken,
} from "@/utils/auth-storage";
import { resolveApiBaseUrl } from "@/utils/api-base-url";

const baseURL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const resolveRefreshQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

const forceLogout = async () => {
  resolveRefreshQueue(null);
  isRefreshing = false;
  await clearAuthStorage();
  router.replace("/(auth)/login");
};

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers = config.headers || {};

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  else {
    delete (config.headers as any).Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean; _networkRetry?: boolean })
      | undefined;

    // Handle temporary network timeout (common when Render cold starts)
    if (
      original &&
      !error.response &&
      !original._networkRetry &&
      ["get", "GET"].includes(String(original.method || "get"))
    ) {
      original._networkRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return api(original);
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = String(original?.url ?? "");

    // Không refresh cho chính auth endpoints
    const skipRefreshPaths = [
      "/auth/login",
      "/auth/refresh",
      "/auth/logout",
      "/auth/change-password",
    ];

    if (skipRefreshPaths.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    // Chỉ xử lý 401 và chỉ retry 1 lần
    if (!original || status !== 401 || original._retry) return Promise.reject(error);

    // Nếu đang refresh -> đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(error);
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Refresh token nằm trong cookie httpOnly -> chỉ cần gọi refresh
      const rr = await refreshClient.post("/auth/refresh");

      // Backend có thể trả accessToken theo nhiều shape
      const accessToken: string | undefined =
        (rr.data as any)?.accessToken ?? (rr.data as any)?.data?.accessToken;

      if (typeof accessToken !== "string" || !accessToken) {
        console.log("Bad refresh response:", rr.data);
        throw new Error("No valid accessToken in refresh response");
      }

      await setAccessToken(accessToken);

      // giải phóng queue
      resolveRefreshQueue(accessToken);

      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      resolveRefreshQueue(null);
      await forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

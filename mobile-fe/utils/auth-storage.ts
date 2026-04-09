import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export const getAccessToken = async () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);


export const setAccessToken = async (accessToken: string) => {
if (typeof accessToken !== "string" || !accessToken) {
    throw new Error(`setAccessToken expects string, got ${typeof accessToken}`);
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const getStoredUser = async () => {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = async (user: AuthUser) => {
  if (!user) throw new Error("setStoredUser: empty user");
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = async () => {
  console.log("da goi clearStoredUser");
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const clearAuthStorage = async () => {
  console.log("da goi clearAuthStorage");
  await Promise.all([clearTokens(), clearStoredUser()]);
};

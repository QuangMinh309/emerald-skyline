import type { AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setTokens = (accessToken: string) => {
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearTokens = () => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredUser = () => {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
};

export const setStoredUser = (user: AuthUser) => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
	localStorage.removeItem(USER_KEY);
};

export const clearAuthStorage = () => {
	clearTokens();
	clearStoredUser();
};

export const isJwtExpired = (token: string) => {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		const expMs = payload.exp * 1000;
		console.log("Goi toi ham isJwtExpired, expMs =", expMs);
		return Date.now() >= expMs - 5000; // trừ 5s buffer
	} catch {
		return true;
	}
};

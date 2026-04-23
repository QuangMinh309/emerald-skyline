import { describe, expect, it, vi } from "vitest";

import {
	clearAuthStorage,
	clearTokens,
	getAccessToken,
	getStoredUser,
	isJwtExpired,
	setStoredUser,
	setTokens,
} from "@/lib/auth-storage";
import type { AuthUser } from "@/types/auth";

const createJwt = (expSeconds: number) => {
	const payload = JSON.stringify({ exp: expSeconds });
	return `header.${btoa(payload)}.signature`;
};

const userFixture: AuthUser = {
	id: 1,
	email: "resident@example.com",
	role: "RESIDENT",
	isActive: true,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("auth-storage", () => {
	it("sets, gets and clears access token", () => {
		setTokens("test_access_token");
		expect(getAccessToken()).toBe("test_access_token");

		clearTokens();
		expect(getAccessToken()).toBeNull();
	});

	it("stores and retrieves current user", () => {
		setStoredUser(userFixture);
		expect(getStoredUser()).toEqual(userFixture);
	});

	it("returns null when stored user is malformed", () => {
		localStorage.setItem("auth_user", "not-json");
		expect(getStoredUser()).toBeNull();
	});

	it("clears both token and user data", () => {
		setTokens("token");
		setStoredUser(userFixture);

		clearAuthStorage();

		expect(getAccessToken()).toBeNull();
		expect(getStoredUser()).toBeNull();
	});

	it("returns false for non-expired token and true for near-expiry token", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
		vi.spyOn(console, "log").mockImplementation(() => {});

		const nowSeconds = Math.floor(Date.now() / 1000);
		const validToken = createJwt(nowSeconds + 60);
		const nearExpiryToken = createJwt(nowSeconds + 3);

		expect(isJwtExpired(validToken)).toBe(false);
		expect(isJwtExpired(nearExpiryToken)).toBe(true);

		vi.useRealTimers();
	});

	it("returns true for malformed JWT", () => {
		expect(isJwtExpired("invalid-token")).toBe(true);
	});
});

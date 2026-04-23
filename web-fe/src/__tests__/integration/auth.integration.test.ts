import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedAxiosInstance, mockedRefreshAxios } = vi.hoisted(() => ({
	mockedAxiosInstance: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
	mockedRefreshAxios: {
		post: vi.fn(),
	},
}));

vi.mock("@/lib/axios", () => ({
	default: mockedAxiosInstance,
	refreshAxios: mockedRefreshAxios,
}));

import {
	changePassword,
	login,
	logout,
	refreshToken,
} from "@/services/auth.service";

describe("auth service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls login endpoint and returns data payload", async () => {
		const payload = {
			accessToken: "access-token",
			refreshToken: "refresh-token",
		};
		mockedRefreshAxios.post.mockResolvedValueOnce({ data: { data: payload } });

		const result = await login({
			email: "admin@example.com",
			password: "secret",
		});

		expect(mockedRefreshAxios.post).toHaveBeenCalledWith("/auth/login", {
			email: "admin@example.com",
			password: "secret",
		});
		expect(result).toEqual(payload);
	});

	it("refreshes token from refresh endpoint", async () => {
		mockedRefreshAxios.post.mockResolvedValueOnce({
			data: { data: { accessToken: "new-token" } },
		});

		const result = await refreshToken();

		expect(mockedRefreshAxios.post).toHaveBeenCalledWith("/auth/refresh");
		expect(result).toEqual({ accessToken: "new-token" });
	});

	it("posts change password payload and logs out", async () => {
		mockedAxiosInstance.post
			.mockResolvedValueOnce({ data: { data: { ok: true } } })
			.mockResolvedValueOnce({ data: {} });

		const changed = await changePassword({
			oldPassword: "old-pass",
			newPassword: "new-pass",
		});
		await logout();

		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			1,
			"/auth/change-password",
			{
				oldPassword: "old-pass",
				newPassword: "new-pass",
			},
		);
		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(2, "/auth/logout");
		expect(changed).toEqual({ ok: true });
	});
});

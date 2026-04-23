import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedAxiosInstance } = vi.hoisted(() => ({
	mockedAxiosInstance: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("@/lib/axios", () => ({
	default: mockedAxiosInstance,
}));

import {
	createAccount,
	deleteManyAccounts,
	getAccountById,
	getAccounts,
	restoreAccount,
	updateAccount,
} from "@/services/accounts.service";

describe("accounts service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches accounts with query params", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const params = { search: "admin", role: "ADMIN", isActive: true };
		const result = await getAccounts(params);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/accounts", {
			params,
		});
		expect(result).toEqual([{ id: 1 }]);
	});

	it("updates account by id", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 7 } },
		});

		const result = await updateAccount({
			id: 7,
			data: {
				email: "updated.user@example.com",
				role: "TECHNICIAN",
				isActive: true,
			},
		});

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith("/accounts/7", {
			email: "updated.user@example.com",
			role: "TECHNICIAN",
			isActive: true,
		});
		expect(result).toEqual({ id: 7 });
	});

	it("gets account detail and delete many accounts", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 12 } },
		});
		mockedAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

		const detail = await getAccountById(12);
		const deleted = await deleteManyAccounts([1, 2, 3]);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/accounts/12");
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/accounts/delete-many",
			{
				ids: [1, 2, 3],
			},
		);
		expect(detail).toEqual({ id: 12 });
		expect(deleted).toEqual({ success: true });
	});

	it("propagates account lookup errors", async () => {
		mockedAxiosInstance.get.mockRejectedValueOnce(new Error("Not Found"));

		await expect(getAccountById(404)).rejects.toThrow("Not Found");

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/accounts/404");
	});

	it("creates and restores account", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 15, email: "admin-new@example.com" } },
		});
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 15, isActive: true } },
		});

		const created = await createAccount({
			email: "admin-new@example.com",
			password: "secret123",
			role: "ADMIN",
		});
		const restored = await restoreAccount(15);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/accounts", {
			email: "admin-new@example.com",
			password: "secret123",
			role: "ADMIN",
		});
		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/accounts/15/restore",
		);
		expect(created).toEqual({ id: 15, email: "admin-new@example.com" });
		expect(restored).toEqual({ id: 15, isActive: true });
	});
});

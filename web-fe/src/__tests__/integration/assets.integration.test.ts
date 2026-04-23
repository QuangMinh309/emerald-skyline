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
	createAsset,
	deleteManyAssets,
	getAssetTypes,
	getAssets,
} from "@/services/assests.service";

describe("assets service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches assets list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getAssets();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/assets");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("creates asset and maps response payload", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 88 } },
		});

		const result = await createAsset({
			name: "Thang may A",
			typeId: 2,
			blockId: 1,
			floor: 1,
			locationDetail: "Sanh tang 1",
			status: "ACTIVE",
			installationDate: "2025-01-01",
			warrantyYears: 2,
			maintenanceIntervalMonths: 6,
		});

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/assets",
			expect.objectContaining({ name: "Thang may A" }),
		);
		expect(result).toEqual({ id: 88 });
	});

	it("fetches asset types and delete many assets", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 10 }] },
		});
		mockedAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

		const types = await getAssetTypes();
		const deleted = await deleteManyAssets([3, 4]);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/asset-types");
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/assets/delete-many",
			{
				ids: [3, 4],
			},
		);
		expect(types).toEqual([{ id: 10 }]);
		expect(deleted).toEqual({ success: true });
	});
});

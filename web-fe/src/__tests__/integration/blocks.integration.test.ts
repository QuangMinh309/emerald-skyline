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
	getBlocks,
	hasResidentsInBlock,
	updateBlock,
} from "@/services/blocks.service";

describe("blocks service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches block list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getBlocks();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/blocks");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("updates block by id", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 3 } },
		});

		const result = await updateBlock({
			id: 3,
			data: {
				buildingName: "Block C",
				managerName: "Tran B",
				managerPhone: "0900000000",
				status: "ACTIVE",
				apartments: [
					{ roomName: "C-1001", type: "STANDARD", area: 75, floor: 10 },
				],
			},
		});

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/blocks/3",
			expect.objectContaining({ buildingName: "Block C" }),
		);
		expect(result).toEqual({ id: 3 });
	});

	it("checks whether block has residents", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { hasResidents: true } },
		});

		const result = await hasResidentsInBlock(9);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/blocks/9/has-residents",
		);
		expect(result).toEqual({ hasResidents: true });
	});
});

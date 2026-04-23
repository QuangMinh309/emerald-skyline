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

import { getFeeById, getFees } from "@/services/fee.service";

describe("fee service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches fee list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1, name: "Water fee" }] },
		});

		const result = await getFees();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/fees");
		expect(result).toEqual([{ id: 1, name: "Water fee" }]);
	});

	it("fetches fee detail", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 2, name: "Parking fee", tiers: [] } },
		});

		const result = await getFeeById(2);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/fees/2");
		expect(result).toEqual({ id: 2, name: "Parking fee", tiers: [] });
	});

	it("propagates fee lookup errors", async () => {
		mockedAxiosInstance.get.mockRejectedValueOnce(new Error("Not Found"));

		await expect(getFeeById(404)).rejects.toThrow("Not Found");
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/fees/404");
	});
});

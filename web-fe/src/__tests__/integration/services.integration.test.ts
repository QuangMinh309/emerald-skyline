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
	createService,
	deleteManyServices,
	getServices,
	updateService,
} from "@/services/services.service";

describe("services module integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches service list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getServices();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/services");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("creates and updates service with multipart form data", async () => {
		const payload = new FormData();
		payload.append("name", "Ve sinh cong cong");
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 31 } },
		});
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 31 } },
		});

		const created = await createService(payload);
		const updated = await updateService({ id: 31, payload });

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/services",
			payload,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/services/31",
			payload,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		expect(created).toEqual({ id: 31 });
		expect(updated).toEqual({ id: 31 });
	});

	it("deletes multiple services", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

		const deleted = await deleteManyServices([1, 2, 3]);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/services/delete-many",
			{
				ids: [1, 2, 3],
			},
		);
		expect(deleted).toEqual({ success: true });
	});
});

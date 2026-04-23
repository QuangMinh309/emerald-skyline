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
	createApartment,
	getApartmentById,
	getApartments,
	updateApartment,
} from "@/services/apartments.service";

describe("apartments service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches apartment list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getApartments();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/apartments");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("creates apartment and returns created entity", async () => {
		const apartmentData = {
			roomName: "A-101",
			type: "STANDARD",
			blockId: 1,
			floor: 10,
			area: 75,
			owner_id: 3,
			residents: [{ id: 10, relationship: "OWNER" }],
		};
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 99 } },
		});

		const result = await createApartment(apartmentData);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/apartments",
			apartmentData,
		);
		expect(result).toEqual({ id: 99 });
	});

	it("updates and gets apartment by id", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 2 } },
		});
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 2 } },
		});

		await updateApartment({
			id: 2,
			data: {
				roomName: "B-1201",
				type: "DUPLEX",
				blockId: 2,
				floor: 12,
				area: 120,
				owner_id: 8,
				residents: [{ id: 8, relationship: "OWNER" }],
			},
		});
		const detail = await getApartmentById(2);

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
			"/apartments/2",
			expect.objectContaining({ roomName: "B-1201" }),
		);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/apartments/2");
		expect(detail).toEqual({ id: 2 });
	});
});

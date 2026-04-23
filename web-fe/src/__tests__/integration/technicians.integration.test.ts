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
	createTechnician,
	deleteManyTechnicians,
	deleteTechnician,
	getTechnicianById,
	getTechnicians,
	updateTechnician,
} from "@/services/technicians.service";

describe("technicians service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches technician list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1, fullName: "Tran Van B" }] },
		});

		const result = await getTechnicians();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/technicians");
		expect(result).toEqual([{ id: 1, fullName: "Tran Van B" }]);
	});

	it("creates technician", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 3, fullName: "Nguyen Van A" } },
		});

		const result = await createTechnician({
			fullName: "Nguyen Van A",
			phoneNumber: "0900000000",
			status: "AVAILABLE",
			description: "New technician",
		});

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/technicians", {
			fullName: "Nguyen Van A",
			phoneNumber: "0900000000",
			status: "AVAILABLE",
			description: "New technician",
		});
		expect(result).toEqual({ id: 3, fullName: "Nguyen Van A" });
	});

	it("updates technician by id", async () => {
		mockedAxiosInstance.patch.mockResolvedValueOnce({
			data: { data: { id: 4, status: "BUSY" } },
		});

		const result = await updateTechnician({
			id: 4,
			data: {
				fullName: "Le Van C",
				phoneNumber: "0911222333",
				status: "BUSY",
				description: null,
			},
		});

		expect(mockedAxiosInstance.patch).toHaveBeenCalledWith("/technicians/4", {
			fullName: "Le Van C",
			phoneNumber: "0911222333",
			status: "BUSY",
			description: null,
		});
		expect(result).toEqual({ id: 4, status: "BUSY" });
	});

	it("gets technician detail by id", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: { id: 6, fullName: "Pham Thi D" } },
		});

		const result = await getTechnicianById(6);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/technicians/6");
		expect(result).toEqual({ id: 6, fullName: "Pham Thi D" });
	});

	it("deletes technician by id", async () => {
		mockedAxiosInstance.delete.mockResolvedValueOnce({
			data: { success: true },
		});

		const result = await deleteTechnician(9);

		expect(mockedAxiosInstance.delete).toHaveBeenCalledWith("/technicians/9");
		expect(result).toEqual({ success: true });
	});

	it("deletes many technicians", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { deletedCount: 2 },
		});

		const result = await deleteManyTechnicians([7, 8]);

		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			"/technicians/delete-many",
			{ ids: [7, 8] },
		);
		expect(result).toEqual({ deletedCount: 2 });
	});

	it("propagates technician lookup errors", async () => {
		mockedAxiosInstance.get.mockRejectedValueOnce(new Error("Not found"));

		await expect(getTechnicians()).rejects.toThrow("Not found");
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/technicians");
	});
});

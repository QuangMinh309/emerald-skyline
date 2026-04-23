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
	createResident,
	getAdminInvoicesAndPaymentsByResidentId,
	getInvoicesAndPaymentsByResidentId,
	getResidents,
} from "@/services/residents.service";

describe("residents service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches resident list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getResidents();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/residents");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("creates resident with multipart form data", async () => {
		mockedAxiosInstance.post.mockResolvedValueOnce({
			data: { data: { id: 10 } },
		});

		const result = await createResident({
			email: "resident@example.com",
			fullName: "Nguyen Van A",
			citizenId: "079203123456",
			dob: "1998-10-10",
			gender: "MALE",
			phoneNumber: "0912345678",
			nationality: "Vietnam",
			ward: "Ben Nghe",
			district: "District 1",
			province: "Ho Chi Minh",
			detailAddress: "1 Nguyen Hue",
		});

		const [url, formData, config] = mockedAxiosInstance.post.mock.calls[0];
		expect(url).toBe("/residents");
		expect(formData).toBeInstanceOf(FormData);
		expect((formData as FormData).get("citizenId")).toBe("079203123456");
		expect(config).toEqual({
			headers: { "Content-Type": "multipart/form-data" },
		});
		expect(result).toEqual({ id: 10 });
	});

	it("gets resident invoice/payment data for resident and admin", async () => {
		mockedAxiosInstance.get
			.mockResolvedValueOnce({
				data: { invoices: [{ id: 1 }], payments: [{ id: 11 }] },
			})
			.mockResolvedValueOnce({
				data: { invoices: [{ id: 2 }], payments: [{ id: 22 }] },
			});

		const clientView = await getInvoicesAndPaymentsByResidentId(5);
		const adminView = await getAdminInvoicesAndPaymentsByResidentId(5);

		expect(mockedAxiosInstance.get).toHaveBeenNthCalledWith(
			1,
			"/residents/5/invoices",
		);
		expect(mockedAxiosInstance.get).toHaveBeenNthCalledWith(
			2,
			"/admin/residents/5/invoices",
		);
		expect(clientView).toEqual({
			invoices: [{ id: 1 }],
			payments: [{ id: 11 }],
		});
		expect(adminView).toEqual({
			invoices: [{ id: 2 }],
			payments: [{ id: 22 }],
		});
	});
});

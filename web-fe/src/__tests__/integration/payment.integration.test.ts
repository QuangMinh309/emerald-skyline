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
	getAdminInvoicesAndPaymentsByResidentId,
	getInvoicesAndPaymentsByResidentId,
} from "@/services/residents.service";

describe("payment flow integration (resident invoices + payments)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads resident-level invoices and payments", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: {
				invoices: [{ id: 1, totalAmount: 1200000 }],
				payments: [{ id: 10, amount: 1200000, status: "SUCCESS" }],
			},
		});

		const result = await getInvoicesAndPaymentsByResidentId(18);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/residents/18/invoices",
		);
		expect(result).toEqual({
			invoices: [{ id: 1, totalAmount: 1200000 }],
			payments: [{ id: 10, amount: 1200000, status: "SUCCESS" }],
		});
	});

	it("loads admin-level invoices and payments for resident", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: {
				invoices: [{ id: 2, invoiceCode: "INV-002" }],
				payments: [{ id: 20, txnRef: "TXN-20" }],
			},
		});

		const result = await getAdminInvoicesAndPaymentsByResidentId(18);

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/admin/residents/18/invoices",
		);
		expect(result).toEqual({
			invoices: [{ id: 2, invoiceCode: "INV-002" }],
			payments: [{ id: 20, txnRef: "TXN-20" }],
		});
	});
});

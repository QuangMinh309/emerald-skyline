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
	createInvoiceByAdmin,
	getInvoices,
	getInvoicesMadeByClient,
	verifyInvoice,
} from "@/services/invoices.service";

describe("invoices service integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("fetches invoice list", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: { data: [{ id: 1 }] },
		});

		const result = await getInvoices();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/invoices");
		expect(result).toEqual([{ id: 1 }]);
	});

	it("creates and verifies invoice", async () => {
		mockedAxiosInstance.post
			.mockResolvedValueOnce({ data: { data: { id: 9 } } })
			.mockResolvedValueOnce({ data: { data: { id: 9, status: "VERIFIED" } } });

		const created = await createInvoiceByAdmin({
			waterIndex: 110,
			electricityIndex: 520,
			apartmentId: 7,
			period: "2026-04",
		});
		const verified = await verifyInvoice({
			invoiceId: 9,
			meterReadings: [{ feeTypeId: 1, newIndex: 520 }],
		});

		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			1,
			"/invoices/admin",
			{
				waterIndex: 110,
				electricityIndex: 520,
				apartmentId: 7,
				period: "2026-04",
			},
		);
		expect(mockedAxiosInstance.post).toHaveBeenNthCalledWith(
			2,
			"/invoices/verify-invoice-readings",
			{
				invoiceId: 9,
				meterReadings: [{ feeTypeId: 1, newIndex: 520 }],
			},
		);
		expect(created).toEqual({ id: 9 });
		expect(verified).toEqual({ id: 9, status: "VERIFIED" });
	});

	it("normalizes numeric fields for client-created invoices", async () => {
		mockedAxiosInstance.get.mockResolvedValueOnce({
			data: {
				data: [
					{
						subtotalAmount: "1000",
						vatAmount: "80",
						totalAmount: "1080",
						meterReadings: [
							{ oldIndex: "10", newIndex: "20", usageAmount: "10" },
						],
					},
				],
			},
		});

		const result = await getInvoicesMadeByClient();

		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			"/invoices/client-created/list",
		);
		expect(result[0]?.subtotalAmount).toBe(1000);
		expect(result[0]?.vatAmount).toBe(80);
		expect(result[0]?.totalAmount).toBe(1080);
		expect(result[0]?.meterReadings[0]?.oldIndex).toBe(10);
	});
});

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
	createBooking,
	getBookingById,
	getBookingsByServiceId,
	updateBooking,
} from "@/services/bookings.service";

describe("bookings service integration", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-23T00:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("filters bookings by service id", async () => {
		const promise = getBookingsByServiceId(1);
		await vi.advanceTimersByTimeAsync(200);

		const result = await promise;

		expect(result).toHaveLength(3);
		expect(result[0]?.serviceId).toBe(1);
	});

	it("gets booking detail by id", async () => {
		const promise = getBookingById(101);
		await vi.advanceTimersByTimeAsync(200);

		const result = await promise;

		expect(result.id).toBe(101);
		expect(result.code).toBe("BK-202601-0001");
	});

	it("creates booking with generated code when not provided", async () => {
		const promise = createBooking({
			serviceId: 3,
			customerName: "Pham Van E",
			customerPhone: "0901112233",
			bookingDate: "2026-04-24",
			unitPrice: 150000,
			totalPrice: 150000,
			status: "PENDING",
		});
		await vi.advanceTimersByTimeAsync(200);

		const result = await promise;

		expect(result.serviceId).toBe(3);
		expect(result.code).toMatch(/^BK-202604-/);
		expect(result.createdAt).toBe("2026-04-23T00:00:00.200Z");
	});

	it("updates booking status", async () => {
		const promise = updateBooking({
			id: 102,
			payload: { status: "COMPLETED", totalPrice: 70000 },
		});
		await vi.advanceTimersByTimeAsync(200);

		const result = await promise;

		expect(result.id).toBe(102);
		expect(result.status).toBe("COMPLETED");
		expect(result.totalPrice).toBe(70000);
	});
});

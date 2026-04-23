import { describe, expect, it } from "vitest";

import { formatVND } from "@/utils/money";

describe("formatVND", () => {
	it("returns em dash for nullish and invalid numbers", () => {
		expect(formatVND(null)).toBe("—");
		expect(formatVND(undefined)).toBe("—");
		expect(formatVND(Number.NaN)).toBe("—");
		expect(formatVND(Number.POSITIVE_INFINITY)).toBe("—");
	});

	it("formats number using vi-VN locale", () => {
		expect(formatVND(1_000_000)).toBe("1.000.000");
	});

	it("rounds decimals before formatting", () => {
		expect(formatVND(1500.6)).toBe("1.501");
	});
});

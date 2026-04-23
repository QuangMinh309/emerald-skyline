import { describe, expect, it } from "vitest";

import { normalizeString } from "@/utils/string";

describe("normalizeString", () => {
	it("normalizes Vietnamese accents and casing", () => {
		expect(normalizeString("  Đặng Văn Á  ")).toBe("dang van a");
	});

	it("returns empty string for nullish values", () => {
		expect(normalizeString(null)).toBe("");
		expect(normalizeString(undefined)).toBe("");
	});

	it("stringifies number inputs", () => {
		expect(normalizeString(12345)).toBe("12345");
	});
});

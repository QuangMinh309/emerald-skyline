import { describe, expect, it } from "vitest";

import { formatDuration } from "@/utils/formatDuration";

describe("formatDuration", () => {
  it("returns 0p for falsy values", () => {
    expect(formatDuration(0)).toBe("0p");
  });

  it("formats minutes below one hour", () => {
    expect(formatDuration(45)).toBe("45p");
  });

  it("formats exact hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats fractional hours when minutes remain", () => {
    expect(formatDuration(90)).toBe("1.5h");
  });
});

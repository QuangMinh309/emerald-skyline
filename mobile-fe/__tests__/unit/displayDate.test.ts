import { addDays, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";

import { getDisplayDate } from "@/utils/displayDate";

describe("getDisplayDate", () => {
  it("prefixes today label for current date", () => {
    const today = startOfDay(new Date());
    expect(getDisplayDate(today)).toContain("Hôm nay");
  });

  it("prefixes tomorrow label for tomorrow date", () => {
    const tomorrow = addDays(startOfDay(new Date()), 1);
    expect(getDisplayDate(tomorrow)).toContain("Ngày mai");
  });

  it("returns weekday only for later dates", () => {
    const later = addDays(startOfDay(new Date()), 3);
    const text = getDisplayDate(later);
    expect(text).not.toContain("Hôm nay");
    expect(text).not.toContain("Ngày mai");
    expect(text.length).toBeGreaterThan(0);
  });
});

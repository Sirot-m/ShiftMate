import { describe, expect, it } from "vitest";

import {
  calculateShiftMinutes,
  formatDecimalHours,
  formatHoursLabel,
  summarizeWeek,
} from "@/lib/calculate-hours";
import type { ShiftDayEntry } from "@/types/shift";

describe("calculateShiftMinutes", () => {
  it("subtracts break from same-day shift", () => {
    expect(calculateShiftMinutes("09:00", "17:00", 30)).toBe(450);
  });

  it("returns 0 when times are missing", () => {
    expect(calculateShiftMinutes("", "17:00", 0)).toBe(0);
  });

  it("handles overnight shift when end is before start", () => {
    expect(calculateShiftMinutes("22:00", "06:00", 0)).toBe(480);
  });
});

describe("formatHoursLabel", () => {
  it("formats hours and minutes", () => {
    expect(formatHoursLabel(450)).toBe("7h 30m");
  });
});

describe("formatDecimalHours", () => {
  it("converts minutes to decimal hours", () => {
    expect(formatDecimalHours(450)).toBe(7.5);
  });
});

describe("summarizeWeek", () => {
  it("totals week minutes", () => {
    const days: ShiftDayEntry[] = [
      {
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "17:00",
        breakMinutes: 60,
      },
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "13:00",
        breakMinutes: 0,
      },
    ];

    const summary = summarizeWeek(days);

    expect(summary.days[0]?.totalMinutes).toBe(420);
    expect(summary.days[1]?.totalMinutes).toBe(240);
    expect(summary.weekTotalMinutes).toBe(660);
    expect(summary.weekDecimalHours).toBe(11);
  });
});

import { describe, expect, it } from "vitest";

import { calculateGrossPay, formatAud } from "@/lib/pay";

describe("calculateGrossPay", () => {
  it("multiplies worked hours by the hourly rate", () => {
    expect(calculateGrossPay(450, 30)).toBe(225);
  });

  it("rounds to the nearest cent", () => {
    expect(calculateGrossPay(50, 33.33)).toBe(27.78);
  });

  it("returns 0 for missing or invalid input", () => {
    expect(calculateGrossPay(450, 0)).toBe(0);
    expect(calculateGrossPay(0, 30)).toBe(0);
    expect(calculateGrossPay(450, Number.NaN)).toBe(0);
  });
});

describe("formatAud", () => {
  it("formats amounts as Australian dollars", () => {
    expect(formatAud(225)).toBe("$225.00");
  });
});

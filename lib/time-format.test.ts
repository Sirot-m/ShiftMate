import { describe, expect, it } from "vitest";

import {
  formatTime12,
  resolveHourSegment,
  resolveMinuteSegment,
  toStoredTime,
  toTime12,
} from "@/lib/time-format";

describe("resolveHourSegment", () => {
  it("completes unambiguous single digits", () => {
    expect(resolveHourSegment("6")).toEqual({ digits: "06", isComplete: true });
  });

  it("waits for a second digit after 1, which could become 10-12", () => {
    expect(resolveHourSegment("1")).toEqual({ digits: "1", isComplete: false });
    expect(resolveHourSegment("11")).toEqual({
      digits: "11",
      isComplete: true,
    });
  });

  it("restarts from the last digit when the pair exceeds 12", () => {
    expect(resolveHourSegment("13")).toEqual({
      digits: "03",
      isComplete: true,
    });
  });

  it("ignores non-digits", () => {
    expect(resolveHourSegment("a")).toEqual({ digits: "", isComplete: false });
  });
});

describe("resolveMinuteSegment", () => {
  it("completes digits above 5", () => {
    expect(resolveMinuteSegment("7")).toEqual({
      digits: "07",
      isComplete: true,
    });
  });

  it("waits after digits that can start a two-digit minute", () => {
    expect(resolveMinuteSegment("3")).toEqual({
      digits: "3",
      isComplete: false,
    });
    expect(resolveMinuteSegment("30")).toEqual({
      digits: "30",
      isComplete: true,
    });
  });

  it("restarts from the last digit when the pair exceeds 59", () => {
    expect(resolveMinuteSegment("65")).toEqual({
      digits: "05",
      isComplete: true,
    });
  });
});

describe("toTime12", () => {
  it("splits morning times", () => {
    expect(toTime12("09:30")).toEqual({ displayTime: "09:30", period: "AM" });
  });

  it("splits afternoon times", () => {
    expect(toTime12("21:05")).toEqual({ displayTime: "09:05", period: "PM" });
  });

  it("treats midnight as 12 AM and noon as 12 PM", () => {
    expect(toTime12("00:00")).toEqual({ displayTime: "12:00", period: "AM" });
    expect(toTime12("12:00")).toEqual({ displayTime: "12:00", period: "PM" });
  });

  it("returns an empty value for blank input", () => {
    expect(toTime12("")).toEqual({ displayTime: "", period: "AM" });
  });
});

describe("toStoredTime", () => {
  it("converts PM times to 24-hour format", () => {
    expect(toStoredTime("09:30", "PM")).toBe("21:30");
  });

  it("converts 12 AM to midnight and 12 PM to noon", () => {
    expect(toStoredTime("12:00", "AM")).toBe("00:00");
    expect(toStoredTime("12:00", "PM")).toBe("12:00");
  });

  it("rejects hours outside 1-12 and invalid minutes", () => {
    expect(toStoredTime("13:00", "AM")).toBeNull();
    expect(toStoredTime("09:60", "AM")).toBeNull();
    expect(toStoredTime("9am", "AM")).toBeNull();
  });
});

describe("formatTime12", () => {
  it("formats stored values for the summary table", () => {
    expect(formatTime12("17:15")).toBe("05:15 PM");
    expect(formatTime12("")).toBe("—");
  });
});

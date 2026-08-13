/** 0 = Monday … 6 = Sunday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ShiftDayEntry = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakMinutes: number;
};

export type WeekShifts = {
  weekStart: string;
  days: ShiftDayEntry[];
  /** Optional so weeks saved before pay estimates still load. */
  hourlyRate?: number;
};

export type DayTotal = {
  dayOfWeek: DayOfWeek;
  label: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalMinutes: number;
  hoursLabel: string;
  decimalHours: number;
};

export type WeekSummary = {
  days: DayTotal[];
  weekTotalMinutes: number;
  weekHoursLabel: string;
  weekDecimalHours: number;
};

export const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const EMPTY_SHIFT: Omit<ShiftDayEntry, "dayOfWeek"> = {
  startTime: "",
  endTime: "",
  breakMinutes: 0,
};

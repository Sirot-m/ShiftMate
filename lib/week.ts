import type { DayOfWeek, ShiftDayEntry, WeekShifts } from "@/types/shift";
import { EMPTY_SHIFT } from "@/types/shift";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const formatDateIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMondayOfWeek = (reference = new Date()): Date => {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);

  const dayIndex = date.getDay();
  const diffFromMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
  date.setDate(date.getDate() + diffFromMonday);

  return date;
};

export const getWeekDateRangeLabel = (weekStartIso: string): string => {
  const start = new Date(`${weekStartIso}T00:00:00`);
  const end = new Date(start.getTime() + 6 * MS_PER_DAY);

  const formatter = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
};

export const createEmptyWeek = (weekStart?: string): WeekShifts => {
  const start = weekStart ?? formatDateIso(getMondayOfWeek());

  const days: ShiftDayEntry[] = Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: index as DayOfWeek,
    ...EMPTY_SHIFT,
  }));

  return { weekStart: start, days, hourlyRate: 0 };
};

export const shiftStorageKey = (weekStart: string): string =>
  `workinghour-week-${weekStart}`;

export const shiftAdjacentWeek = (
  weekStartIso: string,
  direction: -1 | 1,
): string => {
  const date = new Date(`${weekStartIso}T00:00:00`);
  date.setDate(date.getDate() + direction * 7);
  return formatDateIso(date);
};

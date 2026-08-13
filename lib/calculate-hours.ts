import type { DayOfWeek, ShiftDayEntry, WeekSummary } from "@/types/shift";
import { DAY_LABELS } from "@/types/shift";

const MINUTES_PER_HOUR = 60;

const parseTimeToMinutes = (time: string): number | null => {
  if (!time.trim()) {
    return null;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * MINUTES_PER_HOUR + minutes;
};

export const calculateShiftMinutes = (
  startTime: string,
  endTime: string,
  breakMinutes: number,
): number => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start === null || end === null) {
    return 0;
  }

  let duration = end - start;
  if (duration < 0) {
    duration += 24 * MINUTES_PER_HOUR;
  }

  const safeBreak = Math.max(0, breakMinutes);
  return Math.max(0, duration - safeBreak);
};

export const formatHoursLabel = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours === 0 && minutes === 0) {
    return "0h";
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

export const formatDecimalHours = (totalMinutes: number): number => {
  return Math.round((totalMinutes / MINUTES_PER_HOUR) * 100) / 100;
};

export const summarizeWeek = (days: ShiftDayEntry[]): WeekSummary => {
  const dayTotals = days.map((day) => {
    const totalMinutes = calculateShiftMinutes(
      day.startTime,
      day.endTime,
      day.breakMinutes,
    );

    return {
      dayOfWeek: day.dayOfWeek as DayOfWeek,
      label: DAY_LABELS[day.dayOfWeek],
      startTime: day.startTime,
      endTime: day.endTime,
      breakMinutes: day.breakMinutes,
      totalMinutes,
      hoursLabel: formatHoursLabel(totalMinutes),
      decimalHours: formatDecimalHours(totalMinutes),
    };
  });

  const weekTotalMinutes = dayTotals.reduce(
    (sum, day) => sum + day.totalMinutes,
    0,
  );

  return {
    days: dayTotals,
    weekTotalMinutes,
    weekHoursLabel: formatHoursLabel(weekTotalMinutes),
    weekDecimalHours: formatDecimalHours(weekTotalMinutes),
  };
};

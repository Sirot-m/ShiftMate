export type TimePeriod = "AM" | "PM";

export type Time12 = {
  displayTime: string;
  period: TimePeriod;
};

const TIME_12_PATTERN = /^(0?[1-9]|1[0-2]):([0-5]\d)$/;

/** Splits a stored 24-hour "HH:mm" value into a typed "hh:mm" value plus AM/PM. */
export const toTime12 = (storedTime: string): Time12 => {
  const [hoursText = "", minutes = ""] = storedTime.split(":");
  const hours = Number(hoursText);

  if (!storedTime || Number.isNaN(hours) || minutes.length !== 2) {
    return { displayTime: "", period: "AM" };
  }

  const period: TimePeriod = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return {
    displayTime: `${String(hours12).padStart(2, "0")}:${minutes}`,
    period,
  };
};

/** Returns null when the typed value is not a valid 12-hour time. */
export const toStoredTime = (
  displayTime: string,
  period: TimePeriod,
): string | null => {
  const match = TIME_12_PATTERN.exec(displayTime.trim());

  if (!match) {
    return null;
  }

  const hours12 = Number(match[1]);
  const minutes = match[2];
  const hours24 = period === "AM" ? hours12 % 12 : (hours12 % 12) + 12;

  return `${String(hours24).padStart(2, "0")}:${minutes}`;
};

export type TimeSegment = {
  digits: string;
  /** True when no further digit can extend this segment, so focus may advance. */
  isComplete: boolean;
};

const toTwoDigits = (value: string): string => value.replace(/\D/g, "").slice(0, 2);

/** Hours 2-9 cannot start a two-digit hour, so a single keystroke completes them. */
export const resolveHourSegment = (rawValue: string): TimeSegment => {
  const digits = toTwoDigits(rawValue);

  if (!digits) {
    return { digits: "", isComplete: false };
  }

  if (digits.length === 1) {
    return digits >= "2"
      ? { digits: `0${digits}`, isComplete: true }
      : { digits, isComplete: false };
  }

  const asNumber = Number(digits);

  if (asNumber >= 1 && asNumber <= 12) {
    return { digits, isComplete: true };
  }

  const lastDigit = digits.slice(1);

  return lastDigit === "0"
    ? { digits: lastDigit, isComplete: false }
    : { digits: `0${lastDigit}`, isComplete: true };
};

export const resolveMinuteSegment = (rawValue: string): TimeSegment => {
  const digits = toTwoDigits(rawValue);

  if (!digits) {
    return { digits: "", isComplete: false };
  }

  if (digits.length === 1) {
    return digits >= "6"
      ? { digits: `0${digits}`, isComplete: true }
      : { digits, isComplete: false };
  }

  return Number(digits) <= 59
    ? { digits, isComplete: true }
    : { digits: `0${digits.slice(1)}`, isComplete: true };
};

export const formatTime12 = (storedTime: string): string => {
  const { displayTime, period } = toTime12(storedTime);

  return displayTime ? `${displayTime} ${period}` : "—";
};

const AUD_FORMATTER = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export const formatAud = (amount: number): string => AUD_FORMATTER.format(amount);

/** Gross pay before tax: worked hours multiplied by the hourly rate. */
export const calculateGrossPay = (
  totalMinutes: number,
  hourlyRate: number,
): number => {
  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0 || totalMinutes <= 0) {
    return 0;
  }

  return Math.round((totalMinutes / 60) * hourlyRate * 100) / 100;
};

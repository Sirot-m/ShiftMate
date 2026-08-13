"use client";

import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { TimeWithPeriodInput } from "@/components/shared/time-with-period-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { summarizeWeek } from "@/lib/calculate-hours";
import { calculateGrossPay, formatAud } from "@/lib/pay";
import { formatTime12 } from "@/lib/time-format";
import {
  createEmptyWeek,
  formatDateIso,
  getMondayOfWeek,
  getWeekDateRangeLabel,
  shiftAdjacentWeek,
  shiftStorageKey,
} from "@/lib/week";
import type { DayOfWeek, ShiftDayEntry, WeekShifts } from "@/types/shift";
import { DAY_LABELS, EMPTY_SHIFT } from "@/types/shift";

const SHORT_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hasShiftData = (day: ShiftDayEntry): boolean =>
  Boolean(day.startTime || day.endTime || day.breakMinutes > 0);

export const WeeklyTimesheetDashboard = () => {
  const [weekStart, setWeekStart] = useState(() =>
    formatDateIso(getMondayOfWeek()),
  );

  const emptyWeek = useMemo(() => createEmptyWeek(weekStart), [weekStart]);

  const [week, setWeek, isHydrated] = useLocalStorage<WeekShifts>(
    shiftStorageKey(weekStart),
    emptyWeek,
  );

  const inputSectionRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => summarizeWeek(week.days), [week.days]);
  const hourlyRate = week.hourlyRate ?? 0;
  const grossPay = calculateGrossPay(summary.weekTotalMinutes, hourlyRate);
  const filledDaysCount = week.days.filter(hasShiftData).length;

  const updateDay = (
    dayOfWeek: DayOfWeek,
    patch: Partial<Omit<ShiftDayEntry, "dayOfWeek">>,
  ) => {
    setWeek((current) => ({
      ...current,
      weekStart,
      days: current.days.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day,
      ),
    }));
  };

  const clearDay = (dayOfWeek: DayOfWeek) => {
    updateDay(dayOfWeek, EMPTY_SHIFT);
  };

  const changeWeek = (direction: -1 | 1) => {
    setWeekStart((current) => shiftAdjacentWeek(current, direction));
  };

  const scrollToShiftInput = () => {
    inputSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Working Hour Calculator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getWeekDateRangeLabel(weekStart)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => changeWeek(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next week"
            onClick={() => changeWeek(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <Card className="border-primary/20 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Weekly overview</CardTitle>
          <CardDescription>
            {filledDaysCount > 0
              ? `${filledDaysCount} of 7 days logged this week.`
              : "No shifts logged yet for this week."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/20 bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Total working hours
              </p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {summary.weekHoursLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.weekDecimalHours.toFixed(2)} decimal hours
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Estimated gross</p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {formatAud(grossPay)}
              </p>
              <p className="text-sm text-muted-foreground">
                {hourlyRate > 0
                  ? `Before tax at ${formatAud(hourlyRate)} per hour`
                  : "Add an hourly rate to estimate pay"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-1.5">
              <Label htmlFor="hourly-rate">Hourly rate (AUD)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min={0}
                step={0.5}
                value={hourlyRate || ""}
                placeholder="0.00"
                className="w-32"
                onChange={(event) =>
                  setWeek((current) => ({
                    ...current,
                    weekStart,
                    hourlyRate: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>

            <Button type="button" onClick={scrollToShiftInput}>
              <Plus className="size-4" />
              Add shift
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Weekly summary</CardTitle>
          <CardDescription>
            Totals update as you type. Decimal hours use 2 decimal places.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="text-right">Decimal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.days.map((day) => (
                <TableRow key={day.dayOfWeek}>
                  <TableCell className="font-medium">
                    <span className="sm:hidden">
                      {SHORT_DAY_LABELS[day.dayOfWeek]}
                    </span>
                    <span className="hidden sm:inline">{day.label}</span>
                  </TableCell>
                  <TableCell>{formatTime12(day.startTime)}</TableCell>
                  <TableCell>{formatTime12(day.endTime)}</TableCell>
                  <TableCell>
                    {day.breakMinutes > 0 ? `${day.breakMinutes}m` : "—"}
                  </TableCell>
                  <TableCell>{day.hoursLabel}</TableCell>
                  <TableCell className="text-right font-medium">
                    {day.decimalHours.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold">
                  Week total
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {summary.weekHoursLabel}
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {summary.weekDecimalHours.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Card
        ref={inputSectionRef}
        className="scroll-mt-4 border-primary/20 py-4 sm:py-6"
      >
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Weekly shift input</CardTitle>
          <CardDescription>
            Enter start, end, and break for each day. Break is deducted
            automatically. Data is saved in this browser until you sign in with
            Google (coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {filledDaysCount === 0 ? (
            <p className="mb-4 px-2 text-sm text-muted-foreground">
              No shifts yet — fill in a row below to get started.
            </p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Break (min)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {week.days.map((day) => (
                <TableRow key={day.dayOfWeek}>
                  <TableCell className="font-medium">
                    <span className="sm:hidden">
                      {SHORT_DAY_LABELS[day.dayOfWeek]}
                    </span>
                    <span className="hidden sm:inline">
                      {DAY_LABELS[day.dayOfWeek]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TimeWithPeriodInput
                      value={day.startTime}
                      ariaLabel={`${DAY_LABELS[day.dayOfWeek]} start time`}
                      onChange={(startTime) =>
                        updateDay(day.dayOfWeek, { startTime })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TimeWithPeriodInput
                      value={day.endTime}
                      ariaLabel={`${DAY_LABELS[day.dayOfWeek]} end time`}
                      onChange={(endTime) =>
                        updateDay(day.dayOfWeek, { endTime })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step={5}
                      value={day.breakMinutes || ""}
                      placeholder="0"
                      aria-label={`${DAY_LABELS[day.dayOfWeek]} break minutes`}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          breakMinutes: Number(event.target.value) || 0,
                        })
                      }
                      className="min-w-[5rem]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Clear ${DAY_LABELS[day.dayOfWeek]}`}
                      disabled={!hasShiftData(day)}
                      onClick={() => clearDay(day.dayOfWeek)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

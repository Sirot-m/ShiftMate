"use client";

import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  resolveHourSegment,
  resolveMinuteSegment,
  toStoredTime,
  toTime12,
  type TimePeriod,
} from "@/lib/time-format";

type TimeWithPeriodInputProps = {
  value: string;
  ariaLabel: string;
  onChange: (value: string) => void;
};

type TimeDraft = {
  hour: string;
  minute: string;
  period: TimePeriod;
};

export const TimeWithPeriodInput = ({
  value,
  ariaLabel,
  onChange,
}: TimeWithPeriodInputProps) => {
  const { displayTime, period: storedPeriod } = toTime12(value);
  const [storedHour = "", storedMinute = ""] = displayTime.split(":");
  const [draft, setDraft] = useState<TimeDraft | null>(null);

  const hour = draft ? draft.hour : storedHour;
  const minute = draft ? draft.minute : storedMinute;
  const period = draft ? draft.period : storedPeriod;

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);

  const commit = (next: TimeDraft) => {
    setDraft(next);

    if (!next.hour && !next.minute) {
      onChange("");
      return;
    }

    const storedTime = toStoredTime(`${next.hour}:${next.minute}`, next.period);

    if (storedTime) {
      onChange(storedTime);
    }
  };

  const handleHourChange = (rawValue: string) => {
    const { digits, isComplete } = resolveHourSegment(rawValue);

    commit({ hour: digits, minute, period });

    if (isComplete) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteChange = (rawValue: string) => {
    const { digits, isComplete } = resolveMinuteSegment(rawValue);

    commit({ hour, minute: digits, period });

    if (isComplete) {
      periodRef.current?.focus();
    }
  };

  /** Re-derive both segments from the stored value once focus leaves the group. */
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    if (draft && Boolean(draft.hour) !== Boolean(draft.minute)) {
      console.warn(
        `Incomplete time "${draft.hour}:${draft.minute}" was discarded.`,
      );
    }

    setDraft(null);
  };

  return (
    <div className="flex min-w-[10.5rem] items-center gap-1" onBlur={handleBlur}>
      <Input
        ref={hourRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={hour}
        placeholder="hh"
        aria-label={`${ariaLabel} hour`}
        className="w-11 px-1 text-center"
        onChange={(event) => handleHourChange(event.target.value)}
        onFocus={(event) => event.target.select()}
      />

      <span aria-hidden className="text-muted-foreground">
        :
      </span>

      <Input
        ref={minuteRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={minute}
        placeholder="mm"
        aria-label={`${ariaLabel} minute`}
        className="w-11 px-1 text-center"
        onChange={(event) => handleMinuteChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && !minute) {
            hourRef.current?.focus();
          }
        }}
      />

      <Select
        value={period}
        onValueChange={(nextPeriod: TimePeriod) =>
          commit({ hour, minute, period: nextPeriod })
        }
      >
        <SelectTrigger
          ref={periodRef}
          size="sm"
          className="w-[4.5rem]"
          aria-label={`${ariaLabel} period`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

"use client";

import { useCallback, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  /** Called with (startDate, endDate). At least one will always be set. */
  onChange: (start: string, end: string) => void;
  /** Earliest selectable date (applied to the start-date input). */
  minDate?: string;
  labelClassName?: string;
  inputClassName?: string;
  arrowClassName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Component ─────────────────────────────────────────────────────────

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  labelClassName = "text-xs font-semibold uppercase tracking-wide text-white/90",
  inputClassName = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
  arrowClassName = "text-white/50",
}: DateRangePickerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newStart = e.target.value;
      setError(null);

      // Block past dates
      const today = todayStr();
      if (newStart && newStart < today) {
        newStart = today;
        setError("Start date cannot be in the past. Reset to today.");
      }

      // If the current endDate is before the new startDate, clear it.
      const nextEnd =
        endDate && newStart && endDate < newStart ? "" : endDate ?? "";

      onChange(newStart, nextEnd);
    },
    [endDate, onChange],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newEnd = e.target.value;
      setError(null);

      // Block past dates
      const today = todayStr();
      if (newEnd && newEnd < today) {
        newEnd = today;
        setError("End date cannot be in the past. Reset to today.");
      }

      onChange(startDate ?? "", newEnd);
    },
    [startDate, onChange],
  );

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="date-range-start"
            className={labelClassName}
          >
            Start
          </label>
          <input
            id="date-range-start"
            type="date"
            value={startDate ?? ""}
            min={minDate}
            onChange={handleStartChange}
            className={inputClassName}
          />
        </div>

        <span className={arrowClassName} aria-hidden="true">
          →
        </span>

        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="date-range-end"
            className={labelClassName}
          >
            End
          </label>
          <input
            id="date-range-end"
            type="date"
            value={endDate ?? ""}
            min={startDate ?? minDate}
            onChange={handleEndChange}
            className={inputClassName}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

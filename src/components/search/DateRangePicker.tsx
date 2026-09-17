"use client";

import { useCallback, useRef, useState } from "react";
import DateCalendar from "./DateCalendar";
import { formatDateEn, toIsoDate } from "@/lib/date-format";

// ── Types ─────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  /** Called with (startDate, endDate). At least one will always be set. */
  onChange: (start: string, end: string) => void;
  /** Earliest selectable date (ISO YYYY-MM-DD). */
  minDate?: string;
  labelClassName?: string;
  inputClassName?: string;
  /** 未选择日期时的占位文字（英文）。 */
  placeholder?: string;
  arrowClassName?: string;
}

// ── Component ─────────────────────────────────────────────────────────

/**
 * DateRangePicker — 日期区间选择（**站点自绘的英文日期 UI**）。
 *
 * 本轮修正（彻底收口首页日期语言）：
 *   · 可见文本与选择界面全部由站点自己产出英文：
 *     字段显示 "Sep 14, 2026"（formatDateEn，显式 en-US）；
 *     日历标题 "September 2026"、星期 "Sun…Sat" 来自静态英文名称表。
 *   · **不再使用** `<input type="date">`：原生控件的界面语言由浏览器 locale 决定
 *     （zh-CN → 年/月/日 + 中文日历），页面 lang/CSS 均无法覆盖，属于浏览器 chrome，
 *     因此把它从首页日期 UI 中移除，而不是靠 CSS 掩盖。
 *   · 交互与语义保持：Start / End 两个字段、区间校验（结束不得早于开始）、
 *     过去日期不可选、Escape 关闭、点击外部关闭、键盘方向键移动。
 */
export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  labelClassName = "text-xs font-semibold uppercase tracking-wide text-white/90",
  inputClassName = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
  placeholder = "Select date",
  arrowClassName = "text-white/50",
}: DateRangePickerProps) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<"start" | "end" | null>(null);
  const startTriggerRef = useRef<HTMLButtonElement>(null);
  const endTriggerRef = useRef<HTMLButtonElement>(null);

  const today = toIsoDate(new Date());
  const startMin = minDate ?? today;

  const handleStartSelect = useCallback(
    (iso: string) => {
      setError(null);
      // 结束日期早于新开始日期 → 清空（保持既有行为）
      const nextEnd = endDate && endDate < iso ? "" : endDate ?? "";
      onChange(iso, nextEnd);
      setOpen(null);
      startTriggerRef.current?.focus();
    },
    [endDate, onChange],
  );

  const handleEndSelect = useCallback(
    (iso: string) => {
      if (startDate && iso < startDate) {
        setError("End date cannot be before the start date.");
        return;
      }
      setError(null);
      onChange(startDate ?? "", iso);
      setOpen(null);
      endTriggerRef.current?.focus();
    },
    [startDate, onChange],
  );

  const field = (
    id: string,
    labelText: string,
    value: string | null,
    min: string | undefined,
    triggerRef: React.RefObject<HTMLButtonElement | null>,
    which: "start" | "end",
  ) => (
    <div className="relative flex flex-1 flex-col gap-1.5">
      <label htmlFor={id} className={labelClassName}>
        {labelText}
      </label>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open === which}
        onClick={() => setOpen((cur) => (cur === which ? null : which))}
        className={`${inputClassName} text-left`}
      >
        {value ? (
          <span className="tabular-nums">{formatDateEn(value)}</span>
        ) : (
          <span className="text-ut-subtle">{placeholder}</span>
        )}
      </button>

      {open === which && (
        <DateCalendar
          value={value}
          min={min}
          align={which === "start" ? "start" : "end"}
          label={which === "start" ? "Select start date" : "Select end date"}
          onSelect={which === "start" ? handleStartSelect : handleEndSelect}
          onClose={() => {
            setOpen(null);
            triggerRef.current?.focus();
          }}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-end gap-2">
        {field("date-range-start", "Start", startDate, startMin, startTriggerRef, "start")}
        <span className={arrowClassName} aria-hidden="true">
          →
        </span>
        {field(
          "date-range-end",
          "End",
          endDate,
          startDate ?? startMin,
          endTriggerRef,
          "end",
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

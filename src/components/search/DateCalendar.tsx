"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MONTH_NAMES_EN,
  WEEKDAY_ORDER_EN,
  WEEKDAY_SHORT_EN,
  formatFullDateEn,
  formatMonthYearEn,
  fromIsoDate,
  toIsoDate,
} from "@/lib/date-format";

/**
 * DateCalendar — 站点自己的英文日历弹层（首页日期选择 UI 的唯一界面）。
 *
 * 为什么不用 `<input type="date">`：原生日期控件的**界面语言由浏览器 locale 决定**
 * （zh-CN 浏览器显示 年/月/日 与中文日历），页面 lang 与 CSS 都无法覆盖。
 * 首页要求统一英文，因此日期选择界面改为站点自绘：
 *   · 月份标题 "September 2026"、星期表头 "Sun…Sat" 全部来自静态英文名称表
 *     （lib/date-format.ts），完全不经过 Intl / 浏览器 locale；
 *   · 日期文本 "Sep 14, 2026" 同样由 formatDateEn()（en-US，显式 locale）产出。
 *
 * 交互：上一月 / 下一月、点选日期、方向键移动、Escape 关闭并归还焦点、
 * 点击外部关闭。不可选日期（早于 min）为 disabled。
 */

export interface DateCalendarProps {
  /** 已选日期（ISO YYYY-MM-DD）。 */
  value: string | null;
  /** 最早可选日期（ISO）。 */
  min?: string;
  /** 选中回调（ISO）。 */
  onSelect: (iso: string) => void;
  /** 关闭请求（Escape / 选中后由调用方决定是否关闭）。 */
  onClose: () => void;
  /** 弹层对齐（移动端防止横向溢出）：第一列 start，第二列 end。 */
  align?: "start" | "end";
  /** 弹层 aria-label（如 "Select start date"）。 */
  label: string;
}

interface Cell {
  iso: string;
  day: number;
  disabled: boolean;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function DateCalendar({
  value,
  min,
  onSelect,
  onClose,
  align = "start",
  label,
}: DateCalendarProps) {
  const selected = fromIsoDate(value);
  const minDate = fromIsoDate(min);

  // 视图月份：默认跟随已选日期，否则跟随 min（早于今天时用今天），否则今天
  const initial = selected ?? minDate ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // 方向键跨月移动后，待聚焦的 ISO（渲染完成后再聚焦）
  const pendingFocusRef = useRef<string | null>(null);

  const todayIso = toIsoDate(new Date());

  const cells = useMemo<Cell[]>(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const lead = first.getDay(); // 0 = Sunday（表头从周日开始）
    const total = daysInMonth(viewYear, viewMonth);
    const out: Cell[] = [];
    for (let i = 0; i < lead; i += 1) {
      out.push({ iso: "", day: 0, disabled: true });
    }
    for (let d = 1; d <= total; d += 1) {
      const iso = toIsoDate(new Date(viewYear, viewMonth, d));
      const before = minDate ? iso < toIsoDate(minDate) : false;
      out.push({ iso, day: d, disabled: before });
    }
    return out;
  }, [viewYear, viewMonth, minDate]);

  // 打开即进入日历：优先已选日期 → 今天 → 第一个可选日
  useEffect(() => {
    const target =
      (value && gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${value}"]`)) ||
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${todayIso}"]`) ||
      gridRef.current?.querySelector<HTMLButtonElement>("button[data-iso]:not([disabled])");
    target?.focus();
    // 仅在挂载时执行一次（打开动作 = 挂载）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftMonth = (delta: number) => {
    setViewMonth((m) => {
      const next = m + delta;
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  };

  // 关闭：点击外部
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  // 跨月后把焦点放回目标日期
  useEffect(() => {
    const iso = pendingFocusRef.current;
    if (!iso) return;
    pendingFocusRef.current = null;
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`);
    el?.focus();
  }, [viewYear, viewMonth]);

  const focusIso = (iso: string) => {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`);
    if (el) {
      el.focus();
      return;
    }
    pendingFocusRef.current = iso;
    const d = fromIsoDate(iso);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    const base = fromIsoDate(
      (e.target as HTMLElement)?.getAttribute?.("data-iso") || value || todayIso,
    );
    if (!base) return;
    const delta =
      e.key === "ArrowLeft" ? -1 :
      e.key === "ArrowRight" ? 1 :
      e.key === "ArrowUp" ? -7 :
      e.key === "ArrowDown" ? 7 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);
    if (minDate && toIsoDate(next) < toIsoDate(minDate)) return;
    focusIso(toIsoDate(next));
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={label}
      className={[
        "absolute top-full z-30 mt-1 w-[17.5rem] max-w-[calc(100vw-2rem)] rounded-ut-md",
        "border border-ut-border-strong bg-ut-surface-elevated p-3 shadow-ut-2 backdrop-blur-xl",
        align === "end" ? "right-0" : "left-0",
      ].join(" ")}
    >
      {/* 月份标题 + 上/下月 */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-ut-sm border border-ut-border text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:border-ut-border-strong hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span
          aria-live="polite"
          className="font-mono text-label uppercase tracking-[0.14em] text-ut-ink"
        >
          {formatMonthYearEn(viewYear, viewMonth)}
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-ut-sm border border-ut-border text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:border-ut-border-strong hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ut-accent"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* 星期表头（英文静态表，周日开头） */}
      <div aria-hidden="true" className="mt-2 grid grid-cols-7 gap-1">
        {WEEKDAY_ORDER_EN.map((i) => (
          <span
            key={`wd-${i}`}
            className="py-1 text-center font-mono text-micro uppercase tracking-[0.1em] text-ut-subtle"
          >
            {WEEKDAY_SHORT_EN[i]}
          </span>
        ))}
      </div>

      {/* 日期网格 */}
      <div
        ref={gridRef}
        role="group"
        aria-label={`${MONTH_NAMES_EN[viewMonth]} ${viewYear}`}
        className="mt-1 grid grid-cols-7 gap-1"
        onKeyDown={onKeyDown}
      >
        {cells.map((c, idx) => {
          if (!c.iso) {
            return <span key={`pad-${idx}`} aria-hidden="true" />;
          }
          const isSelected = value === c.iso;
          const isToday = c.iso === todayIso;
          return (
            <button
              key={c.iso}
              type="button"
              data-iso={c.iso}
              disabled={c.disabled}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={formatFullDateEn(c.iso)}
              onClick={() => onSelect(c.iso)}
              className={[
                "inline-flex h-8 items-center justify-center rounded-ut-sm text-body-sm tabular-nums",
                "transition-colors duration-[var(--ut-dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ut-accent",
                c.disabled
                  ? "cursor-not-allowed text-ut-subtle opacity-40"
                  : isSelected
                    ? "bg-ut-accent font-medium text-ut-inverse"
                    : "text-ut-text-2 hover:bg-ut-surface-hover hover:text-ut-ink",
                isToday && !isSelected ? "ring-1 ring-inset ring-ut-border-strong" : "",
              ].join(" ")}
            >
              {c.day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-ut-border pt-2">
        <button
          type="button"
          onClick={() => onClose()}
          className="min-h-[32px] rounded-ut-sm text-label text-ut-text-2 underline-offset-2 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => {
            if (!minDate || todayIso >= toIsoDate(minDate)) onSelect(todayIso);
          }}
          className="min-h-[32px] rounded-ut-sm text-label text-ut-accent underline-offset-2 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
        >
          Today
        </button>
      </div>
    </div>
  );
}

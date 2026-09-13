"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import VerdictTag from "./VerdictTag";
import {
  VERDICT_MEANING,
  type MonthRow,
} from "./besttime-labels";

/**
 * MonthSelector — Best-time 的**唯一** client 交互：Selected Month 状态。
 *
 * CONTRACT：
 *   §11 状态 = Selected Month。它**只改变外观与含义**（读数面板上替换掉同一个
 *       月份的读数），绝不改变结构、顺序、可见内容数量。表格、季节叙述、
 *       推荐结论在切换月份时结构完全不变。
 *   §12 月份选择器**不是 month Card Wall**：没有卡片、没有圆角容器、没有底色块。
 *       它是一条 mono 仪器刻度带：单像素 hairline + 顶部 accent 指示条 + 等宽标签，
 *       真实窗口内的月份带一枚 accent 圆点（数据标记，非选中态）。
 *   §13 可访问性硬约束：
 *       · tablist/tab 语义 + aria-selected + aria-controls → 屏幕阅读器可读；
 *       · 每个 tab 命中区 ≥ 44px（min-h-[44px]）；
 *       · roving tabindex + ←/→/↑/↓/Home/End 键盘导航（焦点随选择移动）；
 *       · 焦点可见（focus-visible outline，使用品牌 accent）。
 *   §31 首帧确定性：初始选中月由 page 以**真实数据**（默认 = 真实窗口首月）
 *       作为 prop 传入 → SSR 与客户端首次 render 完全一致 → 无 hydration 错配（#418 = 0）。
 *       这里刻意**不使用** new Date()，也不在 effect 里同步 setState。
 *
 * 数据诚实：面板里的 Temperature / Precipitation / Rain days 是 NASA POWER
 * 1991–2020 climate normals（canonical dataset），Daylight 是天文计算；
 * Best-time 窗口标记来自 canonical bestMonthsBaseline（R1–R7 派生）。
 */

const PANEL_ID = "besttime-month-panel";
const tabId = (monthIndex: number) => `besttime-month-tab-${monthIndex}`;

export default function MonthSelector({
  rows,
  initialMonth,
  city,
}: {
  rows: MonthRow[];
  initialMonth: number;
  city: string;
}) {
  const [selected, setSelected] = useState(initialMonth);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  if (rows.length === 0) return null;

  const selectedRow = rows.find((r) => r.index === selected) ?? rows[0];

  const moveTo = (pos: number) => {
    const clamped = Math.max(0, Math.min(rows.length - 1, pos));
    const next = rows[clamped];
    if (!next) return;
    setSelected(next.index);
    refs.current[clamped]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    pos: number,
  ) => {
    const last = rows.length - 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(pos === last ? 0 : pos + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(pos === 0 ? last : pos - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(last);
        break;
      default:
        break;
    }
  };

  return (
    <div data-ut-monthstate="">
      {/* 仪器刻度带：12 个月。mobile 6/row，sm+ 12/row；无卡片、无底块。 */}
      <div
        role="tablist"
        aria-label={`Select a month to inspect the climate pattern for ${city}`}
        aria-orientation="horizontal"
        className="flex flex-wrap"
      >
        {rows.map((row, pos) => {
          const isSelected = row.index === selected;
          return (
            <button
              key={row.index}
              ref={(el) => {
                refs.current[pos] = el;
              }}
              type="button"
              role="tab"
              id={tabId(row.index)}
              aria-selected={isSelected}
              aria-controls={PANEL_ID}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(row.index)}
              onKeyDown={(event) => onKeyDown(event, pos)}
              className={[
                "relative flex min-h-[44px] basis-1/6 flex-col items-center justify-center gap-1.5 border-t pb-3 pt-4 transition-colors duration-[var(--ut-dur-fast)] ease-ut-out sm:basis-1/12",
                isSelected
                  ? "border-ut-border-strong text-ut-ink"
                  : "border-ut-border text-ut-muted hover:text-ut-text",
              ].join(" ")}
            >
              {/* 选中指示条（accent 恒为品牌 terracotta，非季节色） */}
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-x-1 top-0 h-[2px]",
                  isSelected ? "bg-ut-accent" : "bg-transparent",
                ].join(" ")}
              />
              {/* 屏幕阅读器可读名（含真实窗口标记） */}
              <span className="sr-only">
                {row.name}
                {row.inWindow ? " — in the recommended window" : ""}
              </span>
              <span
                aria-hidden="true"
                className={[
                  "font-mono text-label tracking-wide",
                  isSelected ? "font-medium" : "",
                ].join(" ")}
              >
                {row.short}
              </span>
              {/* 数据标记：真实窗口内的月份（与选中态相互独立） */}
              <span
                aria-hidden="true"
                className={[
                  "h-[5px] w-[5px] rounded-full",
                  row.inWindow ? "bg-ut-accent" : "bg-transparent",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-3 font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
        ● marks a month inside the recommended window · use ← → to change month
      </p>

      {/* 读数面板：结构在 12 个月之间完全一致，只有数值/文字含义变化 */}
      <div
        role="tabpanel"
        id={PANEL_ID}
        aria-labelledby={tabId(selectedRow.index)}
        tabIndex={0}
        className="mt-6 grid gap-x-12 gap-y-7 border-t border-ut-border-strong pt-7 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <Eyebrow>Month readout</Eyebrow>
          <p className="mt-3 font-display text-h2 leading-[var(--ut-text-h2--lh)] text-ut-ink">
            {selectedRow.name}
          </p>
          <p className="mt-3 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
            {selectedRow.seasonName} ·{" "}
            {selectedRow.inWindow
              ? "In recommended window"
              : "Outside recommended window"}
          </p>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <VerdictTag verdict={selectedRow.verdict} />
            <span className="text-body-sm leading-[1.5] text-ut-text-2">
              {VERDICT_MEANING[selectedRow.verdict]}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <dl className="grid gap-x-10 sm:grid-cols-2">
            <ReadoutRow
              label="Temperature"
              value={`${selectedRow.tempHighC.toFixed(1)}° / ${selectedRow.tempLowC.toFixed(1)}°C`}
            />
            <ReadoutRow
              label="Precipitation"
              value={`${selectedRow.precipMm.toFixed(1)} mm`}
            />
            <ReadoutRow
              label="Rain days (≥1 mm)"
              value={selectedRow.precipDaysGe1mm.toFixed(1)}
            />
            <ReadoutRow
              label="Daylight"
              value={`${selectedRow.daylightHours.toFixed(1)} h`}
            />
          </dl>
          <p className="mt-6 max-w-[58ch] text-body leading-[1.6] text-ut-text-2">
            {selectedRow.note}
          </p>
          <p className="mt-4 max-w-[58ch] text-body-sm leading-[1.5] text-ut-subtle">
            Temperature, precipitation and rain days are 1991–2020 NASA POWER
            climate normals; daylight hours are astronomical. The verdict comes
            from the R1–R7 climate classification.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-ut-border py-3">
      <dt className="font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
        {label}
      </dt>
      <dd className="text-right font-mono text-body-sm text-ut-text">
        {value}
      </dd>
    </div>
  );
}

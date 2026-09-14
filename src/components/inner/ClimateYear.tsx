"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import VerdictTag from "@/components/besttime/VerdictTag";
import { VERDICT_MEANING, type MonthRow } from "@/components/besttime/besttime-labels";
import { displayVerdictForDerived } from "@/lib/inner-state";

/**
 * ClimateYear — Inner Experience SPEC v1 §C.5 的"12 个月视觉轨迹"。
 *
 * 它不是传统 chart：是一条**可扫读的仪器刻度带**。每一列同时编码四层信息，
 * 用户不读数字就能扫出"哪几个月好、为什么、怎么变"：
 *   ① verdict strip  — NASA R-tier（Favourable/Workable/Challenging → GOOD/WORKABLE/CHALLENGING）
 *   ② 温度区间形状   — tempLowC→tempHighC 区间柱 + tempMeanC 刻度线（固定标尺）
 *   ③ 降水柱         — precipMm（固定标尺）
 *   ④ rain-day 标记  — precipDaysGe1mm（固定标尺横刻）
 * 选中列的 readout 给出精确数值；月名上的 accent 圆点标记 canonical 推荐窗口
 * （与 MonthSelector 同一语义，数据同源 rows，绝无第二套权威）。
 *
 * 硬性契约：
 *   · 数据只来自 server 计算好的 MonthRow[]（NASA POWER canonical 派生）；
 *     本组件只做展示投影 —— 标尺是固定常量，不 round 语义、不评分、不生成推荐。
 *   · 确定性首帧：initialMonth 由 page 以真实数据传入（canonical 窗口首月），
 *     无 Date.now / Math.random / 布局测量渲染（#418 防护）。
 *   · 可访问性：tablist/tab + aria-selected + roving tabindex + ←/→/↑/↓/Home/End；
 *     readout aria-live="polite"；verdict 颜色永远伴随文字（tag + tier 词）；
 *     列命中区 ≥ 44px；hover 仅预览（变色），commit 只由 click/focus 触发。
 *   · 性能：纯 HTML/CSS + useState，无 chart 库、无动画库；transition 仅 color/bg。
 */

// ── 固定展示标尺（常量，文档化；覆盖 canonical 全域，越界钳制） ─────────────
const TEMP_MIN_C = -15;
const TEMP_MAX_C = 40;
const PRECIP_MAX_MM = 800; // canonical 全域 [0.5, 793.1] mm
const RAIN_DAYS_MAX = 31;

const TEMP_FIELD_H = 140; // px — 2.0 视觉重构：决策数据必须有主角级权重
const PRECIP_FIELD_H = 80; // px

const tempPct = (c: number) =>
  Math.min(100, Math.max(0, ((c - TEMP_MIN_C) / (TEMP_MAX_C - TEMP_MIN_C)) * 100));
const precipPct = (mm: number) =>
  Math.min(100, Math.max(0, (Math.sqrt(Math.max(mm, 0)) / Math.sqrt(PRECIP_MAX_MM)) * 100));
const rainDaysPct = (d: number) =>
  Math.min(100, Math.max(0, (d / RAIN_DAYS_MAX) * 100));

/** R-tier 展示档位 → 颜色类（字面量类名，Tailwind 可静态提取；文字恒伴随）。 */
const VERDICT_STRIP: Record<"good" | "workable" | "challenging", string> = {
  good: "bg-ut-verdict-good",
  workable: "bg-ut-verdict-workable",
  challenging: "bg-ut-verdict-challenging",
};

const VERDICT_WORD: Record<"good" | "workable" | "challenging", string> = {
  good: "Good",
  workable: "Workable",
  challenging: "Challenging",
};

const VERDICT_TEXT: Record<"good" | "workable" | "challenging", string> = {
  good: "text-ut-verdict-good",
  workable: "text-ut-verdict-workable",
  challenging: "text-ut-verdict-challenging",
};

const PANEL_ID = "climate-year-panel";
const TAB_ID = (i: number) => `climate-year-tab-${i}`;

export default function ClimateYear({
  rows,
  initialMonth,
  city,
  moment = false,
  onMonthChange,
}: {
  rows: MonthRow[];
  initialMonth: number;
  city: string;
  /** MOMENT 变体：选中月以 display 级呈现 + 刻度带可拖拽 scrub（Destination Scene 03） */
  moment?: boolean;
  /** MOMENT 场景回调：选中月变化时通知父级（YearScene 据此驱动场景氛围） */
  onMonthChange?: (monthIndex: number) => void;
}) {
  const [selected, setSelected] = useState(initialMonth);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const end = () => setIsDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [isDragging]);

  useEffect(() => {
    onMonthChange?.(selected);
  }, [selected, onMonthChange]);

  // 选中变化后把选中列滚入可视区（仅操作刻度带自身滚动容器，不影响页面滚动；
  // prefers-reduced-motion 下使用即时滚动，不做平滑动画）
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const tab = tabRefs.current[selected];
    if (!tab) return;
    const left = Math.max(0, tab.offsetLeft - strip.clientWidth / 2 + tab.offsetWidth / 2);
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo({ left, behavior: reduced ? "instant" : "smooth" });
  }, [selected]);

  if (rows.length === 0) return null;

  const selectedRow = rows.find((r) => r.index === selected) ?? rows[0];
  const selectedVerdict = displayVerdictForDerived(selectedRow.derived);

  const moveTo = (pos: number) => {
    const clamped = Math.max(0, Math.min(rows.length - 1, pos));
    const next = rows[clamped];
    if (!next) return;
    setSelected(next.index);
    tabRefs.current[clamped]?.focus();
  };

  // ── 拖拽 scrub（桌面：刻度带无横向滚动时；移动端保留 tap/横滑，避免手势冲突） ──
  const scrubTo = (clientX: number) => {
    const el = tablistRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const idx = Math.max(0, Math.min(rows.length - 1, Math.floor(ratio * rows.length)));
    const row = rows[idx];
    if (row && row.index !== selected) setSelected(row.index);
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stripRef.current && stripRef.current.scrollWidth > stripRef.current.clientWidth) return;
    setIsDragging(true);
    scrubTo(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    scrubTo(event.clientX);
  };
  const endDrag = () => setIsDragging(false);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, pos: number) => {
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
    <div data-ut-climateyear="">
      {/* 仪器刻度带：12 列。mobile 横向滚动 + snap；sm+ 12 列一次可见。 */}
      <div
        ref={stripRef}
        className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-x-visible sm:px-0"
      >
        <div
          ref={tablistRef}
          role="tablist"
          aria-label={`Climate year for ${city} — select a month`}
          aria-orientation="horizontal"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex min-w-[768px] snap-x snap-mandatory sm:min-w-0 sm:touch-none"
        >
          {rows.map((row, pos) => {
            const isSelected = row.index === selected;
            const verdict = displayVerdictForDerived(row.derived);
            return (
              <button
                key={row.index}
                ref={(el) => {
                  tabRefs.current[pos] = el;
                }}
                type="button"
                role="tab"
                id={TAB_ID(row.index)}
                aria-selected={isSelected}
                aria-controls={PANEL_ID}
                tabIndex={isSelected ? 0 : -1}
                aria-label={`${row.name} — ${verdict ? VERDICT_WORD[verdict] : "no data"} climate pattern${row.inWindow ? ", inside the recommended window" : ""}`}
                onClick={() => setSelected(row.index)}
                onKeyDown={(event) => onKeyDown(event, pos)}
                className={[
                  "group relative flex min-h-[44px] w-[64px] shrink-0 snap-start flex-col items-center px-1 pb-2 pt-2",
                  "transition-colors duration-[var(--ut-dur-fast)] ease-ut-out motion-reduce:transition-none sm:w-auto sm:min-w-0 sm:basis-1/12 sm:shrink",
                  isSelected
                    ? "bg-ut-surface text-ut-ink"
                    : "bg-transparent text-ut-muted hover:bg-ut-surface hover:text-ut-text motion-reduce:hover:bg-transparent",
                ].join(" ")}
              >
                {/* 选中指示条（accent = 交互色，恒为品牌 terracotta） */}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-1 top-0 h-[2px]",
                    isSelected ? "bg-ut-accent" : "bg-transparent",
                  ].join(" ")}
                />
                {/* ① 月名 + 推荐窗口圆点（数据标记，与选中态独立） */}
                <span className="flex items-center gap-1 font-mono text-sm leading-none tracking-wide">
                  <span className={isSelected ? "font-medium" : ""}>{row.short}</span>
                  <span
                    aria-hidden="true"
                    className={[
                      "h-[4px] w-[4px] rounded-full",
                      row.inWindow ? "bg-ut-accent" : "bg-transparent",
                    ].join(" ")}
                  />
                </span>
                {/* ② verdict strip（tier 状态色；文字语义在 aria-label 与 readout） */}
                <span
                  aria-hidden="true"
                  className={`mt-2 h-2 w-full max-w-[64px] rounded-ut-sm ${verdict ? VERDICT_STRIP[verdict] : "bg-ut-border"}`}
                />
                {/* ③ 温度区间形状：低→高软带 + 区间竖线 + 均值刻度（固定标尺 −15..40°C） */}
                <span
                  aria-hidden="true"
                  className="relative mt-2 block w-full max-w-[64px]"
                  style={{ height: TEMP_FIELD_H }}
                >
                  <span
                    className="absolute inset-x-[9px] bg-ut-data-fill"
                    style={{
                      bottom: `${tempPct(row.tempLowC)}%`,
                      height: `${Math.max(tempPct(row.tempHighC) - tempPct(row.tempLowC), 4)}%`,
                    }}
                  />
                  <span
                    className="absolute bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-ut-text-2"
                    style={{
                      height: `${Math.max(tempPct(row.tempHighC) - tempPct(row.tempLowC), 4)}%`,
                      bottom: `${tempPct(row.tempLowC)}%`,
                    }}
                  />
                  <span
                    className="absolute inset-x-0 h-[2px] bg-ut-ink"
                    style={{ bottom: `${tempPct(row.tempMeanC)}%` }}
                  />
                </span>
                {/* ④ 降水柱（固定标尺 0–800 mm，sqrt 投影） */}
                <span
                  aria-hidden="true"
                  className="relative mt-2 block w-full max-w-[64px] border-b border-ut-data-line"
                  style={{ height: PRECIP_FIELD_H }}
                >
                  <span
                    className="absolute inset-x-[14px] bottom-0 bg-ut-data-line"
                    style={{ height: `${Math.max(precipPct(row.precipMm), 2)}%` }}
                  />
                </span>
                {/* ⑤ rain-day 标记（固定标尺 0–31 天的横刻） */}
                <span
                  aria-hidden="true"
                  className="mt-2 block h-[3px] w-full max-w-[64px] bg-ut-border"
                >
                  <span
                    className={`block h-full ${isSelected ? "bg-ut-accent" : "bg-ut-text-2"}`}
                    style={{ width: `${Math.max(rainDaysPct(row.precipDaysGe1mm), 4)}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-2 font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
        ● recommended window · fixed scales −15–40 °C · 0–800 mm · 0–31 rain days ·
        use ← → to change month
      </p>

      {/* Readout：结构恒定，只换数值/含义；aria-live 播报选中月 */}
      <div
        role="tabpanel"
        id={PANEL_ID}
        aria-labelledby={TAB_ID(selectedRow.index)}
        aria-live="polite"
        tabIndex={0}
        className="mt-5 grid gap-x-10 gap-y-5 border-t border-ut-border-strong pt-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <p
            className={[
              "font-display leading-[1.02] text-ut-ink",
              moment ? "text-[clamp(2.5rem,5vw,4rem)]" : "text-h3",
            ].join(" ")}
          >
            {selectedRow.name}
          </p>
          <p className="mt-2 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
            {selectedRow.seasonName} ·{" "}
            {selectedRow.inWindow ? "In recommended window" : "Outside window"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <VerdictTag verdict={selectedRow.verdict} />
            {selectedVerdict && (
              <span
                className={`font-mono text-micro uppercase tracking-[0.16em] ${selectedVerdict ? VERDICT_TEXT[selectedVerdict] : ""}`}
              >
                {VERDICT_WORD[selectedVerdict]} (R-tier)
              </span>
            )}
          </div>
          <p className="mt-2 max-w-[52ch] text-body-sm leading-[1.5] text-ut-text-2">
            {VERDICT_MEANING[selectedRow.verdict]}
          </p>
        </div>

        <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
          <ReadoutRow
            label="High / Low"
            value={`${selectedRow.tempHighC.toFixed(1)}° / ${selectedRow.tempLowC.toFixed(1)}°C`}
          />
          <ReadoutRow label="Mean" value={`${selectedRow.tempMeanC.toFixed(1)}°C`} />
          <ReadoutRow label="Rain" value={`${selectedRow.precipMm.toFixed(1)} mm`} />
          <ReadoutRow
            label="Rain days (≥1 mm)"
            value={selectedRow.precipDaysGe1mm.toFixed(1)}
          />
          <ReadoutRow label="Daylight" value={`${selectedRow.daylightHours.toFixed(1)} h`} />
        </dl>
      </div>
    </div>
  );
}

function ReadoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-ut-border py-2.5">
      <dt className="font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
        {label}
      </dt>
      <dd className="text-right font-mono text-body-sm text-ut-text">{value}</dd>
    </div>
  );
}

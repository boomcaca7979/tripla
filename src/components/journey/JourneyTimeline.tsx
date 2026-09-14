import type { Trip } from "@/data/trips";
import { legHours, type JourneyLeg } from "./journey-state";

/**
 * JourneyTimeline — Day-by-day as a JOURNEY TIMELINE（本页的核心资产）。
 *
 * CONTRACT §12 / §13：
 *   必须从"卡片堆叠"升级为**旅程时间线**：
 *     · 垂直 hairline 轨道 + accent 节点（不是 rounded-2xl 卡片、没有 shadow）
 *     · Day 序号用 Geist Mono，Day theme 用 Instrument Serif，时间用 Geist Mono，
 *       活动名用 Geist Sans
 *     · **地点转换必须视觉显式**：每一天结束时渲染一个"Next stop"移动块
 *       （空心传递节点 + `{本日 place} → {次日 place}`），让"移动"可见，
 *       而不是让读者自己从两天的标题里推断。
 *
 * 数据诚实性：
 *   所有文本均来自 trip.itinerary[].{day,theme,activities[].{time,name,emoji}}；
 *   转换块的 from/to 就是相邻两天的 theme（真实字段），不编造句式化的交通描述。
 *
 * 语义：每段行程的 theme 是"Journey route" H2 之下的具名对象 → 使用 <h3>。
 */

const NODE_CLASS =
  "absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center rounded-ut-pill border border-ut-accent bg-ut-bg sm:-left-10";

export default function JourneyTimeline({
  trip,
  legs,
}: {
  trip: Trip;
  legs: JourneyLeg[];
}) {
  const days = trip.itinerary;
  if (days.length === 0) return null;

  return (
    <ol className="relative border-l border-ut-border pl-6 sm:pl-8">
      {days.map((d, i) => {
        const next = days[i + 1];
        const leg = legs[i];
        const hours = leg ? legHours(leg) : "";
        const stops = d.activities.length;

        return (
          <li key={d.day} className="relative mb-10 last:mb-0">
            {/* 日期节点：实心 accent 环（旅程的"到达"） */}
            <span className={NODE_CLASS} aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-ut-pill bg-ut-accent" />
            </span>

            <section
              id={`journey-day-${d.day}`}
              data-journey-day={d.day}
              className="scroll-mt-24"
            >
              <p className="font-mono text-label uppercase tracking-[0.18em] text-ut-muted tabular-nums">
                Day {String(d.day).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
                {d.theme}
              </h3>

              {/* 当日 movement 读数：停靠点数 + 时间跨度（真实字段派生） */}
              {(stops > 0 || hours) && (
                <p className="mt-1.5 font-mono text-label tracking-wide text-ut-muted tabular-nums">
                  {[stops > 0 ? `${stops} stops` : "", hours]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {stops > 0 && (
                <ul className="mt-4">
                  {d.activities.map((a, j) => (
                    <li
                      key={`${a.time}-${j}`}
                      className="relative flex items-baseline gap-4 border-t border-ut-border py-3 first:border-t-0"
                    >
                      {/* 每个停靠点的小 accent 刻度（hairline + 刻度 = movement） */}
                      <span
                        aria-hidden="true"
                        className="absolute -left-4 top-[1.4rem] h-1 w-1 rounded-ut-pill bg-ut-accent-line"
                      />
                      <span className="w-12 shrink-0 font-mono text-body-sm tabular-nums text-ut-muted">
                        {a.time}
                      </span>
                      <span className="min-w-0 flex-1 text-body leading-[1.5] text-ut-text">
                        {a.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-body-lg leading-none opacity-80"
                      >
                        {a.emoji}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 地点转换：显式的"移动"块（空心传递节点 + from → to） */}
            {next && (
              <div className="relative mt-7 border-t border-dashed border-ut-border pt-5">
                <span
                  aria-hidden="true"
                  className="absolute -left-8 top-[-9px] flex h-4 w-4 items-center justify-center rounded-ut-pill border border-ut-border-strong bg-ut-bg sm:-left-10"
                />
                <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
                  Next stop
                </p>
                <p className="mt-1.5 font-mono text-body-sm text-ut-text-2">
                  <span className="text-ut-text">{d.theme}</span>
                  <span aria-hidden="true" className="mx-2 text-ut-accent-strong">
                    →
                  </span>
                  <span className="text-ut-text">{next.theme}</span>
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

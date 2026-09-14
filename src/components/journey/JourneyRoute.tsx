import type { CSSProperties } from "react";
import type { Trip } from "@/data/trips";
import { legHours, type JourneyLeg } from "./journey-state";

/**
 * JourneyRoute — Route Overview as a JOURNEY STRIP（不是 4 张卡片）。
 *
 * CONTRACT §15：
 *   Route Overview 必须是一个**空间对象**：一条路线 + 沿途节点，
 *   顺序为 origin（旅程入口 gateway）→ stops（每一段 leg）→ destination（目的地）。
 *   禁止把它做成 4 个 MetaCard / 4 个圆角盒子。
 *
 * 数据诚实性（§5）：
 *   · origin      = trip.airport（真实字段：IATA + 机场名）——旅程实际落地的地方
 *   · stops       = trip.itinerary[].theme（真实字段）——每一段经过的地点/区域
 *   · destination = trip.city / trip.country（真实字段）
 *   本模板**不编造**旅客的出发城市（数据中不存在），因此 route 的起点使用
 *   数据中真实存在的入口 gateway。
 *
 * 语义：
 *   本 strip 是"路线总览 / 索引对象"，其 leg 标签与下方 Journey Timeline 的
 *   H3 是同一批 place（会重复）。为避免同名标题重复出现，strip 标签一律使用
 *   纯文本（<span>），**不使用标题标签** —— 与 Guide 的"索引行标题保持链接文本"
 *   约定一致；真正的具名对象标题只在下方的 Timeline / Highlights 中出现。
 *
 * 响应式（§34）：
 *   mobile 390 = 垂直路线（左轨 + 紧凑节点）；lg+ = 水平 route rail。
 *   当节点数 > 9（7/8/10/14 天的长行程，共 27 个 trip），水平条改为可横滑，
 *   列宽下限 8.5rem，保证长 theme 名不被压碎。
 */

interface RouteNode {
  kind: "origin" | "leg" | "destination";
  /** mono micro 标签（Gateway / Day n / Destination） */
  label: string;
  /** 主标签（place 名或 IATA） */
  primary: string;
  /** 主标签是否用等宽（IATA 码） */
  mono: boolean;
  /** mono 副读数 */
  secondary: string;
}

export default function JourneyRoute({
  trip,
  legs,
}: {
  trip: Trip;
  legs: JourneyLeg[];
}) {
  const nodes: RouteNode[] = [
    {
      kind: "origin",
      label: "Gateway",
      primary: trip.airport.iata,
      mono: true,
      secondary: trip.airport.name,
    },
    ...legs.map((leg) => ({
      kind: "leg" as const,
      label: `Day ${leg.day}`,
      primary: leg.place,
      mono: false,
      secondary: [leg.stops > 0 ? `${leg.stops} stops` : "", legHours(leg)]
        .filter(Boolean)
        .join(" · "),
    })),
    {
      kind: "destination",
      label: "Destination",
      primary: trip.city,
      mono: false,
      secondary: trip.country,
    },
  ];

  const n = nodes.length;
  const inset = `calc(100% / ${2 * n})`;
  // 节点 ≤ 9：等分列宽即可（253/280 个 trip）；更多节点则允许横滑。
  const routeMin = `calc(${n} * 8.5rem)`;

  return (
    <div
      className="relative lg:overflow-x-auto lg:pb-1"
      style={{ "--ut-route-min": routeMin } as CSSProperties}
    >
      <div className="relative lg:min-w-[var(--ut-route-min)]">
        {/* mobile：垂直路线轨 */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[5px] top-3 w-px bg-ut-border lg:hidden"
        />
        {/* lg：水平 route rail，两端各内缩半列 → 恰好从首个节点连到末个节点 */}
        <span
          aria-hidden="true"
          className="absolute top-[5px] hidden h-px bg-ut-border lg:block"
          style={{ left: inset, right: inset }}
        />

        <ol
          className="flex flex-col gap-6 lg:grid lg:gap-x-4 lg:gap-y-0"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {nodes.map((node) => (
            <li
              key={`${node.kind}-${node.label}`}
              className="relative pl-7 lg:pl-0 lg:text-center"
            >
              {/* 节点：mobile 落在左轨上；lg 回到文档流并水平居中于列 */}
              <span
                aria-hidden="true"
                className={[
                  "absolute left-0 top-1 h-[11px] w-[11px] rounded-ut-pill lg:static lg:mx-auto lg:mb-3 lg:block",
                  node.kind === "origin"
                    ? "border border-ut-border-strong bg-ut-bg"
                    : node.kind === "destination"
                      ? "border border-ut-ink bg-ut-ink"
                      : "border border-transparent",
                ].join(" ")}
                style={
                  node.kind === "leg"
                    ? { background: "rgba(var(--ut-journey-rgb, 164, 81, 59), 0.78)" }
                    : undefined
                }
              />

              <span className="block font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
                {node.label}
              </span>
              <span
                className={[
                  "mt-1 block break-words leading-[var(--ut-text-h3--lh)] text-ut-ink",
                  node.mono
                    ? "font-mono text-h3 tabular-nums"
                    : "font-display text-h3",
                ].join(" ")}
              >
                {node.primary}
              </span>
              {node.secondary && (
                <span className="mt-1 block font-mono text-label tracking-wide text-ut-muted">
                  {node.secondary}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

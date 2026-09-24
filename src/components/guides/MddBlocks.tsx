"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * 马蜂窝 /mdd/ 三大内容区共用系统（参考站三个 .block 本就同构）：
 *   item-hd（居中标题+副标题+点线底边，头部即链接）
 *   + scopebar（横滚 tab：16px #696969、1px #ddd 竖分隔、选中 #ff9d00 + 2px 底线）
 *   + item-list（3/4/6 列卡：图 206×170 无圆角 + 城市名图下居中，无 metadata/hover）
 *   + showmore（14px #ff9d00 描边按钮，radius 3px，行高 42px）
 *
 * 面板机制与参考站一致：全部面板常驻 DOM，非当前面板 hidden；
 * 每个面板默认显示 4 个视觉行（按 3/4/6 列断点 = 12/16/24 张），
 * More 原地展开其余（145 张链接全在 SSR DOM）。
 */

export interface MddCardData {
  key: string;
  city: string;
  image: string | null;
  gradient: string;
  href: string;
}

export interface MddPanelData {
  label: string;
  cards: MddCardData[];
  /** More 按钮文案（参考站为「更多目的地/更多主题」）。 */
  moreLabel: string;
}

// 默认展示量 = 4 视觉行 × item-list 实际列数（grid 断点 3/4/6 列）。
// 不写死 slice(0, 6)：低断点少显、高断点多显，全部用响应式 class 控制。
const ROWS = 4;
const CAP_BASE = ROWS * 3; // 12（<640px，3 列）
const CAP_SM = ROWS * 4; // 16（≥640px，4 列）
const CAP_LG = ROWS * 6; // 24（≥1024px，6 列）

/** 未展开时第 ci 张卡的显隐 class（按所在断点的 4 行容量裁剪）。 */
function cardClass(ci: number, expanded: boolean): string | undefined {
  if (expanded) return undefined;
  if (ci >= CAP_LG) return "hidden";
  if (ci >= CAP_SM) return "hidden lg:block"; // 仅 6 列桌面可见
  if (ci >= CAP_BASE) return "hidden sm:block"; // ≥4 列可见
  return undefined;
}

/** More 按钮显隐：某断点下全部卡片已可见 → 该断点不显示 More。 */
function moreClass(count: number): string | undefined {
  if (count <= CAP_BASE) return "hidden";
  if (count <= CAP_SM) return "sm:hidden";
  if (count <= CAP_LG) return "lg:hidden";
  return undefined;
}

/** 无 More 时的底部留白：与 More 的显隐断点互补。 */
function spacerClass(count: number, expanded: boolean): string | undefined {
  if (expanded || count <= CAP_BASE) return undefined;
  if (count <= CAP_SM) return "hidden sm:block";
  if (count <= CAP_LG) return "hidden lg:block";
  return "hidden";
}

function MddCard({ card }: { card: MddCardData }) {
  return (
    <Link href={card.href} className="block">
      <div className="relative aspect-[206/170] w-full overflow-hidden bg-[#f2f2f2]">
        {card.image ? (
          // 卡片缩略图（206×170 槽位）用单 src 的 lazy img：本页 5 个 MddSection 的全部面板
          // （含 hidden）都会 SSR，next/image 的响应式 srcSet 会给 1,300+ 张卡各生成 ~1.8KB
          // 元数据，是 /guides 解码 HTML 的最大单项（~2.4MB）。懒加载行为不变。
          // eslint-disable-next-line @next/next/no-img-element -- 单 src lazy img，理由见上
          <img
            src={card.image}
            alt={card.city}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className={`h-full w-full bg-gradient-to-br ${card.gradient}`}
          />
        )}
      </div>
      <div className="pt-[10px] pb-[25px] text-center text-[15px] leading-none text-[#111]">
        {card.city}
      </div>
    </Link>
  );
}

export default function MddSection({
  id,
  title,
  titleLevel = "h2",
  subtitle,
  headerHref,
  panels,
  defaultPanel = 0,
}: {
  id: string;
  title: string;
  /** 参考站全用 h2；首个区允许用 h1 承担页面语义（视觉完全一致）。 */
  titleLevel?: "h1" | "h2";
  subtitle: string;
  /** 参考站分区头本身是链接；Tripla 用目录锚点承接。 */
  headerHref?: string;
  panels: MddPanelData[];
  defaultPanel?: number;
}) {
  const [active, setActive] = useState(
    Math.min(Math.max(defaultPanel, 0), panels.length - 1),
  );
  const [expanded, setExpanded] = useState(false);
  const Title = titleLevel;
  const current = panels[active];

  return (
    <section id={id} className="border-b border-[#e6e6e6]">
      {/* item-hd：居中标题（+小圆箭头）+ 副标题 + 点线底边 */}
      <div className="border-b border-dashed border-[#ddd] pt-[30px] pb-[25px] text-center">
        {headerHref ? (
          <a href={headerHref} className="inline-block">
            <Title className="text-[20px] leading-none font-normal text-[#111]">
              {title}
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="ml-[10px] inline-block h-[18px] w-[18px] align-middle"
                fill="none"
                stroke="#ff9d00"
                strokeWidth={1.4}
              >
                <circle cx="8" cy="8" r="7" />
                <path d="M6.5 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Title>
          </a>
        ) : (
          <Title className="text-[20px] leading-none font-normal text-[#111]">
            {title}
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="ml-[10px] inline-block h-[18px] w-[18px] align-middle"
              fill="none"
              stroke="#ff9d00"
              strokeWidth={1.4}
            >
              <circle cx="8" cy="8" r="7" />
              <path d="M6.5 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Title>
        )}
        <p className="mt-[9px] text-[14px] leading-none text-[#999]">{subtitle}</p>
      </div>

      {/* scopebar：横滚 tab 行 */}
      <div
        role="tablist"
        aria-label={title}
        className="-mx-[15px] overflow-x-auto pl-[15px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max">
          {panels.map((p, i) => (
            <button
              key={p.label}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel-${i}`}
              onClick={() => {
                setActive(i);
                setExpanded(false);
              }}
              className={`relative shrink-0 px-[20px] pt-[20px] pb-[10px] text-left text-[16px] leading-none transition-colors before:absolute before:right-0 before:bottom-[15px] before:h-[10px] before:w-px before:bg-[#ddd] after:absolute after:bottom-0 after:h-[2px] after:bg-[#ff9d00] first:pl-0 last:before:hidden ${
                i === active
                  ? "text-[#ff9d00] after:left-[20px] after:right-[20px] first:after:left-0"
                  : "text-[#696969] after:left-[20px] after:right-[20px] after:bg-transparent hover:text-[#111] first:after:left-0"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 全部面板常驻 DOM，非当前 hidden（SSR 保留全部目的地链接） */}
      {panels.map((p, i) => (
        <div
          key={p.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
        >
          <ul className="grid grid-cols-3 pt-[20px] sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-[15px]">
            {p.cards.map((card, ci) => (
              <li key={card.key} className={cardClass(ci, expanded)}>
                <MddCard card={card} />
              </li>
            ))}
          </ul>
          {/* showmore：仅当前面板、且该断点下还有未展示卡片时出现 */}
          {i === active && !expanded && (
            <div className={`pt-[5px] pb-[25px] text-center ${moreClass(p.cards.length) ?? ""}`}>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-block rounded-[3px] border border-[#ff9d00] px-[50px] text-[14px] leading-[42px] text-[#ff9d00] transition-colors hover:bg-[#ff9d00] hover:text-white"
              >
                {p.moreLabel}
              </button>
            </div>
          )}
          {i === active && !expanded && spacerClass(p.cards.length, false) !== "hidden" && (
            <div className={`h-[25px] ${spacerClass(p.cards.length, false) ?? ""}`} />
          )}
          {i === active && expanded && <div className="h-[25px]" />}
        </div>
      ))}
      {/* 供 a11y：当前面板计数 */}
      <p className="sr-only" aria-live="polite">
        {current ? `${current.label}: ${current.cards.length} destinations` : ""}
      </p>
    </section>
  );
}

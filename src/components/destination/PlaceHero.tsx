import Image from "next/image";
import type { ReactNode } from "react";
import type { Destination } from "@/data/destinations";

/**
 * PlaceHero — Place Arrival（首屏）。
 *
 * CONTRACT §8 / §13 / §33 / §29：
 *   · Quiet breadcrumb 由页面在外层提供；这里只负责“我到了这个地方”。
 *   · Eyebrow 用 Geist Mono，H1 用 Instrument Serif 400，且 H1 是唯一视觉焦点
 *     （SEO title 与视觉 H1 分离，见 generateMetadata）。
 *   · 图片优先：项目已有 destination imagery 时走 next/image + preload(Next 16；
 *     旧 priority 属性自 Next 16 起已 deprecated) + 精确 sizes + descriptive alt +
 *     object-cover + subtle scrim。
 *   · 无图时**不使用假照片渐变**：改为状态驱动的低对比氛围场 + 12 栏极细竖线 +
 *     accent 底线 —— 做成“地点标题页”，而不是“缺图的卡片”。
 *   · 高度：mobile 15rem / sm 20rem / lg 24rem（紧凑、image-led；不是 60vh）。
 */

/** Eyebrow 在图片 scrim 上需要 on-scrim 颜色，故此处显式给出类名（避免 className 覆盖冲突）。 */
const EYEBROW = "font-mono text-micro uppercase tracking-[0.18em]";

export default function PlaceHero({
  dest,
  children,
}: {
  dest: Destination;
  /** 可选 hero 增强槽（STEP 3：compact NOW 读数），渲染在文字栈内、country 之后 */
  children?: ReactNode;
}) {
  const hasImage = Boolean(dest.image);

  return (
    <header>
      <div
        className={[
          "relative isolate overflow-hidden rounded-ut-lg border border-ut-border",
          "h-[15rem] sm:h-[20rem] lg:h-[24rem]",
          hasImage ? "" : "bg-ut-surface",
        ].join(" ")}
      >
        {hasImage ? (
          <>
            <Image
              src={dest.image as string}
              alt={`${dest.city}, ${dest.country}`}
              fill
              preload
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
            {/* subtle scrim：保证 H1 与 meta 在**任意**照片上都达到 AA。
                实测（像素级采样，见验收报告）：明亮照片（如 Paris）下，若 scrim 在
                文字带仅 ~0.44–0.52，white/70 的 10px eyebrow 最差仅 3.3:1（<4.5）。
                因此把文字带（距底 10%–52%）的 alpha 提升到 ≥0.66：
                纯白照片最坏情形 → H1 6.55:1 / eyebrow(80%) 4.90:1 / country(85%) 5.28:1。 */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,12,16,0.88) 0%, rgba(10,12,16,0.66) 55%, rgba(10,12,16,0.16) 100%)",
              }}
            />
          </>
        ) : (
          <>
            {/* 状态驱动的氛围场：色相来自目的地当地时段 / 季节 / 天气，对比极低 */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.14) 0%, rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.045) 48%, rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0) 100%)",
              }}
            />
            {/* 12 栏空间感：极细竖线，仅 md+ */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden md:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(22,24,29,0.045) 0 1px, transparent 1px 80px)",
              }}
            />
            {/* 底部 accent hairline */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px"
              style={{
                background: "rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.5)",
              }}
            />
          </>
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
          <span className={`${EYEBROW} ${hasImage ? "text-white/80" : "text-ut-subtle"}`}>
            {dest.region}
          </span>
          <h1
            className={[
              "mt-3 font-display text-display-xl leading-[var(--ut-text-display-xl--lh)]",
              hasImage ? "text-white" : "text-ut-ink",
            ].join(" ")}
          >
            {dest.city}
          </h1>
          <p
            className={[
              "mt-2 font-mono text-body-sm",
              hasImage ? "text-white/85" : "text-ut-text-2",
            ].join(" ")}
          >
            {dest.country}
          </p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </header>
  );
}

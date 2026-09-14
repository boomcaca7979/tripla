import type { CSSProperties, ReactNode } from "react";

/**
 * JourneyAtmosphere — Trip 的 "Contained Journey Atmospheric Band"。
 *
 * CONTRACT：
 *   §9  Environment Depth = 2。它只提供**氛围层变量**，不产生天空 / 月亮 /
 *       WebGL / 视频 / 粒子 —— 用户应感到"一段旅程正在展开"，而不是"我进入了 Home"。
 *   §10 状态只改变外观与含义，绝不改变结构、顺序或内容可见性。
 *   §23/§40 全页 CTA 与交互 accent 恒为品牌 terracotta，因此本组件**绝不写
 *       --ut-accent / --ut-accent-rgb**；旅程只拥有自己的私有变量族
 *       --ut-journey-*。
 *   §40 首帧确定性：色调由 trip.slug 的确定性 hash 派生（纯函数），
 *       SSR 与客户端完全一致 → 无需 client component，零 hydration 风险。
 *
 * 变量（供 server 渲染的 band 直接以 var() 消费）：
 *   --ut-journey-rgb   旅程色（低饱和土色系，仅用于 hairline / 装饰节点 / 极低 alpha 渐变）
 *   --ut-journey-glow  氛围强度（0–1）
 */

/**
 * 旅程色板：与品牌 terracotta 同族的低饱和土色。
 * 全部为**装饰用途**（hairline、节点、≤0.16 alpha 的渐变），不承载文本颜色，
 * 因此不构成对比度风险（正文一律使用 --ut-ink / --ut-text）。
 */
const JOURNEY_TINTS = [
  "164, 81, 59", // terracotta（品牌同色）
  "150, 96, 62", // umber
  "126, 94, 74", // clay
  "104, 104, 84", // olive
  "88, 102, 116", // slate
  "112, 86, 104", // plum
] as const;

/** 确定性 hash：同一 slug 永远得到同一色调，SSR/CSR 一致。 */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function JourneyAtmosphere({
  journeyId,
  children,
}: {
  journeyId: string;
  children: ReactNode;
}) {
  const tint = JOURNEY_TINTS[hashSlug(journeyId) % JOURNEY_TINTS.length];
  const vars = {
    "--ut-journey-rgb": tint,
    "--ut-journey-glow": "0.16",
  } as CSSProperties;

  return (
    <div style={vars} data-ut-journey="">
      {children}
    </div>
  );
}

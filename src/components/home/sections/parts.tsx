import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import type { Postcard } from "@/lib/home-sections";

/**
 * home/sections/parts — 首页四段共用的表现层零件（无 directive，server / client 皆可用）。
 *
 * 目的：四段必须有**明显不同的视觉场景**，但属于同一套 Tripla 视觉语言。
 * 统一的东西全部收在这里，而不是每段各写一遍：
 *   · SectionHead  —— 编号 + 段名（mono eyebrow）+ 主题短句（display），四段同一版式。
 *   · PhotoLayer   —— 真实照片层（next/image fill）+ 深色渐变遮罩 + 来源署名。
 *                    遮罩用 envDeep（恒为深色），因此照片上永远是浅墨文字，不赌照片亮度。
 *   · ReadoutRow   —— 仪器读数行（mono label + 值 + 可选注释），hairline 分隔。
 *
 * 照片上的文字一律使用深色遮罩保证对比度；读数一律来自真实数据（调用方传入）。
 */

/** 深色遮罩（envDeep 恒为深色基底；SSR 期用同一兜底值，避免首帧闪白）。 */
export const SCRIM_BOTTOM =
  "linear-gradient(180deg, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.62) 0%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.18) 38%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.9) 100%)";

/**
 * 读数带遮罩：底部压得更重（48% 处 0.5、64% 处 0.88、底部 0.97），
 * 用于"城市名 + 多行读数压在照片下缘"的并置图 —— 无论照片多亮都满足对比度。
 */
export const SCRIM_READOUT =
  "linear-gradient(180deg, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.5) 0%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.14) 30%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.5) 48%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.88) 64%, rgba(var(--ut-env-deep-rgb, 12, 14, 20), 0.97) 100%)";

/** 仪器面板：Ephemera 式的独立深色表面（与 hero 乐器面板同一材质）。 */
export const PANEL_CLASS = "ut-inst-panel rounded-ut-lg";

/** 段落标题组：编号 + 段名（eyebrow）+ 主题短句（display 级）。 */
export function SectionHead({
  index,
  name,
  title,
  className = "",
}: {
  index: string;
  name: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow dot>
        {index} · {name}
      </Eyebrow>
      <h2 className="ut-t-section mt-3 max-w-[22ch] text-ut-ink">
        {title}
      </h2>
    </div>
  );
}

/** 照片层：真实照片 + 统一深色遮罩 + 来源署名（署名位置可让给压在照片上的 UI）。 */
export function PhotoLayer({
  card,
  sizes,
  scrim = SCRIM_BOTTOM,
  priority = false,
  creditClassName = "bottom-2.5 right-3",
}: {
  card: Postcard;
  sizes: string;
  scrim?: string;
  priority?: boolean;
  creditClassName?: string;
}) {
  return (
    <>
      <Image
        src={card.src}
        alt={card.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: scrim }} />
      <span
        className={`ut-t-micro pointer-events-none absolute text-white/45 ${creditClassName}`}
      >
        Photo · {card.source}
      </span>
    </>
  );
}

/** 仪器读数行：mono label + 值（可带一行注释），hairline 分隔，非卡片。 */
export function ReadoutRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 border-t py-2.5"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.18)" }}
    >
      <span className="ut-t-micro shrink-0 text-ut-subtle">
        {label}
      </span>
      <span className="min-w-0 text-right">
        <span className="ut-t-data block text-ut-ink">
          {value}
        </span>
        {hint ? <span className="ut-t-micro mt-1.5 block text-ut-subtle">{hint}</span> : null}
      </span>
    </div>
  );
}

/** 段末的次级链接（同一版式，四段共用）。 */
export function QuietLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="ut-t-control inline-flex min-h-[44px] items-center gap-1.5 text-ut-accent underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
    >
      {children}
    </Link>
  );
}

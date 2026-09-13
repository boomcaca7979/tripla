import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

interface EditorialHeroProps {
  /** 装饰性 eyebrow（分类 / 城市）— 仅 micro 标签，不承载关键信息 */
  eyebrow?: string;
  /** H1 主标题（display 衬线） */
  title: string;
  /** 可选的作者 / 日期 meta 块 */
  meta?: ReactNode;
  /** 可选标签（subtle 胶囊） */
  tags?: string[];
}

/**
 * EditorialHero — 内页编辑式 hero（FINAL CONTRACT: H1 = Instrument Serif display，
 * 禁止 font-extrabold / 禁止 raw text-5xl/6xl / 禁止 uppercase 标题）。
 * 没有全屏天空 / envDeep（内页 Environment Depth ≤ 2），仅纸面 + 状态色进度条。
 */
export default function EditorialHero({
  eyebrow,
  title,
  meta,
  tags,
}: EditorialHeroProps) {
  return (
    <header className="mb-12">
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h1 className="font-display text-display-lg text-ut-ink leading-[var(--ut-text-display-lg--lh)]">
        {title}
      </h1>
      {meta && <div className="mt-6">{meta}</div>}
      {tags && tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-ut-pill border border-ut-border px-3 py-1 text-body-sm text-ut-muted"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

import type { ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

interface InnerSectionProps {
  id?: string;
  /** 装饰性 eyebrow（分组标注） */
  eyebrow?: string;
  /** H2 小节标题（display 衬线） */
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * InnerSection — 内页统一小节容器（FINAL CONTRACT: H2 = Instrument Serif，禁止 uppercase）。
 * 内容→表面映射由具体子组件决定（段落 / 表格 / 时间线 / <details> 等）。
 */
export default function InnerSection({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: InnerSectionProps) {
  return (
    <section id={id} className={`mb-12 ${className}`}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-h2 text-ut-ink leading-[var(--ut-text-h2--lh)]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

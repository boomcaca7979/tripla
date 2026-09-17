import type { QuickFact } from "@/lib/guide-detail";

/**
 * GuideQuickFacts — Hero 之后的决策条（destination / duration / timing / style / budget）。
 *
 * · 只渲染 `guideQuickFacts()` 真正产出的项（缺数据即不出现），最多 5 项；
 * · 不是 dashboard：单行 hairline 分组，无图表、无进度条、无图标阵列；
 * · 移动端自动换行，不产生横向滚动。
 */
export default function GuideQuickFacts({ facts }: { facts: QuickFact[] }) {
  if (facts.length === 0) return null;

  return (
    <section
      aria-label="Guide at a glance"
      className="mb-12 border-y border-ut-border py-5"
    >
      <dl className="flex flex-wrap gap-x-10 gap-y-5">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
              {f.label}
            </dt>
            <dd className="mt-1 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

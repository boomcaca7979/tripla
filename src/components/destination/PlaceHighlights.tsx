/**
 * PlaceHighlights — Highlights as Editorial Place Objects.
 *
 * CONTRACT §16：Highlights 必须从 Card Wall 改成 Editorial Place Objects。
 * 这里用**非对称**的编辑式结构：
 *   · 第 01 条 → 大型 feature object（serif h2，刻意窄栏促成长短句节奏）
 *   · 其余条目 → 编号编辑式行（mono 序号 + serif 标题 + 细横线分隔）
 * 无卡片、无边框盒、无阴影、无 3×3 栅格。
 *
 * 语义：highlights 是 "Top highlights" H2 之下的**具名地点对象**，因此每一条使用
 * <h3>（与 Guide 的 Timeline 站点名同一约定）；索引行（指南/行程/相关目的地）
 * 则保持为链接文本、不使用标题标签。
 *
 * 可读性：序号是列表顺序的信息载体，使用 --ut-muted（暖面 5.30:1）而非
 * decoration-only 的 --ut-subtle；feature 序号使用 --ut-accent-strong（6.44:1）。
 */
export default function PlaceHighlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const [feature, ...rest] = items;

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
      {/* 01 — feature place object */}
      <div className="lg:col-span-7">
        <p className="font-mono text-label tracking-[0.18em] text-ut-accent-strong tabular-nums">
          01
        </p>
        <h3 className="mt-4 max-w-[20ch] font-display text-h2 leading-[var(--ut-text-h2--lh)] text-ut-ink">
          {feature}
        </h3>
      </div>

      {/* 02… — numbered editorial rows */}
      {rest.length > 0 && (
        <ol className="divide-y divide-ut-border lg:col-span-5">
          {rest.map((item, i) => (
            <li key={item} className="flex gap-5 py-4 first:pt-0 last:pb-0">
              <span className="mt-1 font-mono text-label tracking-[0.18em] text-ut-muted tabular-nums">
                {String(i + 2).padStart(2, "0")}
              </span>
              <h3 className="font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-text">
                {item}
              </h3>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

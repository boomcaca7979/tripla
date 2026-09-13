interface PracticalBlock {
  heading: string;
  items: string[];
}

/**
 * PracticalInfo — 实用规划信息网格（FINAL CONTRACT: 实用信息 → 紧凑面板 / 定义列表，
 * 非卡片墙）。块标题用 mono micro 标签（分组标注，非 H2/H3 章节标题，故允许 uppercase）。
 * 列表项用 accent 圆点标记。
 */
export default function PracticalInfo({ blocks }: { blocks: PracticalBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="rounded-ut-md border border-ut-border bg-ut-surface p-5"
        >
          <h3 className="font-mono text-label uppercase tracking-[0.16em] text-ut-subtle">
            {block.heading}
          </h3>
          <ul className="mt-3 space-y-2 text-body-sm text-ut-text-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-ut-pill bg-ut-accent"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

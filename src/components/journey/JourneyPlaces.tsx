import type { TripRestaurant } from "@/data/trips";

/**
 * JourneyPlaces — "Where to eat" 编辑式行（不是三列卡片）。
 *
 * CONTRACT §16 / §20：
 *   餐厅是旅程沿途的**具名地点对象**，不是卡片墙。这里用 hairline 分隔的
 *   编辑式行：emoji（次级）+ 名称（Instrument Serif H3）+ 菜系/价位（Geist Mono）。
 *   无边框盒、无阴影、无 3 列栅格 → 避免 Card Contract 的"≤3 连续卡片"问题，
 *   同时让美食信息读起来像旅程中的停靠点，而不是商品列表。
 *
 * 语义：每条餐厅是 "Where to eat in …" H2 之下的具名对象 → 使用 <h3>。
 * 数据：全部来自 trip.restaurants[].{name,cuisine,emoji}。
 */
export default function JourneyPlaces({
  items,
}: {
  items: TripRestaurant[];
}) {
  if (items.length === 0) return null;

  return (
    <ol className="divide-y divide-ut-border">
      {items.map((r) => (
        <li key={r.name} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="shrink-0 text-body-lg leading-none opacity-80"
            >
              {r.emoji}
            </span>
            <h3 className="min-w-0 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
              {r.name}
            </h3>
          </div>
          <p className="mt-1 font-mono text-label tracking-wide text-ut-muted">
            {r.cuisine}
          </p>
        </li>
      ))}
    </ol>
  );
}

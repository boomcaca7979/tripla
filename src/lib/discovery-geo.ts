/**
 * discovery-geo — Discovery 层的**中性派生工具**（纯函数，Server Component 安全）。
 *
 * 这里只放**与内容栏目无关**的通用派生：
 *   · 城市 → destination 的真实图片 / region（精确同名匹配，不猜、不造）；
 *   · 天数 → 分桶（1–3 / 4–7 / 8+）。
 *
 * 来源说明：这些函数原先寄居在 `lib/guides-hub.ts`（Guides 栏目的派生数据层），
 * Guides 栏目整体下线后迁移至此。**导出名与实现 1:1 保留**，唯一变化是所在模块
 * 与 Guides 解耦 —— 因此 `trips-hub`（及任何其它调用方）行为完全不变。
 */

import { DESTINATIONS } from "@/data/destinations";

export type DaysBucket = "1-3" | "4-7" | "8+";

export const DAYS_BUCKETS: ReadonlyArray<{ key: DaysBucket; label: string; min: number; max: number }> = [
  { key: "1-3", label: "1–3 days", min: 1, max: 3 },
  { key: "4-7", label: "4–7 days", min: 4, max: 7 },
  { key: "8+", label: "8+ days", min: 8, max: 999 },
];

// ── city → destination 索引（真实数据派生，不复制） ──────────────────────

const destinationByCity = new Map(DESTINATIONS.map((d) => [d.city.toLowerCase(), d]));

/** city → destination 真实图片（无对应 destination / 无图返回 null）。 */
export function destinationImageForCity(city: string): string | null {
  return destinationByCity.get(city.toLowerCase())?.image ?? null;
}

/** city → destination region；未匹配返回 "Global & other"。 */
export function regionForCity(city: string): string {
  return destinationByCity.get(city.toLowerCase())?.region ?? "Global & other";
}

/** 真实天数 → 分桶（超出 8 上界仍归 "8+"，与迁移前行为一致）。 */
export function daysBucketOf(days: number): DaysBucket {
  const bucket = DAYS_BUCKETS.find((b) => days >= b.min && days <= b.max);
  return bucket?.key ?? "8+";
}

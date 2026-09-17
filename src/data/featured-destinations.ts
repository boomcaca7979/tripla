/**
 * featured-destinations — 站点**既有的编辑精选目的地**（唯一真相源）。
 *
 * 用途（两个消费方，同一份名单）：
 *   1. 首页 / 发现层的默认编辑排序（精选城市排前）；
 *   2. /destinations 地球上"重要目的地"的判定 —— 精选城市显示常驻城市标签、
 *      节点也略大一级（major / secondary 两档）。
 *
 * 为什么用它而不是新造"重要性评分"：这是项目里**已经存在**的站点编辑排名
 * （首页多年来以此排序），属于"当前站点数据排名"，不需要也不应该临时编造指标。
 * 未在此名单中的目的地**不删除**，只是视觉层级低一级（节点更小、标签按需显示）。
 */

// 注：原首页排序里还有一个 "marrakech"，但 destinations 数据集中并不存在该 slug，
// 这里已移除（原实现靠 .filter(Boolean) 静默跳过，行为不变）。
export const FEATURED_DESTINATION_SLUGS = [
  "tokyo", "kyoto", "paris", "lisbon", "rome", "barcelona", "seoul",
  "bangkok", "singapore", "bali", "newyork", "copenhagen",
  "hanoi", "florence", "mexico-city",
] as const;

export const FEATURED_DESTINATIONS: ReadonlySet<string> = new Set(FEATURED_DESTINATION_SLUGS);

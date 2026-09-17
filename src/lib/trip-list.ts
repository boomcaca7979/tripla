/**
 * trip-list — My Trip 清单的统一数据结构与 localStorage 持久化。
 *
 * · 一个 Destination 城市页 = 一个清单（key: utripla-trip-<slug>）。
 * · 景点 / 酒店 / 美食统一进入同一个 collection（type 区分）。
 * · 只保存用户显式添加的真实条目（绝不自动添加）。
 * · 价格诚信：只有拿到真实价格才写入 price 字段并参与 Estimated total；
 *   无真实价格的条目（当前酒店/景点/美食均无）一律不带 price，
 *   UI 显示 "Price unavailable"，绝不进入预算合计。
 */

export type TripItemType = "attraction" | "hotel" | "food" | "experience" | "flight";

/** 真实价格（仅在有真实来源时写入；绝不允许估算值冒充）。 */
export interface TripItemPrice {
  amount: number;
  currency: string;
}

export interface TripItem {
  /** 稳定 id：`${type}:${name}`（同城市内唯一）。 */
  id: string;
  type: TripItemType;
  /** 展示名（景点用真实地点名；酒店为 Wink 返回的真实住宿名；美食为真实餐厅名）。 */
  name: string;
  /** 隶属城市（跨页兜底）。 */
  city: string;
  /** 真实联盟深链（provider 深链；无则不保存该字段）。 */
  affiliateUrl?: string;
  /** 真实单价；无真实来源时缺省 → "Price unavailable"，不计入 total。 */
  price?: TripItemPrice;
}

export interface TripListState {
  items: TripItem[];
  /** 旅行天数（My Trip 内可调，默认取城市 recommendedDays）。 */
  days: number;
}

const STORAGE_PREFIX = "utripla-trip-";

export function tripStorageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

/** 读取某城市的清单（SSR/无 localStorage 时返回 null，由调用方给默认值）。 */
export function loadTripList(slug: string): TripListState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(tripStorageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TripListState;
    if (!Array.isArray(parsed.items) || typeof parsed.days !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTripList(slug: string, state: TripListState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(tripStorageKey(slug), JSON.stringify(state));
  } catch {
    // 隐私模式 / 配额满 —— 静默降级为会话内状态
  }
}

export function makeTripItemId(type: TripItemType, name: string): string {
  return `${type}:${name.toLowerCase().trim()}`;
}

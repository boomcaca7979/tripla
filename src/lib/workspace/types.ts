/**
 * workspace/types — 统一数据层的「模式」定义与 Supabase 行类型。
 *
 * 本层把 WorkspaceState（组件层的内存形状）与 public schema 的 13 张表
 * 一一对应。**行类型是与数据库的契约**：字段名、可空性、标量类型都按
 * `supabase/migrations/0001_initial_workspace.sql` 逐列抄写。任何一侧改动
 * 都必须同步另一侧，否则 PostgREST 会以 42703（列不存在）/ 23502（非空违例）
 * 拒绝写入 —— 而错误信息不会告诉你是映射层漏了一列。
 *
 * 两条互不相通的通道（见 index.ts）：
 *   guest   → localStorage，唯一 source of truth 是浏览器
 *   remote  → Supabase，唯一 source of truth 是数据库（RLS 以 auth.uid() 为边界）
 *
 * 两者之间**没有任何自动搬运**：匿名期间积累的数据不会因为登录而被上传。
 */

import type {
  ChecklistItem,
  InboxItem,
  Place,
  RouteStop,
  SavedItem,
  Trip,
  TripStatus,
  WorkspaceState,
} from "@/components/trips/workspace/types";
import type { Transaction } from "@/components/trips/workspace/expenses/types";

/** 当前工作区归属：匿名访客，或某个已登录用户。 */
export type WorkspaceMode =
  | { kind: "guest" }
  | { kind: "remote"; userId: string };

/** 13 张工作区表（写入与读取顺序分别由 remote.ts 定义，不依赖此数组顺序）。 */
export const WORKSPACE_TABLES = [
  "trips",
  "places",
  "stays",
  "itinerary_days",
  "itinerary_stops",
  "expenses",
  "trip_people",
  "checklist_items",
  "saved_items",
  "saved_item_trips",
  "inbox_items",
  "activity",
  "merchant_rules",
] as const;

export type WorkspaceTable = (typeof WORKSPACE_TABLES)[number];

/** 空工作区（与 seed.ts 的 seedWorkspace 同形；lib 保留一份以免反向依赖组件）。 */
export function emptyWorkspace(): WorkspaceState {
  return {
    trips: [],
    saved: [],
    inbox: [],
    activity: [],
    transactions: [],
    merchantRules: {},
  };
}

// ── 行类型（逐列对应 migration） ────────────────────────────────────────

export interface TripRow {
  id: string;
  user_id: string;
  destination: string;
  name: string | null;
  destination_id: string | null;
  destination_slug: string | null;
  destination_image: string | null;
  country: string | null;
  status: TripStatus;
  start_date: string | null;
  end_date: string | null;
  currency: string;
  flight: Trip["flight"] | null;
  budget_planned: number;
  flight_booked: boolean;
  /**
   * 数据库拥有（default now() + touch 触发器）。只读：仅用于读取排序，
   * 写入前由 remote.ts 的 writePayload 剥离，绝不回写。
   */
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PlaceRow {
  id: string;
  user_id: string;
  trip_id: string;
  name: string;
  kind: Place["kind"];
  area: string | null;
  note: string | null;
  status: Place["status"];
  from_saved: boolean;
}

export interface StayRow {
  id: string;
  user_id: string;
  trip_id: string;
  name: string;
  price_per_night: number;
  rating: number | null;
  distance_km: number | null;
  breakfast: boolean | null;
  free_cancellation: boolean | null;
  preferred: boolean;
  booked: boolean;
  nights: number | null;
  area: string | null;
  notes: string | null;
}

export interface ItineraryDayRow {
  id: string;
  user_id: string;
  trip_id: string;
  title: string;
  distance_km: number;
  transit_min: number;
  day_index: number;
}

export interface ItineraryStopRow {
  id: string;
  user_id: string;
  trip_id: string;
  day_id: string;
  name: string;
  time: string | null;
  note: string | null;
  area: string | null;
  place_id: string | null;
  kind: RouteStop["kind"] | null;
  stop_index: number;
}

export interface ExpenseRow {
  id: string;
  user_id: string;
  trip_id: string | null;
  source: Transaction["source"];
  source_transaction_id: string | null;
  merchant: string;
  raw_merchant: string | null;
  occurred_at: string | null;
  original_amount: number | null;
  original_currency: string;
  converted_amount: number | null;
  converted_currency: string | null;
  conversion_rate: number | null;
  category: string | null;
  subcategory: string | null;
  category_confidence: number | null;
  trip_confidence: number | null;
  status: Transaction["status"];
  paid_by: string | null;
  split_between: string[];
  split_mode: Transaction["splitMode"] | null;
  split_shares: Record<string, number> | null;
  note: string | null;
  receipt_url: string | null;
  receipt_id: string | null;
  payment_method: Transaction["paymentMethod"] | null;
  /** 写入时提供（Transaction.createdAt）；`updated_at` 由数据库触发器拥有，只读。 */
  created_at: string | null;
  updated_at?: string | null;
}

export interface TripPersonRow {
  id: string;
  user_id: string;
  trip_id: string;
  name: string;
  /** 数据库拥有，只读（排序用）。 */
  created_at?: string | null;
}

export interface ChecklistItemRow {
  id: string;
  user_id: string;
  trip_id: string;
  label: string;
  phase: ChecklistItem["phase"];
  done: boolean;
  /** 数据库拥有，只读（排序用）。 */
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SavedItemRow {
  id: string;
  user_id: string;
  kind: SavedItem["kind"];
  title: string;
  meta: string | null;
  saved_at: string | null;
  source: string | null;
  source_url: string | null;
  /** 数据库拥有，只读（排序用）。 */
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SavedItemTripRow {
  saved_item_id: string;
  trip_id: string;
  user_id: string;
}

export interface InboxItemRow {
  id: string;
  user_id: string;
  kind: InboxItem["kind"];
  title: string;
  meta: string | null;
  saved_at: string | null;
  source: string | null;
  source_url: string | null;
}

export interface ActivityRow {
  id: string;
  user_id: string;
  text: string;
  at: string;
}

export interface MerchantRuleRow {
  user_id: string;
  merchant_key: string;
  category: string;
  subcategory: string | null;
}

/**
 * 工作区摊平后的 13 组行。flatten 与 assemble 都以它为准，
 * 因此 diff 只需要逐组比较，不必理解 WorkspaceState 的嵌套关系。
 */
export interface FlatWorkspace {
  trips: TripRow[];
  places: PlaceRow[];
  stays: StayRow[];
  itinerary_days: ItineraryDayRow[];
  itinerary_stops: ItineraryStopRow[];
  trip_people: TripPersonRow[];
  checklist_items: ChecklistItemRow[];
  expenses: ExpenseRow[];
  saved_items: SavedItemRow[];
  saved_item_trips: SavedItemTripRow[];
  inbox_items: InboxItemRow[];
  activity: ActivityRow[];
  merchant_rules: MerchantRuleRow[];
}

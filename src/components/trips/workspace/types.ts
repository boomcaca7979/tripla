/**
 * trips workspace — Personal Travel Workspace 的数据类型。
 *
 * 定位（与旧 /trips Hub 的区别）：旧 Hub 是"站点提供的预制 Trip 内容列表"，
 * 这套类型描述的是"用户自己的旅行准备过程"——
 * Discover → Save → Compare → Organize → Plan → Travel → Track 的承载结构。
 *
 * 本阶段为前端产品骨架：全部状态走 local state（useReducer）+ localStorage 持久化，
 * 不要求真实后端 / 登录 / 多人协作。
 */

import type { MerchantRule, Transaction } from "./expenses/types";

export type PlaceStatus = "want" | "must" | "done" | "skipped";
export type PlaceKind = "sight" | "food" | "activity" | "nature" | "shopping";

export interface Place {
  /** 来源为 Saved / 外部页收藏（显示 Saved 徽标） */
  fromSaved?: boolean;
  id: string;
  name: string;
  kind: PlaceKind;
  /** 城市内区域（如 Asakusa / Shibuya），让地点像真实内容对象 */
  area?: string;
  /** 用户备注（可选） */
  note?: string;
  status: PlaceStatus;
}

export interface Hotel {
  id: string;
  name: string;
  /** 每晚价格（trip.currency 计价，mock 数据） */
  pricePerNight: number;
  rating?: number;
  /** 距市中心 / 关键区域，mock */
  distanceKm?: number;
  breakfast?: boolean;
  freeCancellation?: boolean;
  preferred?: boolean;
  booked?: boolean;
  /** 入住晚数（参与 committed 计算） */
  nights?: number;
  /** 酒店所在区域（如 Shinjuku） */
  area?: string;
  /** 用户备注 */
  notes?: string;
}

/** 酒店三阶段：默认 considering；preferred 可多选；booked 互斥（唯一主住宿） */
/** 用户手动录入的航班（本阶段无 Flight API，蓝图 #34） */
export interface FlightInfo {
  airline: string;
  flightNumber: string;
  departAirport: string;
  arriveAirport: string;
  /** ISO "YYYY-MM-DD" */
  date: string;
  /** "09:00" 起飞时刻（可选） */
  time?: string;
}

export type HotelStatus = "considering" | "preferred" | "booked";

export interface RouteStop {
  id: string;
  /** 自定义名称；引用 Place 时以 place.name 为准（联动） */
  name: string;
  /** "09:00" 24h 制，mock 排程 */
  time: string;
  note?: string;
  area?: string;
  /** 引用 Trip.places 的同一对象（Add to itinerary 联动） */
  placeId?: string;
  /** 条目类型（Itinerary Add 菜单；place 类型由 placeId 隐含） */
  kind?: "activity" | "meal" | "custom";
}

export interface RouteDay {
  id: string;
  /** "Day 1 · Old Tokyo" */
  title: string;
  stops: RouteStop[];
  distanceKm: number;
  transitMin: number;
}

/**
 * 消费分类（本轮 Expenses 升级扩展到 10 类）。
 * 保持简单：一级固定 10 类，二级由 expenses/engine.ts 的 SUBCATEGORY_OPTIONS 提供。
 */
export type ExpenseCategory =
  | "food"
  | "transport"
  | "stay"
  | "tickets"
  | "activities"
  | "shopping"
  | "entertainment"
  | "health"
  | "fees"
  | "other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  /** 支付人 = travelers[].id */
  paidBy: string;
  /** 分摊人 = travelers[].id 子集（创建时用户勾选） */
  splitBetween: string[];
  /** 消费日期，ISO "YYYY-MM-DD"（可选） */
  date?: string;
  /** 备注 */
  note?: string;
}

export interface Traveler {
  id: string;
  name: string;
}

export type ChecklistPhase = "before" | "during" | "after";

export interface ChecklistItem {
  id: string;
  label: string;
  phase: ChecklistPhase;
  done: boolean;
}

export type TripStatus = "current" | "upcoming" | "past";

export interface Trip {
  id: string;
  destination: string;
  /** 用户可选的 Trip 名称（如 "Golden Week"），可选 */
  name?: string;
  /** 正式关联：UTRIPLA DESTINATIONS 的 slug（id 同值）。自由文本创建时为空。 */
  destinationId?: string;
  /** 正式关联：URL slug（= destinationId，冗余存储便于直接深链）。 */
  destinationSlug?: string;
  /** Destination 识别图快照（小图，非 Hero）。 */
  destinationImage?: string | null;
  country: string;
  status: TripStatus;
  /** ISO "YYYY-MM-DD"，确定性格式化（规避 hydration 时区漂移） */
  startDate: string;
  endDate: string;
  /** 计价符号："¥" / "€" / "$"（创建/编辑时用户选择） */
  currency: string;
  /** 用户录入的航班（无 API，手动登记；Itinerary Day 1 显示） */
  flight?: FlightInfo;
  /** Planned：计划预算 */
  budgetPlanned: number;
  flightBooked: boolean;
  travelers: Traveler[];
  places: Place[];
  hotels: Hotel[];
  routeDays: RouteDay[];
  expenses: Expense[];
  checklist: ChecklistItem[];
}

export type InboxKind = "place" | "hotel" | "activity" | "guide";

/**
 * Saved —— 用户自己的收藏库（独立存储，非 Trip 数据投影）。
 * 语义：Saved = "我喜欢，以后可能用"；加入 Trip 后仍保留在 Saved。
 */
export interface SavedItem {
  id: string;
  kind: InboxKind;
  title: string;
  /** 一行元信息（区域/城市/来源），可选 */
  meta?: string;
  /** ISO "YYYY-MM-DD" */
  savedAt: string;
  /** 来源（"Destination · Tokyo" / "Guide · ..." / "Manual"） */
  source?: string;
  /** 来源页 URL（站内路径） */
  sourceUrl?: string;
  /** 已加入哪些 Trip（保留 Saved 语义：加入 Trip 不删除收藏） */
  tripIds?: string[];
}

/** Travel Inbox —— 用户"还没整理"的旅行灵感（跨 Trip，挂在 My Trips 层级） */
export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  /** 一行元信息，如 "Asakusa · Tokyo" */
  meta: string;
  /** ISO "YYYY-MM-DD" */
  savedAt: string;
  /** 来源（"Destination · Tokyo" / "Manual"） */
  source?: string;
  /** 来源页 URL（站内路径） */
  sourceUrl?: string;
}

export interface WorkspaceState {
  trips: Trip[];
  /** 用户收藏库（独立于 Trip；Add to Trip 后仍保留） */
  saved: SavedItem[];
  inbox: InboxItem[];
  /** Recent activity —— 用户后台的操作流水（新增地/酒店/支出/停靠点等） */
  activity: ActivityItem[];
  /**
   * 交易账本（本轮 Expenses 升级的核心存储）：
   * 所有真实消费（manual / csv / xlsx / receipt）统一在这里，
   * trip.expenses 是 v5 之前的旧存储，migration 时迁入 transactions 并清空。
   */
  transactions: Transaction[];
  /** 用户纠正分类后学到的 merchant 规则（key = normalized merchant） */
  merchantRules: Record<string, MerchantRule>;
}

/** 一条操作流水（text 在写入时即格式化，避免渲染期 Date 计算 → 无 hydration 漂移） */
export interface ActivityItem {
  id: string;
  text: string;
  /** 写入时刻的可读标签，如 "Sep 20, 16:02" */
  at: string;
}

// ── Reducer 动作 ──────────────────────────────────────────────────────

export type WorkspaceAction =
  | { type: "CREATE_TRIP"; id?: string; destination: string; startDate: string; endDate: string; travelers: number; name?: string; currency?: string; destinationId?: string }
  | { type: "DELETE_TRIP"; tripId: string }
  | { type: "LOAD_DEMO" }
  | { type: "SET_FLIGHT"; tripId: string; flight?: FlightInfo }
  | { type: "EDIT_TRIP"; tripId: string; destination?: string; startDate?: string; endDate?: string; name?: string; currency?: string; destinationId?: string }
  | { type: "RESTORE_STATE"; state: WorkspaceState }
  | { type: "ADD_PLACE"; tripId: string; name: string; kind: PlaceKind; area?: string; note?: string }
  | { type: "EDIT_PLACE"; tripId: string; placeId: string; name: string; kind: PlaceKind; area?: string; note?: string; status: PlaceStatus }
  | { type: "SET_PLACE_STATUS"; tripId: string; placeId: string; status: PlaceStatus }
  | { type: "SET_PLACE_NOTE"; tripId: string; placeId: string; note?: string }
  | { type: "REMOVE_PLACE"; tripId: string; placeId: string }
  | { type: "ADD_HOTEL"; tripId: string; name: string; pricePerNight: number; area?: string; rating?: number; notes?: string; nights?: number }
  | { type: "REMOVE_HOTEL"; tripId: string; hotelId: string }
  | { type: "SET_HOTEL_FLAG"; tripId: string; hotelId: string; flag: "preferred" | "booked"; value: boolean; nights?: number }
  /** inline 编辑酒店字段（Workspace-driven 重构）：局部 patch，保留其余字段 */
  | { type: "PATCH_HOTEL"; tripId: string; hotelId: string; patch: Partial<Pick<Hotel, "name" | "area" | "pricePerNight" | "nights" | "rating" | "breakfast" | "freeCancellation" | "notes">> }
  | { type: "ADD_STOP"; tripId: string; dayId: string; name: string; time: string; note?: string; placeId?: string; kind?: "activity" | "meal" | "custom" }
  | { type: "REMOVE_ROUTE_DAY"; tripId: string; dayId: string }
  | { type: "ADD_PLACE_TO_ITINERARY"; tripId: string; placeId: string; time?: string }
  | { type: "REMOVE_STOP"; tripId: string; dayId: string; stopId: string }
  | { type: "MOVE_STOP"; tripId: string; dayId: string; from: number; to: number }
  | { type: "SET_STOP_TIME"; tripId: string; dayId: string; stopId: string; time: string }
  /** inline 编辑 stop（Workspace-driven 重构）：自定义条目改名/备注 */
  | { type: "PATCH_STOP"; tripId: string; dayId: string; stopId: string; patch: Partial<Pick<RouteStop, "name" | "note">> }
  | {
      type: "ADD_ROUTE_DAY";
      tripId: string;
      title?: string;
      /** 空态捕获：建 Day 的同时挂第一条 stop（Capture first） */
      firstStop?: { name: string; time: string; kind?: "activity" | "meal" | "custom"; placeId?: string; note?: string };
    }
  | { type: "ADD_EXPENSE"; tripId: string; expense: Omit<Expense, "id"> }
  | { type: "ADD_SAVED"; item: Omit<SavedItem, "id"> }
  /**
   * 外部页（Destinations / Guides）的「Save + Add to Trip」原子写入意图。
   *
   * 与 SAVED_ADD_TO_TRIP 的区别：这条收藏**可能尚不存在**——本动作先按
   * (kind, lower(title)) 幂等 upsert 到 Saved，再挂到 Trip 上，避免调用方
   * "先 ADD_SAVED，再回头按标题猜 id" 的脆弱两步流程。
   *
   * kind 使用 SavedItem 的合法词表（place / hotel / activity / guide），与
   * saved_items.kind 的 CHECK 约束一致；外部页的 "restaurant" 由调用方在边界
   * 归一为 kind="place" + placeKind="food"。
   */
  | {
      type: "SAVE_AND_ADD_TO_TRIP";
      tripId: string;
      kind: InboxKind;
      title: string;
      meta?: string;
      /** 写入时刻（由调用方提供，保持 reducer 纯函数可测） */
      savedAt: string;
      source: string;
      sourceUrl?: string;
      /** Trip 内 Place 的分类；缺省 sight */
      placeKind?: PlaceKind;
    }
  | { type: "REMOVE_SAVED"; itemId: string }
  | { type: "SAVED_ADD_TO_TRIP"; itemId: string; tripId: string }
  | { type: "ADD_INBOX_ITEM"; item: Omit<InboxItem, "id"> }
  | { type: "REMOVE_EXPENSE"; tripId: string; expenseId: string }
  | { type: "SET_BUDGET"; tripId: string; amount: number }
  | { type: "ADD_TRAVELER"; tripId: string; name: string }
  | { type: "REMOVE_TRAVELER"; tripId: string; travelerId: string }
  | { type: "TOGGLE_CHECKLIST"; tripId: string; itemId: string }
  | { type: "ADD_CHECKLIST"; tripId: string; label: string; phase: ChecklistPhase }
  | { type: "REMOVE_CHECKLIST"; tripId: string; itemId: string }
  | { type: "INBOX_ADD_TO_TRIP"; itemId: string; tripId: string }
  | { type: "INBOX_ADD_TO_ROUTE"; itemId: string; tripId: string }
  | { type: "INBOX_SAVE"; itemId: string }
  | { type: "INBOX_IGNORE"; itemId: string }
  // ── Expenses / Transaction（本轮升级） ──
  | { type: "ADD_TXN"; txn: Transaction }
  /** 批量导入：全部进入 needs_review；txns 已由引擎去重 + 建议 */
  | { type: "IMPORT_TXNS"; txns: Transaction[]; label: string }
  | { type: "CONFIRM_TXNS"; ids: string[] }
  /** 忽略（imported 记录保留原始数据，仅改状态） */
  | { type: "IGNORE_TXNS"; ids: string[] }
  /** 编辑交易；learn=true 时记录 merchant rule（用户纠正分类） */
  | { type: "UPDATE_TXN"; id: string; patch: Partial<Transaction>; learn?: boolean }
  /** 删除：manual → 物理删除；imported source → status=ignored（不丢原始记录） */
  | { type: "DELETE_TXN"; id: string }
  | { type: "RESET" };

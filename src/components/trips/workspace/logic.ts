/**
 * trips workspace — 状态逻辑层。
 *
 * 包含三部分：
 *  1. 确定性格式化（日期 / 金额），规避 SSR/CSR 漂移；
 *  2. 派生计算（readiness / Trip Pulse、committed/spent/remaining、Split 结算）；
 *  3. useReducer 的 WorkspaceReducer（所有交互动作收敛于此）。
 *
 * 计算口径（重要约定）：
 *  - Planned  = trip.budgetPlanned（计划预算）
 *  - Committed = 已预订酒店的价格 × 晚数（已确定、未实际消费）
 *  - Spent    = Σ expenses.amount（实际发生的支出）
 *  - Remaining = Planned − Committed − Spent（三者是同一预算池的扣减，不混为一个余额）
 */

import { DESTINATIONS } from "@/data/destinations";
import { demoWorkspace } from "./seed";
import { brandKeyOf, codeForSymbol, migrateWorkspaceState, normalizeMerchant } from "./expenses/engine";
import type { Transaction } from "./expenses/types";
import type {
  ActivityItem,
  ChecklistPhase,
  InboxItem,
  InboxKind,
  Place,
  PlaceKind,
  PlaceStatus,
  RouteStop,
  SavedItem,
  Trip,
  WorkspaceAction,
  WorkspaceState,
} from "./types";

// 分类标签与账本聚合逻辑统一收敛到 expenses/engine（本轮 Expenses 升级）
export { EXPENSE_CATEGORY_LABELS } from "./expenses/engine";

// ── ID ────────────────────────────────────────────────────────────────

let idCounter = 0;
/** mock 场景下的本地唯一 id（客户端内单调递增即可，不要求跨端唯一） */
export function localId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/**
 * 「收藏 → Trip 内实体」的**稳定身份**。
 *
 * 为什么需要它：Saved → Add to Trip 是**可重复触发**的动作（用户第二次点、
 * 两个标签页各点一次、Modal 误双击）。如果每次都 `localId("p")`，同一条收藏
 * 会在同一个 Trip 里长出多个同名 Place —— 而 Places 是 Trip 的一等实体，
 * 重复行会被用户当成真实数据（计数、路线、预算全部偏）。
 *
 * 判据必须与标题无关：标题可被用户编辑（改名后再 Add 会重新插入），也不保证
 * 在跨语言/同城同名的场景下唯一。这里把关系直接编码进 id：
 *
 *     place.id = `svp:<savedId>@<tripId>`
 *     hotel.id = `svh:<savedId>@<tripId>`
 *
 * 同一个 saved item + 同一个 Trip ⇒ 永远派生同一个 id ⇒ 第二次 Add 的语义是
 * 「已存在」而不是「再插一条」。id 是 places.id / stays.id 的真实列值
 * （写入云端时再加用户前缀，读出时剥离），因此**换浏览器、重载、重新登录后
 * 幂等性依然成立**，且不需要新增数据库列。
 *
 * 分隔符 `:` `@` 不会与 `localId()` 的产物（只含 `[a-z0-9-]`）或 demo id
 * 冲突，因此派生 id 与随机 id 的取值空间不相交。
 */
export function fromSavedLinkId(entity: "place" | "hotel", tripId: string, savedId: string): string {
  return `${entity === "hotel" ? "svh" : "svp"}:${savedId}@${tripId}`;
}

// ── 确定性格式化 ──────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  // 兼容完整 ISO 时间戳（"2026-09-21T08:17:42.034Z"）——只取日期部分
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

/** "Oct 18 — Oct 24"（跨年时附年份："Dec 28 — Jan 3, 2027"） */
export function formatTripDates(startDate: string, endDate: string): string {
  const a = parseISO(startDate);
  const b = parseISO(endDate);
  if (!a || !b) return startDate;
  const left = `${MONTHS_SHORT[a.m - 1]} ${a.d}`;
  const right =
    a.y === b.y
      ? a.m === b.m
        ? `${b.d}`
        : `${MONTHS_SHORT[b.m - 1]} ${b.d}`
      : `${MONTHS_SHORT[b.m - 1]} ${b.d}, ${b.y}`;
  return `${left} — ${right}`;
}

/** "October 18 — 24, 2026"（Trip Header 用） */
export function formatTripDatesLong(startDate: string, endDate: string): string {
  const a = parseISO(startDate);
  const b = parseISO(endDate);
  if (!a || !b) return startDate;
  const right = a.m === b.m ? `${b.d}` : `${MONTHS_SHORT[b.m - 1]} ${b.d}`;
  return `${MONTHS_LONG[a.m - 1]} ${a.d} — ${right}, ${a.y}`;
}


/** 操作流水：写入即格式化时间标签（客户端 dispatch 时执行，无 SSR 路径） */
function nowLabel(): string {
  const d = new Date();
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function withActivity(state: WorkspaceState, text: string): WorkspaceState {
  const entry: ActivityItem = { id: localId("a"), text, at: nowLabel() };
  return { ...state, activity: [entry, ...state.activity].slice(0, 10) };
}

export function formatSavedDate(iso: string): string {
  const p = parseISO(iso);
  return p ? `${MONTHS_SHORT[p.m - 1]} ${p.d}` : iso;
}

export function nightsBetween(startDate: string, endDate: string): number {
  const a = parseISO(startDate);
  const b = parseISO(endDate);
  if (!a || !b) return 0;
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.max(0, Math.round(ms / 86400000));
}

/** "¥68,420" —— mock 计价，符号来自 trip.currency */
export function money(amount: number, currency: string): string {
  return `${currency}${Math.round(amount).toLocaleString("en-US")}`;
}

export const PLACE_KIND_LABELS: Record<PlaceKind, string> = {
  sight: "Sight",
  food: "Food",
  activity: "Activity",
  nature: "Nature",
  shopping: "Shopping",
};

export const PLACE_STATUS_LABELS: Record<PlaceStatus, string> = {
  want: "Want to go",
  must: "Must go",
  done: "Done",
  skipped: "Skipped",
};

export const EXPENSE_CATEGORY_LABELS_REMOVED = undefined;

export const CHECKLIST_PHASE_LABELS: Record<ChecklistPhase, string> = {
  before: "Before trip",
  during: "During trip",
  after: "After trip",
};

// ── Trip 派生数据 ─────────────────────────────────────────────────────

export function shortlistCount(trip: Trip): number {
  return trip.hotels.filter((h) => !h.booked).length;
}

/**
 * 计算口径（本轮 Expenses 升级后）：
 *  - Actual spent = state.transactions 中 status=confirmed 的交易（见 expenses/engine）；
 *  - Committed = 已预订酒店价格 × 晚数（已确定、未实际消费）——与 Actual 严格分离；
 *  - Budget = trip.budgetPlanned（用户设定）。
 * tripSpent / tripRemaining / tripSpentByCategory / settlementFor 已收敛至
 * expenses/engine（tripActualTotals / totalsByCategory / settlementForTravelers）。
 */
export function tripCommitted(trip: Trip): number {
  return trip.hotels
    .filter((h) => h.booked)
    .reduce((s, h) => s + h.pricePerNight * Math.max(1, h.nights ?? 1), 0);
}

export interface ReadinessRow {
  key: string;
  label: string;
  /** 右侧状态文案（"✓" / "12 saved" / "60%" / "5 left"） */
  value: string;
  /** 0-100，用于整体百分比的加权项 */
  pct: number;
  weight: number;
}

export interface TripReadiness {
  overall: number;
  rows: ReadinessRow[];
  decisionsLeft: number;
}

/**
 * Trip readiness（Trip Pulse 的核心）——不是 KPI 卡，而是"旅行准备到哪了"的单一读数。
 * 权重：Stay 20 / Flights 15 / Places 20 / Route 20 / Budget 15 / Checklist 10。
 */
/**
 * Trip 阶段词（第七轮：删除 Planning %）——
 * Not started（全空）/ In progress（有任何内容）/ Ready（已有 booked 主住宿）。
 */
export function tripStage(trip: Trip, txnCount = 0): "Not started" | "In progress" | "Ready" {
  const hasContent =
    trip.places.length > 0 ||
    trip.hotels.length > 0 ||
    trip.routeDays.length > 0 ||
    txnCount > 0 ||
    trip.checklist.length > 0 ||
    trip.travelers.length > 1;
  if (trip.hotels.some((h) => h.booked)) return "Ready";
  return hasContent ? "In progress" : "Not started";
}

/** Itinerary 第 N 天的日期（start + N-1），ISO；无 trip 日期时返回 undefined */
export function dayDate(startDate: string, dayIndex: number): string {
  const base = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return "";
  base.setDate(base.getDate() + dayIndex);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Itinerary stop 显示名：引用 Place 时取 place.name（改名自动联动） */
export function stopName(trip: Trip, stop: { name: string; placeId?: string }): string {
  if (!stop.placeId) return stop.name;
  return trip.places.find((pl) => pl.id === stop.placeId)?.name ?? stop.name;
}

// ── Split 结算 ────────────────────────────────────────────────────────

export interface TravelerBalance {
  id: string;
  name: string;
  paid: number;
  share: number;
  net: number;
}

export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface Settlement {
  balances: TravelerBalance[];
  transfers: Transfer[];
}

/**
 * Split 结算：
 *  - net = paid − share（share = 其参与的支出均摊份额）；
 *  - transfers 用贪心结算（债权人 × 债务人排序后逐笔对冲），
 *    得到近似最少转账次数 —— mock calculation，本阶段不做整数规划。
 */
export function settlementFor(trip: Trip): Settlement {
  const balances: TravelerBalance[] = trip.travelers.map((t) => ({
    id: t.id,
    name: t.name,
    paid: 0,
    share: 0,
    net: 0,
  }));
  const byId = new Map(balances.map((b) => [b.id, b]));

  for (const e of trip.expenses) {
    const payer = byId.get(e.paidBy);
    if (payer) payer.paid += e.amount;
    const members = e.splitBetween.filter((id) => byId.has(id));
    if (members.length === 0) continue;
    const share = e.amount / members.length;
    for (const id of members) {
      byId.get(id)!.share += share;
    }
  }

  for (const b of balances) b.net = b.paid - b.share;

  const creditors = balances.filter((b) => b.net > 0.5).map((b) => ({ ...b })).sort((a, b) => b.net - a.net);
  const debtors = balances.filter((b) => b.net < -0.5).map((b) => ({ ...b })).sort((a, b) => a.net - b.net);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.net, -d.net);
    if (amount > 0.5) {
      transfers.push({
        fromId: d.id,
        fromName: d.name,
        toId: c.id,
        toName: c.name,
        amount: Math.round(amount),
      });
    }
    c.net -= amount;
    d.net += amount;
    if (c.net <= 0.5) ci += 1;
    if (d.net >= -0.5) di += 1;
  }

  return { balances, transfers };
}

// ── Next steps（比 Planning % 更直白的"接下来做什么"） ─────────────────

export interface NextStep {
  key: string;
  /** 副文案（当前状态），如 "2 hotels saved" */
  label: string;
  /** 点击后跳转的 tab */
  tab: string;
}

export function nextStepsFor(trip: Trip, txnCount = 0): Array<NextStep & { detail?: string }> {
  const steps: Array<NextStep & { detail?: string }> = [];
  const placesSaved = trip.places.filter((p) => p.status === "want" || p.status === "must").length;

  // 空 Trip：get-started 引导（第七轮产品规则）
  if (
    placesSaved === 0 &&
    trip.hotels.length === 0 &&
    trip.routeDays.length === 0 &&
    txnCount === 0 &&
    trip.travelers.length <= 1
  ) {
    return [
      { key: "gs-place", label: "Add your first place", tab: "places" },
      { key: "gs-stay", label: "Choose where to stay", tab: "stay" },
      { key: "gs-itinerary", label: "Build your itinerary", tab: "itinerary" },
      { key: "gs-people", label: "Add travelers", tab: "people", detail: "1 traveler" },
      { key: "gs-budget", label: "Set your budget", tab: "expenses", detail: "No budget yet" },
    ];
  }

  if (!trip.flight) {
    steps.push({ key: "flight", label: "Add your flight", tab: "itinerary", detail: "No flight yet" });
  }
  const bookedHotel = trip.hotels.find((h) => h.booked);
  if (!bookedHotel) {
    steps.push({
      key: "hotel",
      label: "Choose where to stay",
      tab: "stay",
      detail: trip.hotels.length > 0 ? `${trip.hotels.length} options saved` : "No hotels yet",
    });
  }
  for (const d of trip.routeDays) {
    if (d.stops.length < 2) {
      steps.push({
        key: `route-${d.id}`,
        label: `Plan ${d.title.replace(/ ·.*$/, "")}`,
        tab: "itinerary",
        detail: d.stops.length === 0 ? "No stops yet" : "1 stop only",
      });
    }
  }
  if (trip.travelers.length <= 1) {
    steps.push({ key: "people", label: "Add travelers", tab: "people", detail: "1 traveler" });
  }
  if (trip.budgetPlanned <= 0) {
    steps.push({ key: "budget", label: "Set your budget", tab: "expenses", detail: "No budget yet" });
  }
  for (const c of trip.checklist.filter((x) => !x.done).slice(0, 3)) {
    steps.push({ key: c.id, label: c.label, tab: "checklist" });
  }
  return steps.slice(0, 5);
}

// ── Reducer ───────────────────────────────────────────────────────────

export type { WorkspaceAction };

function updateTrip(state: WorkspaceState, tripId: string, fn: (t: Trip) => Trip): WorkspaceState {
  return { ...state, trips: state.trips.map((t) => (t.id === tripId ? fn(t) : t)) };
}

const PLACE_KINDS: PlaceKind[] = ["sight", "food", "activity", "nature", "shopping"];

function inboxAsPlace(item: InboxItem): Place {
  const kind: PlaceKind = item.kind === "hotel" ? "sight" : item.kind === "guide" ? "activity" : (PLACE_KINDS.includes(item.kind as PlaceKind) ? (item.kind as PlaceKind) : "sight");
  return { id: localId("p"), name: item.title, kind, status: "want", note: item.meta };
}

function inboxAsStop(item: InboxItem): RouteStop {
  return { id: localId("s"), name: item.title, time: "12:00", note: item.meta };
}

/** Remove traveler 时清理交易账本中的悬空引用（paidBy / splitBetween / 固定份额） */
function cleanTransactionsForTraveler(state: WorkspaceState, travelerId: string): WorkspaceState {
  return {
    ...state,
    transactions: state.transactions.map((t) =>
      t.paidBy === travelerId || t.splitBetween.includes(travelerId)
        ? {
            ...t,
            paidBy: t.paidBy === travelerId ? undefined : t.paidBy,
            splitBetween: t.splitBetween.filter((id) => id !== travelerId),
            splitShares: t.splitShares
              ? Object.fromEntries(Object.entries(t.splitShares).filter(([id]) => id !== travelerId))
              : undefined,
            updatedAt: new Date().toISOString(),
          }
        : t,
    ),
  };
}

/**
 * Saved 幂等 upsert —— **唯一实现**（ADD_SAVED 与 SAVE_AND_ADD_TO_TRIP 共用）。
 *
 * 去重键必须与数据库唯一索引 saved_items_user_title_kind_key
 * （user_id, lower(title), kind）以及 saved_items.kind 的 CHECK 约束一致：
 * 同 title（大小写不敏感）+ 同 kind 即同一条收藏，只刷新来源信息，不新增行。
 * 不一致的话本地会留下两条而云端只允许一条 → 第二条写入被 23505 拒绝。
 */
function upsertSaved(state: WorkspaceState, item: Omit<SavedItem, "id">): WorkspaceState {
  const existing = state.saved.find(
    (s) => s.kind === item.kind && s.title.toLowerCase() === item.title.toLowerCase(),
  );
  if (existing) {
    return {
      ...state,
      saved: state.saved.map((s) =>
        s.id === existing.id
          ? {
              ...s,
              meta: item.meta ?? s.meta,
              source: item.source ?? s.source,
              sourceUrl: item.sourceUrl ?? s.sourceUrl,
            }
          : s,
      ),
    };
  }
  return { ...state, saved: [{ ...item, id: localId("sv") }, ...state.saved] };
}

/** 按 (kind, lower(title)) 找收藏 —— upsert 之后的稳定引用方式。 */
function findSaved(state: WorkspaceState, kind: InboxKind, title: string): SavedItem | undefined {
  const lower = title.toLowerCase();
  return state.saved.find((s) => s.kind === kind && s.title.toLowerCase() === lower);
}

/** Saved ↔ Trip 关联：幂等追加（同一条收藏可属于多个 Trip，重复调用不产生重复项）。 */
function linkSavedToTrip(state: WorkspaceState, savedId: string, tripId: string): WorkspaceState {
  return {
    ...state,
    saved: state.saved.map((s) => {
      if (s.id !== savedId) return s;
      const ids = s.tripIds ?? [];
      return ids.includes(tripId) ? s : { ...s, tripIds: [...ids, tripId] };
    }),
  };
}

/** 该收藏是否已关联该 Trip（用于把「重复 Add」折叠成**真·空操作**）。 */
function isSavedLinkedToTrip(state: WorkspaceState, savedId: string, tripId: string): boolean {
  return (state.saved.find((s) => s.id === savedId)?.tripIds ?? []).includes(tripId);
}

/** SavedItem.kind → Trip 内 Place.kind（收藏库只有 4 个 kind，Place 有 5 个）。 */
export function placeKindOfSaved(kind: InboxKind): PlaceKind {
  if (kind === "activity" || kind === "guide") return "activity";
  return "sight";
}

/**
 * Trip 内是否已有同名条目（places + hotels，大小写不敏感）。
 *
 * 定位：**展示口径 + 同名兜底**，不是身份判据。Modal 的「✓ In trip」用它；
 * 写入路径的一级判据是 fromSavedLinkId 派生的稳定 id（见 addSavedIntoTrip）。
 */
export function tripNameTaken(trip: Trip, title: string): boolean {
  const lower = title.toLowerCase();
  const nameOf = (v: string) => v.toLowerCase();
  return (
    trip.places.some((p) => nameOf(p.name) === lower) ||
    trip.hotels.some((h) => nameOf(h.name) === lower)
  );
}

/**
 * 把一条收藏挂到 Trip 上 —— **唯一实现**。
 *
 * `SAVED_ADD_TO_TRIP`（/trips 内页 Saved 列表）与 `SAVE_AND_ADD_TO_TRIP`
 * （Destinations / Guides 外部页）都走这里，因此两个入口的幂等语义不可能漂移；
 * 而两者最终都由同一个 reducer 承担，guest 与 remote 通道天然共享同一份语义
 * （通道只决定「写哪里」，不决定「写什么」）。
 *
 * 幂等判据（任一命中即视为已存在，返回 added=false）：
 *  1. **稳定身份**：`fromSavedLinkId(saved.id, trip.id)` 已在 Trip 内存在。
 *     这是与标题无关的权威判据 —— 用户把 Place 改名后再 Add 也不会重复，
 *     因为 id 不随标题变化。
 *  2. **同名兜底**：Trip 内已有同名条目（例如用户手工录入的同一地点）。
 *     只用来避免制造视觉重复，与 Modal 的「✓ In trip」判定同口径。
 *
 * 注意：命中判据 2 时**不**把既有条目的 id 改写成派生 id —— 已有条目可能
 * 已被 routeDays[].stops[].placeId 引用，改写 id 会连带打断引用关系。
 */
function addSavedIntoTrip(
  state: WorkspaceState,
  trip: Trip,
  saved: SavedItem,
  placeKind: PlaceKind,
): { state: WorkspaceState; added: boolean } {
  if (saved.kind === "hotel") {
    const id = fromSavedLinkId("hotel", trip.id, saved.id);
    if (trip.hotels.some((h) => h.id === id) || tripNameTaken(trip, saved.title)) {
      return { state, added: false };
    }
    return {
      state: updateTrip(state, trip.id, (t) => ({
        ...t,
        hotels: [...t.hotels, { id, name: saved.title, pricePerNight: 0, area: saved.meta }],
      })),
      added: true,
    };
  }

  const id = fromSavedLinkId("place", trip.id, saved.id);
  if (trip.places.some((p) => p.id === id) || tripNameTaken(trip, saved.title)) {
    return { state, added: false };
  }
  return {
    state: updateTrip(state, trip.id, (t) => ({
      ...t,
      places: [
        ...t.places,
        {
          id,
          name: saved.title,
          kind: placeKind,
          status: "want" as const,
          area: saved.meta,
          note: saved.source,
          fromSaved: true,
        },
      ],
    })),
    added: true,
  };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "RESET":
      return { trips: [], saved: [], inbox: [], activity: [], transactions: [], merchantRules: {} };

    case "CREATE_TRIP": {
      const trip: Trip = {
        id: action.id ?? localId("trip"),
        destination: action.destination,
        name: action.name,
        // 正式关联真实 Destination（蓝图 #5）：destinationId = DESTINATIONS slug，
        // 同时快照 country / image 供显示（不影响数据层本身）。
        destinationId: action.destinationId,
        destinationSlug: action.destinationId,
        destinationImage:
          DESTINATIONS.find((d) => d.slug === action.destinationId)?.image ?? null,
        currency: codeForSymbol(action.currency ?? "CNY"),
        country: DESTINATIONS.find((d) => d.slug === action.destinationId)?.country ?? "",
        // 依据日期推导：覆盖今天 → current；未来 → upcoming；已结束 → past
        status: deriveStatus(action.startDate, action.endDate),
        startDate: action.startDate,
        endDate: action.endDate,
        budgetPlanned: 0,
        flightBooked: false,
        // 第六轮：新 Trip 只含用户自己（You），同行人由用户手动添加
        travelers: [{ id: localId("t"), name: "You" }],
        places: [],
        hotels: [],
        routeDays: [],
        expenses: [],
        checklist: [],
      };
      return withActivity({ ...state, trips: [trip, ...state.trips] }, `Created trip ${trip.destination}`);
    }

    case "DELETE_TRIP":
      return {
        // 真实消费不静默删除：Trip 删除后其 Transaction 变为 Unassigned，可重新归属
        ...state,
        trips: state.trips.filter((t) => t.id !== action.tripId),
        transactions: state.transactions.map((t) =>
          t.tripId === action.tripId ? { ...t, tripId: undefined, updatedAt: new Date().toISOString() } : t,
        ),
        // Saved↔Trip 关联随 Trip 消失 —— 对齐 saved_item_trips.trip_id 的 on delete cascade。
        // 留着悬空 trip_id 有两个真实后果：云端写入撞 FK 23503（整批失败），
        // 以及 Saved 列表显示一个已经不存在的 Trip。
        saved: state.saved.map((s) =>
          s.tripIds?.includes(action.tripId)
            ? { ...s, tripIds: s.tripIds.filter((id) => id !== action.tripId) }
            : s,
        ),
      };

    case "LOAD_DEMO":
      return migrateWorkspaceState(demoWorkspace());

    case "RESTORE_STATE":
      // 挂载时恢复 localStorage 快照（外部页 Save / Add to Trip 写入的数据由此回流）；
      // 旧 Expense 数据在此迁移为 Transaction（source=manual, status=confirmed）
      return migrateWorkspaceState(action.state);

    case "EDIT_TRIP":
      return updateTrip(state, action.tripId, (t) => {
        const destination = action.destination?.trim() || t.destination;
        const startDate = action.startDate || t.startDate;
        const endDate = action.endDate || t.endDate;
        const dest = DESTINATIONS.find((d) => d.slug === (action.destinationId ?? t.destinationId));
        return {
          ...t,
          destination,
          destinationId: action.destinationId ?? t.destinationId,
          destinationSlug: action.destinationId ?? t.destinationSlug,
          destinationImage: dest ? dest.image : t.destinationImage,
          name: action.name,
          currency: action.currency ? codeForSymbol(action.currency) : t.currency,
          country: dest?.country ?? t.country,
          startDate,
          endDate,
          status: deriveStatus(startDate, endDate),
        };
      });

    case "ADD_PLACE": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      const next = updateTrip(state, action.tripId, (t) => ({
        ...t,
        places: [
          ...t.places,
          {
            id: localId("p"),
            name: action.name,
            kind: action.kind,
            area: action.area,
            status: "want",
            note: action.note,
          },
        ],
      }));
      return withActivity(next, `Added ${action.name} to ${trip?.destination ?? "trip"} places`);
    }

    case "EDIT_PLACE":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        places: t.places.map((pl) =>
          pl.id === action.placeId
            ? { ...pl, name: action.name, kind: action.kind, area: action.area, note: action.note, status: action.status }
            : pl,
        ),
      }));

    case "SET_PLACE_STATUS":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        places: t.places.map((p) => (p.id === action.placeId ? { ...p, status: action.status } : p)),
      }));

    case "SET_PLACE_NOTE":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        places: t.places.map((p) =>
          p.id === action.placeId ? { ...p, note: action.note?.trim() || undefined } : p,
        ),
      }));

    case "REMOVE_PLACE":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        places: t.places.filter((p) => p.id !== action.placeId),
      }));

    case "ADD_HOTEL": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      const next = updateTrip(state, action.tripId, (t) => ({
        ...t,
        hotels: [
          ...t.hotels,
          {
            id: localId("h"),
            name: action.name,
            pricePerNight: action.pricePerNight,
            nights: action.nights,
            area: action.area,
            rating: action.rating,
            notes: action.notes,
          },
        ],
      }));
      return withActivity(next, `Added ${action.name} to ${trip?.destination ?? "trip"} stay`);
    }

    case "REMOVE_HOTEL":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        hotels: t.hotels.filter((h) => h.id !== action.hotelId),
      }));

    case "SET_FLIGHT":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        flight: action.flight,
      }));

    case "SET_HOTEL_FLAG":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        // booked 互斥：同一时间只允许一个主住宿；换酒店时旧 booked 自动取消
        hotels: t.hotels.map((h) => {
          if (action.flag === "booked" && action.value) {
            const isTarget = h.id === action.hotelId;
            const next = { ...h, booked: isTarget };
            if (isTarget && action.nights && action.nights > 0) next.nights = action.nights;
            return next;
          }
          if (h.id !== action.hotelId) return h;
          return { ...h, [action.flag]: action.value };
        }),
      }));

    case "PATCH_STOP":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) =>
          d.id === action.dayId
            ? {
                ...d,
                stops: d.stops.map((s) => (s.id === action.stopId ? { ...s, ...action.patch } : s)),
              }
            : d,
        ),
      }));

    case "PATCH_HOTEL":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        hotels: t.hotels.map((h) => (h.id === action.hotelId ? { ...h, ...action.patch } : h)),
      }));

    case "ADD_STOP": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      const place = trip?.places.find((pl) => pl.id === action.placeId);
      const next = updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) =>
          d.id === action.dayId
            ? {
                ...d,
                stops: [
                  ...d.stops,
                  {
                    id: localId("s"),
                    name: action.name,
                    time: action.time,
                    note: action.note ?? place?.note,
                    area: place?.area,
                    placeId: action.placeId,
                    kind: action.kind,
                  },
                ],
              }
            : d,
        ),
      }));
      return withActivity(next, `Added stop ${action.name} to ${trip?.destination ?? "trip"} itinerary`);
    }

    case "ADD_PLACE_TO_ITINERARY": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      const place = trip?.places.find((pl) => pl.id === action.placeId);
      if (!trip || !place) return state;
      // 目标 Day：已有天中 stops 最少的；没有天则自动建 "Day 1"
      let day = [...trip.routeDays].sort((a, b) => a.stops.length - b.stops.length)[0];
      let working = state;
      if (!day) {
        working = updateTrip(state, action.tripId, (t) => ({
          ...t,
          routeDays: [
            ...t.routeDays,
            {
              id: localId("d"),
              title: `Day 1 · ${t.destination}`,
              stops: [],
              distanceKm: 0,
              transitMin: 0,
            },
          ],
        }));
        const refreshed = working.trips.find((t) => t.id === action.tripId);
        const created = refreshed?.routeDays[0];
        if (!created) return state;
        day = created;
      }
      const dayId: string = day.id;
      const next = updateTrip(working, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) =>
          d.id === dayId
            ? {
                ...d,
                stops: [
                  ...d.stops,
                  {
                    id: localId("s"),
                    name: place.name,
                    time: action.time ?? "12:00",
                    note: place.note,
                    area: place.area,
                    placeId: place.id,
                  },
                ],
              }
            : d,
        ),
      }));
      return withActivity(next, `Added ${place.name} to ${trip.destination} itinerary`);
    }

    case "REMOVE_STOP":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) =>
          d.id === action.dayId ? { ...d, stops: d.stops.filter((s) => s.id !== action.stopId) } : d,
        ),
      }));

    case "MOVE_STOP":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) => {
          if (d.id !== action.dayId) return d;
          const stops = [...d.stops];
          const [moved] = stops.splice(action.from, 1);
          if (!moved) return d;
          stops.splice(Math.max(0, Math.min(action.to, stops.length)), 0, moved);
          return { ...d, stops };
        }),
      }));

    case "SET_STOP_TIME":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.map((d) =>
          d.id === action.dayId
            ? { ...d, stops: d.stops.map((s) => (s.id === action.stopId ? { ...s, time: action.time } : s)) }
            : d,
        ),
      }));

    case "ADD_ROUTE_DAY":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: [
          ...t.routeDays,
          {
            id: localId("d"),
            title: `Day ${t.routeDays.length + 1} · ${t.destination}`,
            stops: action.firstStop
              ? [
                  {
                    id: localId("s"),
                    name: action.firstStop.name,
                    time: action.firstStop.time,
                    note: action.firstStop.note,
                    kind: action.firstStop.kind,
                    placeId: action.firstStop.placeId,
                  },
                ]
              : [],
            distanceKm: 0,
            transitMin: 0,
          },
        ],
      }));

    case "ADD_EXPENSE": {
      const trip = state.trips.find((t) => t.id === action.tripId);
      const next = updateTrip(state, action.tripId, (t) => ({
        ...t,
        expenses: [...t.expenses, { ...action.expense, id: localId("e") }],
      }));
      return withActivity(next, `Added expense ${action.expense.title} to ${trip?.destination ?? "trip"}`);
    }

    case "REMOVE_ROUTE_DAY":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        routeDays: t.routeDays.filter((day) => day.id !== action.dayId),
      }));

    case "REMOVE_EXPENSE":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        expenses: t.expenses.filter((e) => e.id !== action.expenseId),
      }));

    case "SET_BUDGET":
      return updateTrip(state, action.tripId, (t) => ({ ...t, budgetPlanned: Math.max(0, action.amount) }));

    case "ADD_TRAVELER": {
      const next = updateTrip(state, action.tripId, (t) => ({
        ...t,
        travelers: [...t.travelers, { id: localId("t"), name: action.name }],
      }));
      return withActivity(next, `Added traveler ${action.name}`);
    }

    case "REMOVE_TRAVELER":
      return cleanTransactionsForTraveler(
        updateTrip(state, action.tripId, (t) => {
          const travelers = t.travelers.filter((x) => x.id !== action.travelerId);
          const expenses = t.expenses
            .filter((e) => e.paidBy !== action.travelerId)
            .map((e) => ({ ...e, splitBetween: e.splitBetween.filter((id) => id !== action.travelerId) }));
          return { ...t, travelers, expenses };
        }),
        action.travelerId,
      );

    case "TOGGLE_CHECKLIST":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        checklist: t.checklist.map((c) => (c.id === action.itemId ? { ...c, done: !c.done } : c)),
      }));

    case "ADD_CHECKLIST":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        checklist: [...t.checklist, { id: localId("c"), label: action.label, phase: action.phase, done: false }],
      }));

    case "REMOVE_CHECKLIST":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        checklist: t.checklist.filter((c) => c.id !== action.itemId),
      }));

    case "INBOX_ADD_TO_TRIP": {
      const item = state.inbox.find((i) => i.id === action.itemId);
      if (!item) return state;
      const next = updateTrip(state, action.tripId, (t) =>
        item.kind === "hotel"
          ? { ...t, hotels: [...t.hotels, { id: localId("h"), name: item.title, pricePerNight: 0 }] }
          : { ...t, places: [...t.places, inboxAsPlace(item)] },
      );
      return { ...next, inbox: next.inbox.filter((i) => i.id !== action.itemId) };
    }

    case "INBOX_ADD_TO_ROUTE": {
      const item = state.inbox.find((i) => i.id === action.itemId);
      if (!item) return state;
      const next = updateTrip(state, action.tripId, (t) => {
        if (t.routeDays.length === 0) {
          return {
            ...t,
            routeDays: [
              {
                id: localId("d"),
                title: `Day 1 · ${t.destination}`,
                stops: [inboxAsStop(item)],
                distanceKm: 0,
                transitMin: 0,
              },
            ],
          };
        }
        const last = t.routeDays[t.routeDays.length - 1];
        return {
          ...t,
          routeDays: t.routeDays.map((d) =>
            d.id === last.id ? { ...d, stops: [...d.stops, inboxAsStop(item)] } : d,
          ),
        };
      });
      return { ...next, inbox: next.inbox.filter((i) => i.id !== action.itemId) };
    }

    case "INBOX_SAVE": {
      // 蓝图 #12：Inbox → [Save] → Saved（暂存收藏库），并从 Inbox 消失
      const item = state.inbox.find((i) => i.id === action.itemId);
      if (!item) return state;
      return {
        ...state,
        inbox: state.inbox.filter((i) => i.id !== action.itemId),
        saved: [
          { id: localId("sv"), kind: item.kind, title: item.title, meta: item.meta, savedAt: item.savedAt },
          ...state.saved,
        ],
      };
    }

    case "INBOX_IGNORE":
      return { ...state, inbox: state.inbox.filter((i) => i.id !== action.itemId) };

    case "ADD_SAVED":
      // 去重语义统一收敛到 upsertSaved（见其定义处注释），与数据库唯一索引
      // saved_items_user_title_kind_key（user_id, lower(title), kind）一致。
      return upsertSaved(state, action.item);

    case "SAVE_AND_ADD_TO_TRIP": {
      // 外部页（Destinations / Guides）的原子写入：Saved upsert → 关联 → Trip 内新增。
      const trip = state.trips.find((t) => t.id === action.tripId);
      // 无该 Trip：整体不写入（调用方据返回值判定 no-trip，不会出现半截状态）。
      if (!trip) return state;

      let next = upsertSaved(state, {
        kind: action.kind,
        title: action.title,
        meta: action.meta,
        savedAt: action.savedAt,
        source: action.source,
        sourceUrl: action.sourceUrl,
      });
      const savedItem = findSaved(next, action.kind, action.title);
      // 兜底：upsertSaved 必然写入（新增或命中既有），这里的 return 只为类型收敛。
      if (!savedItem) return next;
      next = linkSavedToTrip(next, savedItem.id, action.tripId);

      // 幂等：判定用**刚写入的 savedItem.id 派生出的稳定 id**，与标题字符串无关。
      // 重复触发（双击 / 多标签页 / 先 Add 后重新打开页面再 Add）只补 Saved 关联，
      // 不再插入第二条 Place；这也覆盖「外部页与 /trips 内页交叉 Add」的场景。
      const { state: added, added: didAdd } = addSavedIntoTrip(
        next,
        trip,
        savedItem,
        action.placeKind ?? "sight",
      );
      if (!didAdd) return added;
      return withActivity(added, `Added ${action.title} to ${trip.destination} from ${action.source}`);
    }

    case "REMOVE_SAVED":
      return { ...state, saved: state.saved.filter((s) => s.id !== action.itemId) };

    case "SAVED_ADD_TO_TRIP": {
      const item = state.saved.find((s) => s.id === action.itemId);
      if (!item) return state;
      const trip = state.trips.find((t) => t.id === action.tripId);
      // 目标 Trip 不存在：不写入（此前会走 updateTrip 的静默 no-op，却仍然写流水与
      // Saved 关联，留下「已加入」的假象）。
      if (!trip) return state;

      // 加入 Trip（复制为 Trip 内对象）；Saved 语义 = "以后可能用"，保留不删。
      // 幂等：id 由 (savedId, tripId) 派生 → 同一条收藏加入同一个 Trip 只会有一个
      // Place，与标题无关（改名后再 Add 也不会重复）。
      const { state: added, added: didAdd } = addSavedIntoTrip(
        state,
        trip,
        item,
        placeKindOfSaved(item.kind),
      );

      // 重复 Add 且关联已存在 → 返回**同一个 state 引用**：对 remote 通道而言
      // flatten 后的行完全一致，diff 为空、零请求，是真正的空操作。
      if (!didAdd && isSavedLinkedToTrip(added, item.id, action.tripId)) return state;

      // 双向关系：SavedItem 记录已加入的 Trip（同 item 可属于多个 Trip）。
      // 经 linkSavedToTrip 保证幂等：重复触发不会产生重复的 saved_item_trips 行
      //（该表主键 (saved_item_id, trip_id)，重复行在云端会被 23505 拒绝）。
      const linked = linkSavedToTrip(added, item.id, action.tripId);
      if (!didAdd) return linked; // 已存在（同名兜底命中）：只补关联，不写流水
      return withActivity(linked, `Added ${item.title} from Saved to ${trip.destination}`);
    }

    case "ADD_INBOX_ITEM":
      return { ...state, inbox: [{ ...action.item, id: localId("in") }, ...state.inbox] };

    // ── Expenses / Transaction（本轮升级） ────────────────────────────

    case "ADD_TXN":
      return withActivity(
        { ...state, transactions: [action.txn, ...state.transactions] },
        `Added expense ${action.txn.merchant || "Untitled"}`,
      );

    case "IMPORT_TXNS": {
      if (action.txns.length === 0) return state;
      return withActivity(
        { ...state, transactions: [...action.txns, ...state.transactions] },
        `Imported ${action.txns.length} ${action.txns.length === 1 ? "transaction" : "transactions"} from ${action.label}`,
      );
    }

    case "CONFIRM_TXNS": {
      const ids = new Set(action.ids);
      return {
        ...state,
        transactions: state.transactions.map((t) => {
          if (!ids.has(t.id) || t.status === "confirmed") return t;
          // spec #36：每笔消费都需要 Paid by；确认时默认 = Trip 发起人 + 全员均摊
          //（用户可在交易详情里改 Paid by / 不等额 split）
          const trip = t.tripId ? state.trips.find((tr) => tr.id === t.tripId) : undefined;
          const paidBy = t.paidBy ?? trip?.travelers[0]?.id;
          const splitBetween =
            t.splitBetween.length > 0 ? t.splitBetween : trip ? trip.travelers.map((x) => x.id) : [];
          return {
            ...t,
            status: "confirmed" as const,
            paidBy,
            splitBetween,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case "IGNORE_TXNS": {
      const ids = new Set(action.ids);
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          ids.has(t.id)
            ? { ...t, status: "ignored" as const, updatedAt: new Date().toISOString() }
            : t,
        ),
      };
    }

    case "UPDATE_TXN": {
      const target = state.transactions.find((t) => t.id === action.id);
      if (!target) return state;
      let next: Transaction = {
        ...target,
        ...action.patch,
        updatedAt: new Date().toISOString(),
      };
      // Capture first：draft 快速记录一旦补上真实金额 → 自动转 confirmed
      //（同时补默认 paidBy / 全员 split，用户仍可在详情里改）
      if (
        target.status === "draft" &&
        next.status === "draft" &&
        typeof next.originalAmount === "number" &&
        next.originalAmount > 0 &&
        next.merchant.trim() !== ""
      ) {
        const trip = next.tripId ? state.trips.find((tr) => tr.id === next.tripId) : undefined;
        next = {
          ...next,
          status: "confirmed",
          paidBy: next.paidBy ?? trip?.travelers[0]?.id,
          splitBetween:
            next.splitBetween.length > 0 ? next.splitBetween : trip ? trip.travelers.map((x) => x.id) : [],
        };
      }
      // 学习（spec #40）：用户在已确认交易上纠正分类 → 记录 merchant rule，不影响历史。
      // 同时记录品牌级 key（如 "grab bangkok" → "grab"），同品牌新交易优先使用用户选择。
      // category 为 null（清除分类）不学习。
      let merchantRules = state.merchantRules;
      const learnedCat = action.patch.category;
      if (
        action.learn &&
        learnedCat &&
        next.status === "confirmed" &&
        learnedCat !== target.category
      ) {
        const key = normalizeMerchant(next.merchant || target.merchant);
        const brand = brandKeyOf(key);
        const rule = { category: learnedCat, subcategory: next.subcategory };
        if (key) {
          merchantRules = { ...merchantRules, [key]: rule };
        }
        if (brand && brand !== key) {
          merchantRules = { ...merchantRules, [brand]: rule };
        }
      }
      return {
        ...state,
        merchantRules,
        transactions: state.transactions.map((t) => (t.id === action.id ? next : t)),
      };
    }

    case "DELETE_TXN": {
      const target = state.transactions.find((t) => t.id === action.id);
      if (!target) return state;
      const importedSource = target.source !== "manual";
      if (importedSource) {
        // imported 记录不物理删除：只置为 ignored，重复导入不会产生怪状态
        return {
          ...state,
          transactions: state.transactions.map((t) =>
            t.id === action.id
              ? { ...t, status: "ignored" as const, updatedAt: new Date().toISOString() }
              : t,
          ),
        };
      }
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    }

    default:
      return state;
  }
}

export function deriveStatus(startDate: string, endDate: string): Trip["status"] {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const todayN = y * 10000 + m * 100 + d;
  const startN = Number(startDate.replaceAll("-", ""));
  const endN = Number(endDate.replaceAll("-", ""));
  if (Number.isNaN(startN) || Number.isNaN(endN)) return "upcoming";
  if (todayN > endN) return "past";
  if (todayN < startN) return "upcoming";
  return "current";
}

export { PLACE_KINDS };

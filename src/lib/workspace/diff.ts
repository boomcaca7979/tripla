/**
 * workspace/diff — 把「工作区的两次快照」折算成最小写入集。
 *
 * 为什么是 diff 而不是「整库重写」：
 *  - 真实账本表（expenses / trips / …）全部有 `before update` 触发器与
 *    `updated_at`。整库 delete+insert 会把每一行的 updated_at 刷成 now()，
 *    等于销毁「何时被修改」这个事实；
 *  - 多标签页/多设备同时在线时，整库重写会让最后一次提交覆盖掉别人的字段级
 *    修改；逐行 upsert 至少把冲突面缩小到同一行；
 *  - 一次点击产生的写入量应该等于这次点击真正改动的行数。
 *
 * 比较是**逐表按主键**的，不是整对象比较：
 *  - 新增行 → upsert；
 *  - 内容变化的行 → upsert；
 *  - 消失的行 → delete；
 *  - 未出现的行 → 不动（不产生任何网络请求）。
 *
 * 行相等用**规范化序列化**判断（对象键排序、忽略 undefined），而不是引用相等：
 * flatten 每次都产生新对象，引用比较会把所有行都判为"已变化"。
 */

import type {
  ActivityRow,
  ChecklistItemRow,
  ExpenseRow,
  FlatWorkspace,
  InboxItemRow,
  ItineraryDayRow,
  ItineraryStopRow,
  MerchantRuleRow,
  PlaceRow,
  SavedItemRow,
  SavedItemTripRow,
  StayRow,
  TripPersonRow,
  TripRow,
} from "./types";

/** 单表增量：需要 upsert 的行，和需要删除的行（删除携带原行，便于取复合键）。 */
export interface CollectionDiff<T> {
  upserts: T[];
  removed: T[];
}

export interface WorkspaceChanges {
  upserts: {
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
  };
  removed: {
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
  };
}

/** 空的增量集（一切未变）。 */
export function emptyChanges(): WorkspaceChanges {
  return {
    upserts: {
      trips: [],
      places: [],
      stays: [],
      itinerary_days: [],
      itinerary_stops: [],
      trip_people: [],
      checklist_items: [],
      expenses: [],
      saved_items: [],
      saved_item_trips: [],
      inbox_items: [],
      activity: [],
      merchant_rules: [],
    },
    removed: {
      trips: [],
      places: [],
      stays: [],
      itinerary_days: [],
      itinerary_stops: [],
      trip_people: [],
      checklist_items: [],
      expenses: [],
      saved_items: [],
      saved_item_trips: [],
      inbox_items: [],
      activity: [],
      merchant_rules: [],
    },
  };
}

/** 是否真的需要写库。空增量必须完全不产生请求（读取/切换账号时会经常发生）。 */
export function hasChanges(changes: WorkspaceChanges): boolean {
  return (
    countUpserts(changes) > 0 ||
    countRemoved(changes) > 0
  );
}

export function countUpserts(changes: WorkspaceChanges): number {
  return Object.values(changes.upserts).reduce((sum, rows) => sum + rows.length, 0);
}

export function countRemoved(changes: WorkspaceChanges): number {
  return Object.values(changes.removed).reduce((sum, rows) => sum + rows.length, 0);
}

/**
 * 折算增量。prev / next 必须来自同一用户命名空间（同一 scope），
 * 否则所有 id 都会「看起来变了」——调用方负责这个前提（见 index.ts 的模式比对）。
 */
export function diffWorkspace(prev: FlatWorkspace, next: FlatWorkspace): WorkspaceChanges {
  const changes = emptyChanges();
  const { upserts, removed } = changes;

  const trips = diffBy(prev.trips, next.trips, (r) => r.id);
  upserts.trips = trips.upserts;
  removed.trips = trips.removed;

  const places = diffBy(prev.places, next.places, (r) => r.id);
  upserts.places = places.upserts;
  removed.places = places.removed;

  const stays = diffBy(prev.stays, next.stays, (r) => r.id);
  upserts.stays = stays.upserts;
  removed.stays = stays.removed;

  const days = diffBy(prev.itinerary_days, next.itinerary_days, (r) => r.id);
  upserts.itinerary_days = days.upserts;
  removed.itinerary_days = days.removed;

  const stops = diffBy(prev.itinerary_stops, next.itinerary_stops, (r) => r.id);
  upserts.itinerary_stops = stops.upserts;
  removed.itinerary_stops = stops.removed;

  const people = diffBy(prev.trip_people, next.trip_people, (r) => r.id);
  upserts.trip_people = people.upserts;
  removed.trip_people = people.removed;

  const checklist = diffBy(prev.checklist_items, next.checklist_items, (r) => r.id);
  upserts.checklist_items = checklist.upserts;
  removed.checklist_items = checklist.removed;

  const expenses = diffBy(prev.expenses, next.expenses, (r) => r.id);
  upserts.expenses = expenses.upserts;
  removed.expenses = expenses.removed;

  const savedItems = diffBy(prev.saved_items, next.saved_items, (r) => r.id);
  upserts.saved_items = savedItems.upserts;
  removed.saved_items = savedItems.removed;

  // saved_item_trips 是复合主键 (saved_item_id, trip_id)，没有单列 id。
  // 分隔符用 NUL：任何真实 id 都不可能包含它，因此不会产生歧义键。
  const links = diffBy(
    prev.saved_item_trips,
    next.saved_item_trips,
    (r) => `${r.saved_item_id}\u0000${r.trip_id}`,
  );
  upserts.saved_item_trips = links.upserts;
  removed.saved_item_trips = links.removed;

  const inbox = diffBy(prev.inbox_items, next.inbox_items, (r) => r.id);
  upserts.inbox_items = inbox.upserts;
  removed.inbox_items = inbox.removed;

  const activity = diffBy(prev.activity, next.activity, (r) => r.id);
  upserts.activity = activity.upserts;
  removed.activity = activity.removed;

  // merchant_rules 的主键是 (user_id, merchant_key)；user_id 由 scope 决定，
  // 因此表内唯一键就是 merchant_key。
  const rules = diffBy(prev.merchant_rules, next.merchant_rules, (r) => r.merchant_key);
  upserts.merchant_rules = rules.upserts;
  removed.merchant_rules = rules.removed;

  return changes;
}

function diffBy<T>(prev: T[], next: T[], keyOf: (row: T) => string): CollectionDiff<T> {
  const prevByKey = new Map<string, T>();
  for (const row of prev) prevByKey.set(keyOf(row), row);

  const upserts: T[] = [];
  const nextKeys = new Set<string>();
  for (const row of next) {
    const key = keyOf(row);
    nextKeys.add(key);
    const before = prevByKey.get(key);
    if (!before || !sameRow(before, row)) upserts.push(row);
  }

  const removed: T[] = [];
  for (const [key, row] of prevByKey) {
    if (!nextKeys.has(key)) removed.push(row);
  }

  return { upserts, removed };
}

/** 规范化序列化：对象键有序、忽略 undefined，因此与构造顺序无关。 */
function sameRow(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}

function canonical(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
}

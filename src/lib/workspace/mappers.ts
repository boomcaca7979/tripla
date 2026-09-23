/**
 * workspace/mappers — WorkspaceState ↔ Supabase 行的双向映射。
 *
 * 必须在这里解决的两件事：
 *
 * 1. **跨用户的 id 撞车**。所有表的 id 都是全局 `text primary key`（不是
 *    `(user_id, id)` 复合键），而客户端 id 来自 `localId()` 或 demo 里写死的
 *    `trip-tokyo` / `p-1`。两个用户各自 load demo 就会撞主键，第二个人的写入
 *    收到 23505 —— 而 RLS 此时是「允许」的（WITH CHECK 只看新行），错误信息
 *    会指向完全无关的方向。因此写入时把每个 id 加上**用户命名空间前缀**
 *    （`<userId>:<localId>`，形如 `cfqsaboc-…:trip-abc`），所有同级外键
 *    （trip_id / day_id / saved_item_id / place_id）同步加前缀，读出时统一剥离。
 *    客户端内存里永远是裸 id，guest 通道完全不受影响。
 *
 * 2. **标量口径**。PostgREST 对 `numeric` 可能给 number 也可能给字符串，
 *    `date` / `timestamptz` 给的是 ISO 字符串，`text[]` 给数组。映射层统一
 *    收口成 WorkspaceState 声明的类型，避免 `"21000" + 1` 这类隐式字符串运算。
 *
 * 映射必须是**纯函数且确定性**：flatten 的结果会参与逐行 diff，任何一次调用
 * 产生不同输出的字段（典型是 `new Date()` 兜底）都会造成永久性的重复写入。
 */

import type {
  ActivityItem,
  ChecklistItem,
  Hotel,
  InboxItem,
  Place,
  RouteDay,
  SavedItem,
  Traveler,
  Trip,
  WorkspaceState,
} from "@/components/trips/workspace/types";
import type { MerchantRule, Transaction } from "@/components/trips/workspace/expenses/types";
import type { ExpenseRow, FlatWorkspace, TripRow } from "./types";

/** 确定性兜底时间：绝不能用 `new Date()`（会破坏 diff 的幂等性）。 */
const FALLBACK_TIMESTAMP = "1970-01-01T00:00:00.000Z";

// ── id 命名空间 ─────────────────────────────────────────────────────────

/**
 * 用户命名空间。直接用 userId 本体（带连字符的 uuid）—— 不从别处推导、
 * 不做有损变换，因此 `user_id` 列与 id 前缀永远同源，不存在还原错误。
 */
export function idScope(userId: string): string {
  return userId;
}

export function toDbId(scope: string, localId: string): string {
  return `${scope}:${localId}`;
}

/** 剥离前缀；不带前缀的值原样返回（容错：手工插入的行、或换了账号的数据）。 */
export function fromDbId(scope: string, dbId: string): string {
  const prefix = `${scope}:`;
  return dbId.startsWith(prefix) ? dbId.slice(prefix.length) : dbId;
}

// ── 标量口径 ────────────────────────────────────────────────────────────

function num(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function optNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function optBool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/** `date` / `timestamptz` → "YYYY-MM-DD"：WorkspaceState 里的日期一律是日粒度。 */
function dateOnly(value: unknown): string | null {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null;
}

// ── flatten：WorkspaceState → 13 组行 ───────────────────────────────────

/**
 * 摊平工作区。数组下标即顺序：`itinerary_days.day_index` /
 * `itinerary_stops.stop_index` 是这两个表唯一的顺序真相；其余表靠
 * `created_at` 排序（见 assembleWorkspace 与 remote.ts 的 order 子句）。
 */
export function flattenWorkspace(scope: string, state: WorkspaceState): FlatWorkspace {
  const flat: FlatWorkspace = {
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
  };

  // 引用完整性基准：trip 相关的 FK 列（saved_item_trips.trip_id、expenses.trip_id）
  // 只允许指向本状态里真实存在的 Trip。删 Trip 的清理动作在各处 reducer 里，
  // 这里是最后一层保证——任何来源的悬空引用都不会变成 23503。
  const tripIdsInState = new Set(state.trips.map((t) => t.id));

  for (const trip of state.trips) {
    const tripId = toDbId(scope, trip.id);
    flat.trips.push(tripToRow(scope, trip, tripId));

    for (const traveler of trip.travelers) {
      flat.trip_people.push({
        id: toDbId(scope, traveler.id),
        user_id: scope,
        trip_id: tripId,
        name: traveler.name,
      });
    }

    for (const place of trip.places) {
      flat.places.push({
        id: toDbId(scope, place.id),
        user_id: scope,
        trip_id: tripId,
        name: place.name,
        kind: place.kind,
        area: place.area ?? null,
        note: place.note ?? null,
        status: place.status,
        from_saved: Boolean(place.fromSaved),
      });
    }

    for (const hotel of trip.hotels) {
      flat.stays.push({
        id: toDbId(scope, hotel.id),
        user_id: scope,
        trip_id: tripId,
        name: hotel.name,
        price_per_night: hotel.pricePerNight ?? 0,
        rating: optNum(hotel.rating),
        distance_km: optNum(hotel.distanceKm),
        breakfast: optBool(hotel.breakfast),
        free_cancellation: optBool(hotel.freeCancellation),
        preferred: Boolean(hotel.preferred),
        booked: Boolean(hotel.booked),
        nights: optNum(hotel.nights),
        area: hotel.area ?? null,
        notes: hotel.notes ?? null,
      });
    }

    trip.routeDays.forEach((day, dayIndex) => {
      const dayId = toDbId(scope, day.id);
      flat.itinerary_days.push({
        id: dayId,
        user_id: scope,
        trip_id: tripId,
        title: day.title,
        distance_km: day.distanceKm ?? 0,
        transit_min: day.transitMin ?? 0,
        day_index: dayIndex,
      });
      day.stops.forEach((stop, stopIndex) => {
        flat.itinerary_stops.push({
          id: toDbId(scope, stop.id),
          user_id: scope,
          trip_id: tripId,
          day_id: dayId,
          name: stop.name,
          time: stop.time || null,
          note: stop.note ?? null,
          area: stop.area ?? null,
          place_id: stop.placeId ? toDbId(scope, stop.placeId) : null,
          kind: stop.kind ?? null,
          stop_index: stopIndex,
        });
      });
    });

    for (const item of trip.checklist) {
      flat.checklist_items.push({
        id: toDbId(scope, item.id),
        user_id: scope,
        trip_id: tripId,
        label: item.label,
        phase: item.phase,
        done: Boolean(item.done),
      });
    }
  }

  for (const txn of state.transactions) {
    flat.expenses.push(transactionToRow(scope, txn, tripIdsInState));
  }

  for (const saved of state.saved) {
    const savedId = toDbId(scope, saved.id);
    flat.saved_items.push({
      id: savedId,
      user_id: scope,
      kind: saved.kind,
      title: saved.title,
      meta: saved.meta ?? null,
      saved_at: saved.savedAt || null,
      source: saved.source ?? null,
      source_url: saved.sourceUrl ?? null,
    });
    for (const tripId of saved.tripIds ?? []) {
      // 只写出指向**真实存在**的 Trip 的关联：saved_item_trips.trip_id 是 FK，
      // 悬空 id 会让整批写入撞 23503。DELETE_TRIP 已负责清理，这里是兜底，
      // 保证任何来源（旧 localStorage 快照、并发删 Trip）都不会写出非法行。
      if (!tripIdsInState.has(tripId)) continue;
      flat.saved_item_trips.push({
        saved_item_id: savedId,
        trip_id: toDbId(scope, tripId),
        user_id: scope,
      });
    }
  }

  for (const inbox of state.inbox) {
    flat.inbox_items.push({
      id: toDbId(scope, inbox.id),
      user_id: scope,
      kind: inbox.kind,
      title: inbox.title,
      meta: inbox.meta ?? null,
      saved_at: inbox.savedAt || null,
      source: inbox.source ?? null,
      source_url: inbox.sourceUrl ?? null,
    });
  }

  for (const item of state.activity) {
    flat.activity.push({
      id: toDbId(scope, item.id),
      user_id: scope,
      text: item.text,
      at: item.at,
    });
  }

  for (const [key, rule] of Object.entries(state.merchantRules ?? {})) {
    flat.merchant_rules.push({
      user_id: scope,
      merchant_key: key,
      category: rule.category,
      subcategory: rule.subcategory ?? null,
    });
  }

  return flat;
}

function tripToRow(scope: string, trip: Trip, id: string): TripRow {
  return {
    id,
    user_id: scope,
    destination: trip.destination,
    name: trip.name ?? null,
    destination_id: trip.destinationId ?? null,
    destination_slug: trip.destinationSlug ?? null,
    destination_image: trip.destinationImage ?? null,
    country: trip.country || null,
    status: trip.status,
    start_date: trip.startDate || null,
    end_date: trip.endDate || null,
    currency: trip.currency,
    flight: trip.flight ?? null,
    budget_planned: trip.budgetPlanned ?? 0,
    flight_booked: Boolean(trip.flightBooked),
  };
}

function transactionToRow(scope: string, txn: Transaction, validTripIds: Set<string>): ExpenseRow {
  return {
    id: toDbId(scope, txn.id),
    user_id: scope,
    // tripId undefined = Unassigned（一等状态；删 Trip 只解绑，不删真实消费）。
    // 指向不存在 Trip 的悬空值同样降级为 null：expenses.trip_id 是 FK，
    // 悬空值会让整批写入撞 23503，而降级成 Unassigned 不会丢任何消费记录。
    trip_id: txn.tripId && validTripIds.has(txn.tripId) ? toDbId(scope, txn.tripId) : null,
    source: txn.source,
    source_transaction_id: txn.sourceTransactionId ?? null,
    merchant: txn.merchant ?? "",
    raw_merchant: txn.rawMerchant ?? null,
    occurred_at: txn.occurredAt || null,
    original_amount: optNum(txn.originalAmount),
    original_currency: txn.originalCurrency,
    converted_amount: optNum(txn.convertedAmount),
    converted_currency: txn.convertedCurrency ?? null,
    conversion_rate: optNum(txn.conversionRate),
    category: txn.category ?? null,
    subcategory: txn.subcategory ?? null,
    category_confidence: optNum(txn.categoryConfidence),
    trip_confidence: optNum(txn.tripConfidence),
    status: txn.status,
    paid_by: txn.paidBy ?? null,
    split_between: txn.splitBetween ?? [],
    split_mode: txn.splitMode ?? null,
    split_shares: txn.splitShares ?? null,
    note: txn.note ?? null,
    receipt_url: txn.receiptUrl ?? null,
    receipt_id: txn.receiptId ?? null,
    payment_method: txn.paymentMethod ?? null,
    // `expenses` 是唯一由客户端提供 created_at 的表（"capture 时刻"有语义）；
    // updated_at 一律由数据库 touch 触发器拥有。
    created_at:
      txn.createdAt || (txn.occurredAt ? `${txn.occurredAt}T00:00:00.000Z` : FALLBACK_TIMESTAMP),
  };
}

// ── assemble：13 组行 → WorkspaceState ──────────────────────────────────

/**
 * 组装工作区。父表先建、子表挂载；每组都**显式排序**，不依赖输入数组顺序 ——
 * 同一份行必须永远得到同一个状态对象，否则 diff 的基线会漂移并产生幻影写入。
 */
export function assembleWorkspace(scope: string, rows: FlatWorkspace): WorkspaceState {
  const travelerByTrip = groupBy(rows.trip_people, (r) => r.trip_id);
  const placeByTrip = groupBy(rows.places, (r) => r.trip_id);
  const stayByTrip = groupBy(rows.stays, (r) => r.trip_id);
  const dayByTrip = groupBy(rows.itinerary_days, (r) => r.trip_id);
  const stopByDay = groupBy(rows.itinerary_stops, (r) => r.day_id);
  const checklistByTrip = groupBy(rows.checklist_items, (r) => r.trip_id);

  const trips: Trip[] = sortDesc(rows.trips).map((row) => {
    const days: RouteDay[] = sortBy(dayByTrip.get(row.id) ?? [], (day) => day.day_index).map(
      (day) => ({
        id: fromDbId(scope, day.id),
        title: day.title,
        distanceKm: num(day.distance_km, 0),
        transitMin: num(day.transit_min, 0),
        stops: sortBy(stopByDay.get(day.id) ?? [], (stop) => stop.stop_index).map((stop) => ({
          id: fromDbId(scope, stop.id),
          name: stop.name,
          time: stop.time ?? "",
          note: stop.note ?? undefined,
          area: stop.area ?? undefined,
          placeId: stop.place_id ? fromDbId(scope, stop.place_id) : undefined,
          kind: stop.kind ?? undefined,
        })),
      }),
    );

    const travelers: Traveler[] = sortAsc(travelerByTrip.get(row.id) ?? []).map((person) => ({
      id: fromDbId(scope, person.id),
      name: person.name,
    }));

    const places: Place[] = sortAsc(placeByTrip.get(row.id) ?? []).map((place) => ({
      id: fromDbId(scope, place.id),
      name: place.name,
      kind: place.kind,
      area: place.area ?? undefined,
      note: place.note ?? undefined,
      status: place.status,
      fromSaved: place.from_saved || undefined,
    }));

    const hotels: Hotel[] = sortAsc(stayByTrip.get(row.id) ?? []).map((stay) => ({
      id: fromDbId(scope, stay.id),
      name: stay.name,
      pricePerNight: num(stay.price_per_night, 0),
      rating: optNum(stay.rating) ?? undefined,
      distanceKm: optNum(stay.distance_km) ?? undefined,
      breakfast: stay.breakfast ?? undefined,
      freeCancellation: stay.free_cancellation ?? undefined,
      preferred: stay.preferred || undefined,
      booked: stay.booked || undefined,
      nights: optNum(stay.nights) ?? undefined,
      area: stay.area ?? undefined,
      notes: stay.notes ?? undefined,
    }));

    const checklist: ChecklistItem[] = sortAsc(checklistByTrip.get(row.id) ?? []).map((item) => ({
      id: fromDbId(scope, item.id),
      label: item.label,
      phase: item.phase,
      done: Boolean(item.done),
    }));

    return {
      id: fromDbId(scope, row.id),
      destination: row.destination,
      name: row.name ?? undefined,
      destinationId: row.destination_id ?? undefined,
      destinationSlug: row.destination_slug ?? undefined,
      destinationImage: row.destination_image ?? undefined,
      country: row.country ?? "",
      status: row.status,
      startDate: dateOnly(row.start_date) ?? "",
      endDate: dateOnly(row.end_date) ?? "",
      currency: row.currency,
      flight: row.flight ?? undefined,
      budgetPlanned: num(row.budget_planned, 0),
      flightBooked: Boolean(row.flight_booked),
      travelers,
      places,
      hotels,
      routeDays: days,
      // Trip.expenses 是 v5 之前的旧存储；云端账本只有 transactions。
      expenses: [],
      checklist,
    };
  });

  // saved_item_trips → SavedItem.tripIds（保留 Saved 语义：加入 Trip 不删收藏）
  const tripIdsBySaved = new Map<string, string[]>();
  for (const link of rows.saved_item_trips) {
    const list = tripIdsBySaved.get(link.saved_item_id) ?? [];
    list.push(fromDbId(scope, link.trip_id));
    tripIdsBySaved.set(link.saved_item_id, list);
  }

  const saved: SavedItem[] = sortDesc(rows.saved_items).map((row) => {
    const tripIds = tripIdsBySaved.get(row.id) ?? [];
    return {
      id: fromDbId(scope, row.id),
      kind: row.kind,
      title: row.title,
      meta: row.meta ?? undefined,
      savedAt: dateOnly(row.saved_at) ?? "",
      source: row.source ?? undefined,
      sourceUrl: row.source_url ?? undefined,
      tripIds: tripIds.length > 0 ? tripIds : undefined,
    };
  });

  const inbox: InboxItem[] = sortDesc(rows.inbox_items).map((row) => ({
    id: fromDbId(scope, row.id),
    kind: row.kind,
    title: row.title,
    meta: row.meta ?? "",
    savedAt: dateOnly(row.saved_at) ?? "",
    source: row.source ?? undefined,
    sourceUrl: row.source_url ?? undefined,
  }));

  const activity: ActivityItem[] = sortDesc(rows.activity).map((row) => ({
    id: fromDbId(scope, row.id),
    text: row.text,
    at: row.at,
  }));

  const transactions: Transaction[] = sortDesc(rows.expenses).map((row) => rowToTransaction(scope, row));

  const merchantRules: Record<string, MerchantRule> = {};
  for (const row of rows.merchant_rules) {
    merchantRules[row.merchant_key] = {
      category: row.category as MerchantRule["category"],
      subcategory: row.subcategory ?? undefined,
    };
  }

  return { trips, saved, inbox, activity, transactions, merchantRules };
}

function rowToTransaction(scope: string, row: ExpenseRow): Transaction {
  const createdAt = row.created_at ?? FALLBACK_TIMESTAMP;
  return {
    id: fromDbId(scope, row.id),
    source: row.source,
    sourceTransactionId: row.source_transaction_id ?? undefined,
    merchant: row.merchant ?? "",
    rawMerchant: row.raw_merchant ?? undefined,
    occurredAt: dateOnly(row.occurred_at) ?? dateOnly(createdAt) ?? "",
    originalAmount: optNum(row.original_amount) ?? undefined,
    originalCurrency: row.original_currency,
    convertedAmount: optNum(row.converted_amount) ?? undefined,
    convertedCurrency: row.converted_currency ?? undefined,
    conversionRate: optNum(row.conversion_rate) ?? undefined,
    category: (row.category as Transaction["category"]) ?? null,
    subcategory: row.subcategory ?? undefined,
    categoryConfidence: optNum(row.category_confidence) ?? undefined,
    tripConfidence: optNum(row.trip_confidence) ?? undefined,
    tripId: row.trip_id ? fromDbId(scope, row.trip_id) : undefined,
    status: row.status,
    paidBy: row.paid_by ?? undefined,
    splitBetween: row.split_between ?? [],
    splitMode: row.split_mode ?? undefined,
    splitShares: row.split_shares ?? undefined,
    note: row.note ?? undefined,
    receiptUrl: row.receipt_url ?? undefined,
    receiptId: row.receipt_id ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    createdAt,
    // updated_at 由 touch 触发器改写；读出的是数据库的真实值。
    updatedAt: row.updated_at ?? createdAt,
  };
}

// ── 小工具 ──────────────────────────────────────────────────────────────

function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

type Dated = { id: string; created_at?: string | null };

/** created_at 升序（先创建在前）；缺值排最后，用 id 稳定收敛。 */
function sortAsc<T extends Dated>(items: T[]): T[] {
  return items.slice().sort((a, b) => compare(a, b));
}

/** created_at 降序（新在前）。 */
function sortDesc<T extends Dated>(items: T[]): T[] {
  return items.slice().sort((a, b) => compare(b, a));
}

/** 显式序号列（day_index / stop_index）—— 这两个表唯一的顺序真相。 */
function sortBy<T>(items: T[], keyOf: (item: T) => number): T[] {
  return items.slice().sort((a, b) => keyOf(a) - keyOf(b));
}

function compare(a: Dated, b: Dated): number {
  const at = a.created_at ?? FALLBACK_TIMESTAMP;
  const bt = b.created_at ?? FALLBACK_TIMESTAMP;
  if (at !== bt) return at < bt ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

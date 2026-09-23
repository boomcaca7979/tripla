/**
 * workspace/remote — 已登录用户通道（Supabase，唯一 source of truth）。
 *
 * 读：一次并行拉 13 张表 → assembleWorkspace，得到干净的 WorkspaceState。
 *     全部过滤交给 RLS（`user_id = auth.uid()` + 子表的 `owns_trip(trip_id)`）；
 *     客户端**不做**也不应该做用户隔离，这里多写的 `.eq("user_id", …)` 只是为了
 *     让意图在代码里可读，它不构成安全边界。
 *
 * 写：只走 applyRemoteChanges —— 逐行 upsert/delete 的增量，而不是整库重写。
 *     父表先写、子表后写；删除反向（先子后父）。任何一个请求失败立即抛出，
 *     且**不推进基线**，于是下一次提交会从同一个基线重新算增量并重试，最终收敛。
 *
 * 为什么不用 realtime：本阶段不做跨标签页实时同步（产品上还没有并发编辑需求），
 * 订阅会引入第二套状态源，而当前的首要目标是「云端是唯一真相」这一条能被验证。
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceChanges } from "./diff";
import { assembleWorkspace, idScope } from "./mappers";
import type { FlatWorkspace, WorkspaceTable } from "./types";

/** 一次同步失败：带上表名与操作，避免只看到 "Failed to fetch" 这种无法定位的信息。 */
export class WorkspaceSyncError extends Error {
  readonly table: string;
  readonly operation: string;
  readonly code: string | undefined;

  constructor(table: string, operation: string, message: string, code?: string) {
    super(`${operation} on "${table}" failed: ${message}`);
    this.name = "WorkspaceSyncError";
    this.table = table;
    this.operation = operation;
    this.code = code;
  }
}

interface OrderSpec {
  column: string;
  ascending: boolean;
}

/**
 * 读取时的排序。注意它只保证**确定性**，真正的顺序真相由 assembleWorkspace
 * 的显式排序决定（`day_index` / `stop_index` / `created_at`）。
 */
const LOAD_ORDER: Record<WorkspaceTable, OrderSpec | null> = {
  trips: { column: "created_at", ascending: false },
  places: { column: "created_at", ascending: true },
  stays: { column: "created_at", ascending: true },
  itinerary_days: { column: "day_index", ascending: true },
  itinerary_stops: { column: "stop_index", ascending: true },
  expenses: { column: "created_at", ascending: false },
  trip_people: { column: "created_at", ascending: true },
  checklist_items: { column: "created_at", ascending: true },
  saved_items: { column: "created_at", ascending: false },
  saved_item_trips: null,
  inbox_items: { column: "created_at", ascending: false },
  activity: { column: "created_at", ascending: false },
  merchant_rules: null,
};

/** upsert 的冲突目标（必须与数据库的主键/唯一约束一致）。 */
const CONFLICT_TARGET: Record<WorkspaceTable, string> = {
  trips: "id",
  places: "id",
  stays: "id",
  itinerary_days: "id",
  itinerary_stops: "id",
  expenses: "id",
  trip_people: "id",
  checklist_items: "id",
  saved_items: "id",
  saved_item_trips: "saved_item_id,trip_id",
  inbox_items: "id",
  activity: "id",
  merchant_rules: "user_id,merchant_key",
};

/** upsert 顺序：父表先写，子表引用的外键必须已经存在。 */
const UPSERT_ORDER: WorkspaceTable[] = [
  "trips",
  "trip_people",
  "places",
  "stays",
  "itinerary_days",
  "itinerary_stops",
  "checklist_items",
  "expenses",
  "saved_items",
  "saved_item_trips",
  "inbox_items",
  "activity",
  "merchant_rules",
];

/** delete 顺序：先清子表，再删父表（不依赖数据库级联，保持确定性）。 */
const DELETE_ORDER: WorkspaceTable[] = [
  "itinerary_stops",
  "saved_item_trips",
  "places",
  "stays",
  "itinerary_days",
  "trip_people",
  "checklist_items",
  "expenses",
  "saved_items",
  "inbox_items",
  "activity",
  "merchant_rules",
  "trips",
];

/** `created_at` / `updated_at` 归数据库所有（default now() + touch 触发器）。 */
function preparedPayload(table: WorkspaceTable, value: object): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...value };
  delete payload.updated_at;
  // expenses 是唯一例外：created_at 表达「capture 时刻」，由客户端提供。
  if (table !== "expenses") delete payload.created_at;
  return payload;
}

async function fetchTable<T>(
  client: SupabaseClient,
  table: WorkspaceTable,
): Promise<T[]> {
  const order = LOAD_ORDER[table];
  let query = client.from(table).select("*");
  if (order) query = query.order(order.column, { ascending: order.ascending });
  const { data, error } = await query;
  if (error) throw new WorkspaceSyncError(table, "select", error.message, error.code);
  return (data ?? []) as unknown as T[];
}

/**
 * 拉取整个工作区。空库返回空工作区（不是 null）——调用方需要一个确定的基线。
 */
export async function loadRemoteWorkspace(userId: string): Promise<WorkspaceState> {
  const client = createClient();
  const scope = idScope(userId);

  const [
    trips,
    places,
    stays,
    itinerary_days,
    itinerary_stops,
    expenses,
    trip_people,
    checklist_items,
    saved_items,
    saved_item_trips,
    inbox_items,
    activity,
    merchant_rules,
  ] = await Promise.all([
    fetchTable<FlatWorkspace["trips"][number]>(client, "trips"),
    fetchTable<FlatWorkspace["places"][number]>(client, "places"),
    fetchTable<FlatWorkspace["stays"][number]>(client, "stays"),
    fetchTable<FlatWorkspace["itinerary_days"][number]>(client, "itinerary_days"),
    fetchTable<FlatWorkspace["itinerary_stops"][number]>(client, "itinerary_stops"),
    fetchTable<FlatWorkspace["expenses"][number]>(client, "expenses"),
    fetchTable<FlatWorkspace["trip_people"][number]>(client, "trip_people"),
    fetchTable<FlatWorkspace["checklist_items"][number]>(client, "checklist_items"),
    fetchTable<FlatWorkspace["saved_items"][number]>(client, "saved_items"),
    fetchTable<FlatWorkspace["saved_item_trips"][number]>(client, "saved_item_trips"),
    fetchTable<FlatWorkspace["inbox_items"][number]>(client, "inbox_items"),
    fetchTable<FlatWorkspace["activity"][number]>(client, "activity"),
    fetchTable<FlatWorkspace["merchant_rules"][number]>(client, "merchant_rules"),
  ]);

  return assembleWorkspace(scope, {
    trips,
    places,
    stays,
    itinerary_days,
    itinerary_stops,
    expenses,
    trip_people,
    checklist_items,
    saved_items,
    saved_item_trips,
    inbox_items,
    activity,
    merchant_rules,
  });
}

/** 把一份增量写到云端。失败抛出，调用方负责不推进基线并如实告知用户。 */
export async function applyRemoteChanges(
  userId: string,
  changes: WorkspaceChanges,
): Promise<void> {
  const client = createClient();

  for (const table of UPSERT_ORDER) {
    const rows = changes.upserts[table];
    if (rows.length === 0) continue;
    const payload = rows.map((row) => preparedPayload(table, row));
    const { error } = await client
      .from(table)
      .upsert(payload, { onConflict: CONFLICT_TARGET[table] });
    if (error) throw new WorkspaceSyncError(table, "upsert", error.message, error.code);
  }

  for (const table of DELETE_ORDER) {
    const rows = changes.removed[table];
    if (rows.length === 0) continue;
    await deleteRows(client, userId, table, rows);
  }
}

async function deleteRows(
  client: SupabaseClient,
  userId: string,
  table: WorkspaceTable,
  rows: object[],
): Promise<void> {
  if (table === "saved_item_trips") {
    // 复合主键：逐条删除。`.in("saved_item_id", …).in("trip_id", …)` 会误删
    // 两者的叉积组合（别的 Trip 的链接），因此不能那样批量。
    await Promise.all(
      rows.map(async (row) => {
        const link = row as { saved_item_id: string; trip_id: string };
        const { error } = await client
          .from(table)
          .delete()
          .eq("user_id", userId)
          .eq("saved_item_id", link.saved_item_id)
          .eq("trip_id", link.trip_id);
        if (error) throw new WorkspaceSyncError(table, "delete", error.message, error.code);
      }),
    );
    return;
  }

  if (table === "merchant_rules") {
    const keys = rows.map((row) => (row as { merchant_key: string }).merchant_key);
    const { error } = await client.from(table).delete().eq("user_id", userId).in("merchant_key", keys);
    if (error) throw new WorkspaceSyncError(table, "delete", error.message, error.code);
    return;
  }

  const ids = rows.map((row) => (row as { id: string }).id);
  const { error } = await client.from(table).delete().eq("user_id", userId).in("id", ids);
  if (error) throw new WorkspaceSyncError(table, "delete", error.message, error.code);
}

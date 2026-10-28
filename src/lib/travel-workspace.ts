"use client";

/**
 * travel-workspace — /trips 工作区的**跨页面写入口适配层**。
 *
 * Destinations 等外部页面的 Save / Add to Trip 动作经由此模块落库。
 * 本模块存在的唯一理由是「把意图与持久化通道解耦」：
 *
 *   调用方只声明 **意图**（Save / Add to Trip / Create Trip / Inbox）与当前 **mode**
 *     guest  → localStorage（`src/lib/workspace/guest.ts`，唯一的匿名存储持有者）
 *     remote → Supabase（`src/lib/workspace/*`，RLS 以 auth.uid() 为边界）
 *
 * 三件本模块**刻意不做**的事：
 *
 *  1. **不自己读写 localStorage。** 存储 key 只由 `workspace/guest.ts` 持有。
 *     旧实现（本文件上一版）直接 `window.localStorage.getItem("utripla.trips.workspace.v5")`，
 *     这正是「外部页写本地 / /trips 写云端」双真相的来源。
 *  2. **不自己实现业务语义。** 一律经 `workspaceReducer` 的 `SAVE_AND_ADD_TO_TRIP` /
 *     `ADD_SAVED` / `ADD_INBOX_ITEM` / `CREATE_TRIP`，与 /trips 内页共用同一份实现。
 *     旧实现复制了一份 CREATE_TRIP 的默认值（且把 currency 写成符号 "¥"，与
 *     「currency 一律存 ISO 代码」的约定相悖），现在这类漂移在结构上不可能发生。
 *  3. **不做匿名数据搬迁。** 登录不会把浏览器里的匿名草稿上传到云端（见 workspace/index.ts）。
 *
 * 失败一律**显式返回**（`ok: false`），绝不回落到 localStorage 假装成功：
 * 那会让用户以为「已保存到账号」，而实际只写进了这台浏览器。
 *
 * 无内部状态：每次调用都是「读 → reduce → 提交」的完整一轮，因此不存在
 * 跨 mode 的缓存泄漏（切换账号后不会读到上一个人的内存状态）。
 */

import type { InboxKind, PlaceKind } from "@/components/trips/workspace/types";
import type { Itinerary, ItineraryDay } from "@/types/itinerary";
import { getSessionIdentity } from "./use-session";
import { tripInputIssue } from "./itinerary-input";
import type { WorkspaceMode } from "./workspace";

// ── 按需加载 ───────────────────────────────────────────────────────────
//
// reducer（含 expenses 引擎）与 workspace 数据层合计约 85KB 源码。它们对
// Destinations 等外部页的**首屏**没有价值——用户不点 Save 就不需要。因此只在
// 第一次真正发生写/读动作时拉取，避免把所有外部页面的初始 JS 撑大。
// （Supabase 客户端本身已由全局 Header 的 useSession 加载，这里不含额外成本。）

type WorkspaceRuntime = {
  loadWorkspace: (mode: WorkspaceMode) => Promise<import("@/components/trips/workspace/types").WorkspaceState>;
  commitWorkspace: (
    mode: WorkspaceMode,
    prev: import("@/components/trips/workspace/types").WorkspaceState,
    next: import("@/components/trips/workspace/types").WorkspaceState,
  ) => Promise<void>;
  workspaceReducer: (
    state: import("@/components/trips/workspace/types").WorkspaceState,
    action: import("@/components/trips/workspace/types").WorkspaceAction,
  ) => import("@/components/trips/workspace/types").WorkspaceState;
  localId: (prefix: string) => string;
  tripNameTaken: (trip: import("@/components/trips/workspace/types").Trip, title: string) => boolean;
};

let runtimePromise: Promise<WorkspaceRuntime> | null = null;

function runtime(): Promise<WorkspaceRuntime> {
  runtimePromise ??= Promise.all([
    import("./workspace"),
    import("@/components/trips/workspace/logic"),
  ]).then(([ws, logic]) => ({
    loadWorkspace: ws.loadWorkspace,
    commitWorkspace: ws.commitWorkspace,
    workspaceReducer: logic.workspaceReducer,
    localId: logic.localId,
    tripNameTaken: logic.tripNameTaken,
  }));
  return runtimePromise;
}

// ── 模式 ──────────────────────────────────────────────────────────────

export type PageMode = WorkspaceMode;

/**
 * 动作发生的那一刻解析身份 → mode。
 *
 * 在点击时读一次，而不是在组件里 `useSession()`：
 * 这些触发器位于列表行内，一页可能挂载几十个实例，每个 `useSession()` 都会
 * 开自己的 auth 订阅——为一个事实开 N 个订阅没有意义。
 *
 * 返回 `null` 表示**身份无法确认**（会话读取失败）。此时必须拒绝写入，
 * 不能退化成 guest：那会把已登录用户的这次 Save 静默写进 localStorage，
 * 而用户以为自己保存到了账号。调用方拿到 null 应提示「还在确认登录状态」，
 * 不要乐观置成功态。
 */
export async function resolvePageMode(): Promise<PageMode | null> {
  const identity = await getSessionIdentity();
  if (!identity.resolved) return null;
  return identity.userId ? { kind: "remote", userId: identity.userId } : { kind: "guest" };
}

// ── 结果类型（失败显式） ────────────────────────────────────────────────

export type PageFailure =
  /** 目标 Trip 不存在（可能刚被删除） */
  | { ok: false; reason: "no-trip" }
  /** 会话尚未解析：不写入，也不假装成功 */
  | { ok: false; reason: "not-ready" }
  /** 真实写入失败（配额/隐私模式/网络/RLS/约束）—— 已带出 PostgREST code */
  | { ok: false; reason: "write-failed"; message: string; code?: string };

export type PageSaveResult = { ok: true; id: string | null } | PageFailure;
export type PageAddToTripResult = { ok: true; status: "added" | "exists" } | PageFailure;
export type PageCreateTripResult = { ok: true; id: string } | PageFailure;
export type PageInboxResult = { ok: true } | PageFailure;

function writeFailed(error: unknown): PageFailure {
  // 不吞错：把 PostgREST/Supabase 的 code 带出来，好让日志与调用方能分辨
  // 「网络抖了一下」（无 code）与「这不是你的数据」（RLS 拒绝 = 42501）。
  const raw =
    error && typeof error === "object" && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;
  const code = raw === undefined || raw === null ? undefined : String(raw);
  return {
    ok: false,
    reason: "write-failed",
    message: error instanceof Error ? error.message : String(error),
    code: code || undefined,
  };
}

// ── kind 归一（外部页词表 → 工作区词表） ────────────────────────────────

/** 外部页可收藏的对象类型（AddToTripButton / WorkspaceActions 的入参）。 */
export type PageKind = "place" | "hotel" | "activity" | "guide" | "restaurant";

/**
 * 外部页 kind → SavedItem.kind。
 *
 * 必须在边界处归一，不能把 "restaurant" 直接写进 Saved：
 *  - `saved_items.kind` 的 CHECK 只允许 place/hotel/activity/guide，
 *    写 "restaurant" 会被数据库以 23514 拒绝 → 该次写入整体失败；
 *  - `SavedItem.kind` 的类型本来就只有这 4 个值（旧实现存 "restaurant"
 *    既骗过了类型、又会写挂云端）。
 * 餐厅在收藏库里属于「地点」，Trip 内的细分（food）见 pageKindToPlaceKind。
 */
export function pageKindToSavedKind(kind: PageKind): InboxKind {
  return kind === "restaurant" ? "place" : kind;
}

/** 外部页 kind → Trip 内 Place.kind（places.kind 的 CHECK: sight/food/activity/nature/shopping）。 */
export function pageKindToPlaceKind(kind: PageKind): PlaceKind {
  if (kind === "restaurant") return "food";
  if (kind === "activity") return "activity";
  return "sight";
}

export interface PageSavedInput {
  kind: PageKind;
  title: string;
  meta?: string;
  source: string;
  sourceUrl?: string;
}

function savedItemOf(input: PageSavedInput, savedAt: string) {
  return {
    kind: pageKindToSavedKind(input.kind),
    title: input.title,
    meta: input.meta,
    savedAt,
    source: input.source,
    sourceUrl: input.sourceUrl,
  };
}

// ── 读 ────────────────────────────────────────────────────────────────

export interface TripOption {
  id: string;
  destination: string;
  currency: string;
  /** 该 Trip 内是否已有同名条目（Modal 的「✓ In trip」判定） */
  hasItem: boolean;
}

/**
 * Trip 概要列表（Add to Trip Modal 用）。
 *
 * 传入 `title` 时一并算出「已加入」判定：一次 IO 拿到整屏所需信息，
 * 避免旧实现那样在 render 里对每一行同步读一次 localStorage。
 */
export async function readTripOptions(mode: PageMode, title?: string): Promise<TripOption[]> {
  const { loadWorkspace, tripNameTaken } = await runtime();
  const state = await loadWorkspace(mode);
  return state.trips
    .filter((t) => typeof t.id === "string" && typeof t.destination === "string")
    .map((t) => ({
      id: t.id,
      destination: t.destination,
      currency: t.currency || "CNY",
      hasItem: title ? tripNameTaken(t, title) : false,
    }));
}

// ── 写 ────────────────────────────────────────────────────────────────

/**
 * Save（只进收藏库，不进任何 Trip）。幂等：同 title（大小写不敏感）+ 同 kind
 * 只刷新来源信息，与数据库唯一索引 saved_items_user_title_kind_key 同口径。
 */
export async function savePageItem(
  mode: PageMode,
  input: PageSavedInput,
): Promise<PageSaveResult> {
  const { loadWorkspace, commitWorkspace, workspaceReducer } = await runtime();
  const savedKind = pageKindToSavedKind(input.kind);
  let prev;
  try {
    prev = await loadWorkspace(mode);
  } catch (error) {
    return writeFailed(error);
  }
  const next = workspaceReducer(prev, {
    type: "ADD_SAVED",
    item: savedItemOf(input, new Date().toISOString()),
  });
  try {
    await commitWorkspace(mode, prev, next);
  } catch (error) {
    return writeFailed(error);
  }
  const saved = next.saved.find(
    (s) => s.kind === savedKind && s.title.toLowerCase() === input.title.toLowerCase(),
  );
  return { ok: true, id: saved?.id ?? null };
}

/**
 * Add to Trip —— 「加入 Trip + 顺手收藏」的原子动作。
 *
 * 语义完全由 reducer 的 SAVE_AND_ADD_TO_TRIP 承担（Saved 幂等 upsert → 关联 →
 * Trip 内新增）；`status` 由 reducer 之后的**真实状态**推出，而不是由调用方
 * 事先读到的东西猜——并发下先读到的状态可能已经过期。
 */
export async function addPageItemToTrip(
  mode: PageMode,
  tripId: string,
  input: PageSavedInput,
): Promise<PageAddToTripResult> {
  const { loadWorkspace, commitWorkspace, workspaceReducer } = await runtime();
  let prev;
  try {
    prev = await loadWorkspace(mode);
  } catch (error) {
    return writeFailed(error);
  }
  const trip = prev.trips.find((t) => t.id === tripId);
  if (!trip) return { ok: false, reason: "no-trip" };

  const before = trip.places.length + trip.hotels.length;
  const next = workspaceReducer(prev, {
    type: "SAVE_AND_ADD_TO_TRIP",
    tripId,
    ...savedItemOf(input, new Date().toISOString()),
    placeKind: pageKindToPlaceKind(input.kind),
  });
  try {
    await commitWorkspace(mode, prev, next);
  } catch (error) {
    return writeFailed(error);
  }
  const after = next.trips.find((t) => t.id === tripId);
  const added = after ? after.places.length + after.hotels.length > before : false;
  return { ok: true, status: added ? "added" : "exists" };
}

/**
 * 外部页「新建 Trip 并加入」。默认值与 /trips 的 CREATE_TRIP 完全一致
 * （travelers = You、空容器、currency = ISO 代码 CNY），不再是复制的第二份实现。
 *
 * 与旧实现的差别（修正）：旧版要求 localStorage 里**已经**存在工作区快照，
 * 否则 `Create & add` 静默什么都不做 —— 新访客无法从详情页创建第一个 Trip。
 */
export async function createPageTrip(
  mode: PageMode,
  destination: string,
  startDate: string,
  endDate: string,
): Promise<PageCreateTripResult> {
  const { loadWorkspace, commitWorkspace, workspaceReducer, localId } = await runtime();
  let prev;
  try {
    prev = await loadWorkspace(mode);
  } catch (error) {
    return writeFailed(error);
  }
  const name = destination.trim();
  // 按名称匹配真实 Destination（蓝图 #5/#8）：destinationId/slug/country/image 快照
  const { DESTINATIONS } = await import("@/data/destinations");
  const dest = DESTINATIONS.find((d) => d.city.toLowerCase() === name.toLowerCase());
  const id = localId("trip");
  const next = workspaceReducer(prev, {
    type: "CREATE_TRIP",
    id,
    destination: name,
    destinationId: dest?.slug,
    startDate,
    endDate,
    travelers: 1,
    currency: "CNY",
  });
  try {
    await commitWorkspace(mode, prev, next);
  } catch (error) {
    return writeFailed(error);
  }
  return { ok: true, id };
}

// ── AI Itinerary → 工作区 Trip（/plan、/share 的 Save Itinerary） ────────

/**
 * AI 行程（/api/itinerary 产物）里的时间表达 → RouteStop.time（"09:00" 24h 制）。
 * AI 只给出时段（morning/afternoon/evening/night），不给出钟点；
 * 这里映射为该时段的代表钟点，用户可在工作台 Route 页继续调整。
 */
const ACTIVITY_TIME: Record<ItineraryDay["activities"][number]["timeOfDay"], string> = {
  morning: "09:00",
  afternoon: "13:00",
  evening: "18:00",
  night: "21:00",
};

const MEAL_TIME: Record<keyof ItineraryDay["meals"], string> = {
  breakfast: "08:00",
  lunch: "12:30",
  dinner: "19:00",
};

/** 由一天的数据推导 RouteStop 序列（按时间排序，行程读起来是按时间推进的）。 */
function plannedStopsOf(day: ItineraryDay): Array<{
  name: string;
  time: string;
  kind: "activity" | "meal";
  note?: string;
}> {
  const stops: Array<{ name: string; time: string; kind: "activity" | "meal"; note?: string }> = [];
  for (const meal of ["breakfast", "lunch", "dinner"] as const) {
    const suggestion = day.meals?.[meal];
    if (suggestion) {
      stops.push({ name: suggestion, time: MEAL_TIME[meal], kind: "meal" });
    }
  }
  for (const activity of Array.isArray(day.activities) ? day.activities : []) {
    const note = [activity.description, activity.tip ? `Tip: ${activity.tip}` : null]
      .filter(Boolean)
      .join(" · ");
    stops.push({
      name: activity.name,
      time: ACTIVITY_TIME[activity.timeOfDay] ?? "12:00",
      kind: "activity",
      note: note || undefined,
    });
  }
  return stops.sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Save Itinerary —— 把一份 AI 生成的 Itinerary 保存为工作区里的一个真实 Trip。
 *
 * 业务语义全部经既有 reducer（CREATE_TRIP → ADD_ROUTE_DAY → ADD_STOP），
 * 持久化完全走既有的 load/commit 双通道：guest → localStorage，登录 → Supabase。
 * 行程的 days/activities/meals 映射为 Trip 的 routeDays/stops（时间、备注保留），
 * 偏好（style/budget/interests/travelers）映射进 Trip.preferences。
 *
 * 说明：
 *  - 每次 Save 都创建一个新 Trip（AI 重新生成会得到新 id）。同一浏览器内的
 *    重复保存由调用方的 savedItineraries 标记挡住；换设备对同一分享链接再保存
 *    会得到一个新 Trip —— 这是「保存一份计划」的自然语义，不做合并猜测。
 *  - 内容映射：days/activities/meals → routeDays/stops；packingList → 既有
 *    Checklist（before 阶段，可见可勾选）；summary / importantNotes → 既有
 *    preferences JSONB 扩展 key（当前无 UI 渲染，数据不丢）。AI 的预计费用
 *    不进 expenses/transactions 账本（预算 ≠ 真实消费）。
 *
 * 失败显式返回（PageFailure），调用方不得在失败时显示成功状态。
 */
export async function savePageItinerary(
  mode: PageMode,
  itinerary: Itinerary,
): Promise<PageCreateTripResult> {
  const { loadWorkspace, commitWorkspace, workspaceReducer, localId } = await runtime();
  let prev;
  try {
    prev = await loadWorkspace(mode);
  } catch (error) {
    return writeFailed(error);
  }

  // 分享链接与页面展示共用同一条「必要字段」规则（见 lib/itinerary-input.ts）：
  // 缺 input / 目的地 / 日期，或日期不是 YYYY-MM-DD 日历日时，无法建立一条合法的
  // Trip（会写下无目的地、无日期的行，或让 routeDays 落在无效日期上）。
  // 因此**明确失败**，让调用方保持可重试状态，而不是抛异常导致"点了 Save 什么都不发生"。
  const issue = tripInputIssue(itinerary);
  if (issue) {
    return writeFailed(new Error(issue.message));
  }
  const input = itinerary.input;
  // 同源问题：数组字段可能不存在。缺失按空数组处理（不补造内容）。
  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  const packingList = Array.isArray(itinerary.packingList) ? itinerary.packingList : [];
  const importantNotes = Array.isArray(itinerary.importantNotes) ? itinerary.importantNotes : [];

  const city = input.destination.city?.trim() || input.destination.name;
  // 与 createPageTrip 同口径：按城市名匹配真实 Destination，快照 slug/country/image
  const { DESTINATIONS } = await import("@/data/destinations");
  const dest = DESTINATIONS.find((d) => d.city.toLowerCase() === city.toLowerCase());

  const travelers = Number.isFinite(input.groupSize) && input.groupSize > 0 ? input.groupSize : 1;
  const tripId = localId("trip");
  let next = workspaceReducer(prev, {
    type: "CREATE_TRIP",
    id: tripId,
    destination: city,
    destinationId: dest?.slug,
    startDate: input.departureDate,
    endDate: input.returnDate,
    travelers,
    // 币种沿用行程自带的 ISO 代码；缺失时退回目的地数据集的计价币种，
    // 再退回 USD —— 绝不写入空字符串（会让 money() 渲染出裸数字）。
    currency: (itinerary.currency ?? "").trim() || dest?.budgetCurrency || "USD",
    preferences: {
      travelStyle: input.travelStyle,
      budgetLevel: input.budgetLevel,
      interests: Array.isArray(input.interests) ? [...input.interests] : [],
      travelers,
      // 行程级文本内容随既有 preferences JSONB 保存（不静默丢弃）：
      // summary / importantNotes 当前无 UI 渲染，packingList 走下方 Checklist。
      summary: itinerary.summary?.trim() || undefined,
      importantNotes: importantNotes.length
        ? importantNotes.map((n) => n.trim()).filter(Boolean)
        : undefined,
    },
  });

  for (const day of days) {
    const stops = plannedStopsOf(day);
    if (stops.length === 0) {
      next = workspaceReducer(next, { type: "ADD_ROUTE_DAY", tripId });
      continue;
    }
    next = workspaceReducer(next, { type: "ADD_ROUTE_DAY", tripId, firstStop: stops[0] });
    // ADD_ROUTE_DAY 把新 Day 追加在末尾并自生成 id —— 从真实状态读回，
    // 与 addPageItemToTrip 的「由 reducer 之后的状态推导」同一纪律。
    const routeDays = next.trips.find((t) => t.id === tripId)?.routeDays ?? [];
    const dayId = routeDays[routeDays.length - 1]?.id;
    if (!dayId) break;
    for (const stop of stops.slice(1)) {
      next = workspaceReducer(next, { type: "ADD_STOP", tripId, dayId, ...stop });
    }
  }

  // packingList → 既有 Checklist（"Before trip" 阶段）：AI 建议的行李清单
  // 进入用户既有的清单结构，可见、可勾选、可编辑。空行过滤；语义是
  // 「AI 建议的待办」，不是真实消费，绝不进 expenses/transactions 账本。
  for (const raw of packingList) {
    const label = raw.trim();
    if (label) {
      next = workspaceReducer(next, { type: "ADD_CHECKLIST", tripId, label, phase: "before" });
    }
  }

  try {
    await commitWorkspace(mode, prev, next);
  } catch (error) {
    return writeFailed(error);
  }
  return { ok: true, id: tripId };
}

/**
 * Inbox 快速捕获（跨 Trip 的「还没整理」灵感）。
 * 目前没有页面调用它；保留为经数据层实现的正式入口，而不是留着旧版的
 * 直写 localStorage 版本当死代码。
 */
export async function addInboxItem(mode: PageMode, input: PageSavedInput): Promise<PageInboxResult> {
  const { loadWorkspace, commitWorkspace, workspaceReducer } = await runtime();
  let prev;
  try {
    prev = await loadWorkspace(mode);
  } catch (error) {
    return writeFailed(error);
  }
  const next = workspaceReducer(prev, {
    type: "ADD_INBOX_ITEM",
    item: {
      kind: input.kind === "restaurant" ? "place" : input.kind,
      title: input.title,
      meta: input.meta ?? input.source,
      savedAt: new Date().toISOString(),
      source: input.source,
      sourceUrl: input.sourceUrl,
    },
  });
  try {
    await commitWorkspace(mode, prev, next);
  } catch (error) {
    return writeFailed(error);
  }
  return { ok: true };
}

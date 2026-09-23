"use client";

/**
 * travel-workspace — /trips 工作区的**跨页面写入口适配层**。
 *
 * Destinations / Guides 等外部页面的 Save / Add to Trip 动作经由此模块落库。
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
import { getSessionIdentity } from "./use-session";
import type { WorkspaceMode } from "./workspace";

// ── 按需加载 ───────────────────────────────────────────────────────────
//
// reducer（含 expenses 引擎）与 workspace 数据层合计约 85KB 源码。它们对
// Destinations / Guides 的**首屏**没有价值——用户不点 Save 就不需要。因此只在
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

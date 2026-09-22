"use client";

/**
 * travel-workspace — /trips 工作区的跨页面共享访问层。
 *
 * /trips App 的数据存在 localStorage（key: utripla.trips.workspace.v5）。
 * Destinations / Guides 等外部页面的 Save / Add to Trip 动作通过本模块
 * 直接读写同一份存储，用户导航回 /trips 时由 TripsWorkspace 的挂载
 * RESTORE 恢复——全程不需要全局状态库。
 *
 * 设计约束：
 *  - 只做最小写入（upsert Saved / 追加 Inbox / 追加 Trip 内容），不复制 reducer；
 *  - 去重：同 title（casefold）+ 同 kind 视为同一条收藏，只更新来源信息；
 *  - 所有函数在 SSR / 隐私模式（localStorage 不可用）下安全 no-op。
 */

export const WORKSPACE_KEY = "utripla.trips.workspace.v5";

export interface WorkspaceLike {
  trips: unknown[];
  saved: unknown[];
  inbox: unknown[];
  activity: unknown[];
}

function safeParse(raw: string): WorkspaceLike | null {
  try {
    const parsed = JSON.parse(raw) as WorkspaceLike;
    if (
      parsed &&
      Array.isArray(parsed.trips) &&
      Array.isArray(parsed.saved) &&
      Array.isArray(parsed.inbox) &&
      Array.isArray(parsed.activity)
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function read(): WorkspaceLike {
  if (typeof window === "undefined") return { trips: [], saved: [], inbox: [], activity: [] };
  const raw = window.localStorage.getItem(WORKSPACE_KEY);
  if (raw) {
    const parsed = safeParse(raw);
    if (parsed) return parsed;
  }
  return { trips: [], saved: [], inbox: [], activity: [] };
}

function write(state: WorkspaceLike): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式 / 配额满：静默
  }
}

export interface PageSavedInput {
  kind: "place" | "hotel" | "activity" | "guide" | "restaurant";
  title: string;
  meta?: string;
  source: string;
  sourceUrl?: string;
}

/** 幂等 upsert：已存在（同 title+kind）只刷新来源，不重复插入。返回 item id。 */
export function upsertSavedItem(input: PageSavedInput): string | null {
  const state = read();
  const existing = state.saved as Array<Record<string, unknown>>;
  const found = existing.find(
    (s) =>
      typeof s.title === "string" &&
      s.title.toLowerCase() === input.title.toLowerCase() &&
      s.kind === input.kind,
  );
  if (found) {
    found.source = input.source;
    found.sourceUrl = input.sourceUrl;
    if (input.meta) found.meta = input.meta;
    write(state);
    return typeof found.id === "string" ? found.id : null;
  }
  const id = `sv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  existing.unshift({
    id,
    kind: input.kind,
    title: input.title,
    meta: input.meta,
    savedAt: new Date().toISOString(),
    source: input.source,
    sourceUrl: input.sourceUrl,
  });
  write(state);
  return id;
}

/** Inbox 快速捕获（外部页未来可用；当前 /trips 手动入口共用结构）。 */
export function addInboxItem(input: PageSavedInput): void {
  const state = read();
  (state.inbox as unknown[]).unshift({
    id: `in-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    kind: input.kind === "restaurant" ? "activity" : input.kind,
    title: input.title,
    meta: input.meta ?? input.source,
    savedAt: new Date().toISOString(),
    source: input.source,
    sourceUrl: input.sourceUrl,
  });
  write(state);
}

/** 读取用户 Trip 概要（供外部页 Add to Trip Modal 列表）。 */
export function readTripOptions(): Array<{ id: string; destination: string; currency: string }> {
  const state = read();
  return (state.trips as Array<Record<string, unknown>>)
    .filter((t) => typeof t.id === "string" && typeof t.destination === "string")
    .map((t) => ({
      id: t.id as string,
      destination: t.destination as string,
      currency: typeof t.currency === "string" ? t.currency : "¥",
    }));
}

/** 读取某 Trip 已收藏的名称集合（Modal 内显示已加入态）。 */
export function tripHasItem(tripId: string, title: string): boolean {
  const state = read();
  const trip = (state.trips as Array<Record<string, unknown>>).find((t) => t.id === tripId);
  if (!trip) return false;
  const places = (trip.places ?? []) as Array<{ name?: string }>;
  const hotels = (trip.hotels ?? []) as Array<{ name?: string }>;
  const lower = title.toLowerCase();
  const nameOf = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : "");
  return places.some((p) => nameOf(p.name) === lower) || hotels.some((h) => nameOf(h.name) === lower);
}

export interface AddToTripResult {
  ok: boolean;
  /** "added" = 新加入；"exists" = Trip 里已有同名条目 */
  status?: "added" | "exists";
  /** 无该 Trip */
  reason?: "no-trip";
}

/** 外部页 "Add to Trip"：写入 Trip 的 places / hotels，并 upsert Saved（tripIds 记录）。 */
export function addPageItemToTrip(tripId: string, input: PageSavedInput): AddToTripResult {
  const state = read();
  const trip = (state.trips as Array<Record<string, unknown>>).find((t) => t.id === tripId);
  if (!trip) return { ok: false, reason: "no-trip" };

  if (tripHasItem(tripId, input.title)) {
    // 已在 Trip：只确保 Saved 里有这条（来源记录），不动 Trip
    upsertSavedItem(input);
    const saved = state.saved as Array<Record<string, unknown>>;
    const lowerTitle = input.title.toLowerCase();
    const found = saved.find(
      (s) => typeof s.title === "string" && s.title.toLowerCase() === lowerTitle && s.kind === input.kind,
    );
    if (found) {
      const ids = (found.tripIds ?? []) as string[];
      if (!ids.includes(tripId)) {
        found.tripIds = [...ids, tripId];
        write(state);
      }
    }
    return { ok: true, status: "exists" };
  }

  if (input.kind === "hotel") {
    (trip.hotels as unknown[]).push({
      id: `h-${Date.now().toString(36)}`,
      name: input.title,
      pricePerNight: 0,
      area: input.meta,
    });
  } else {
    // restaurant → food；activity → activity；place/guide → sight
    const placeKind =
      input.kind === "restaurant" ? "food" : input.kind === "activity" ? "activity" : "sight";
    (trip.places as unknown[]).push({
      id: `p-${Date.now().toString(36)}`,
      name: input.title,
      kind: placeKind,
      status: "want",
      area: input.meta,
      note: input.source,
      fromSaved: true,
    });
  }

  // activity 流水（保持 /trips Recent activity 一致的结构：可读时间标签）
  (state.activity as unknown[]).unshift({
    id: `a-${Date.now().toString(36)}`,
    at: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
    text: `Added ${input.title} to ${String(trip.destination)} from ${input.source}`,
  });

  // 同步 Saved（蓝图 #7：加入 Trip 不删除收藏，双向记录）
  const savedId = upsertSavedItem(input);
  if (savedId) {
    const saved = state.saved as Array<Record<string, unknown>>;
    const found = saved.find((s) => s.id === savedId);
    if (found) {
      const ids = (found.tripIds ?? []) as string[];
      if (!ids.includes(tripId)) found.tripIds = [...ids, tripId];
    }
  }

  write(state);
  return { ok: true, status: "added" };
}

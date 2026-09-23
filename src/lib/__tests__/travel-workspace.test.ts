/**
 * 外部页写入口适配层测试（不需要网络、不需要密钥、不需要真实登录）。
 *
 * 这份测试要钉住的是**通道选择**，不是"能不能存"：
 *  - 登录用户（remote）的 Save / Add to Trip 必须落到 Supabase，且载荷带正确的
 *    user_id 与 id 前缀；同时浏览器里**一个字节都不能写**（否则就是双真相）；
 *  - 匿名访客（guest）必须只写 localStorage，且完全不构造 Supabase 客户端；
 *  - 云端失败必须**显式返回失败**，绝不回落到 localStorage 假装成功；
 *  - 两个用户的 id 命名空间不能相撞（0001 迁移里 id 是全局 text 主键，
 *    不带前缀时第二个用户会撞 23505）；
 *  - RLS 拒绝（42501）必须原样传播给调用方。
 *
 * 还有一条数据库硬约束：`saved_items.kind` 的 CHECK 只允许
 * place/hotel/activity/guide。外部页的 "restaurant" 若被直接写进去会得到
 * 23514 → 整批写入失败，因此边界必须归一。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  calls: [] as Array<{ table: string; op: string; payload?: unknown }>,
  rows: {} as Record<string, unknown[]>,
  failOn: null as string | null,
  session: { userId: null as string | null, email: null as string | null, resolved: true },
}));

vi.mock("@/lib/supabase/client", () => {
  function selectResult(table: string) {
    h.calls.push({ table, op: "select" });
    const data = h.rows[table] ?? [];
    const promise = Promise.resolve({ data, error: null });
    return Object.assign(promise, { order: () => Promise.resolve({ data, error: null }) });
  }

  function deleteChain(table: string) {
    const filters: Array<[string, unknown]> = [];
    const finish = () => {
      h.calls.push({ table, op: "delete", payload: filters.slice() });
      const failed = h.failOn === `delete:${table}`;
      return Promise.resolve({
        error: failed ? { message: "permission denied", code: "42501" } : null,
      });
    };
    const chain = {
      eq: (column: string, value: unknown) => {
        filters.push([column, value]);
        return chain;
      },
      in: (column: string, value: unknown) => {
        filters.push([column, value]);
        return finish();
      },
      then: (resolve: (value: unknown) => unknown) => finish().then(resolve),
    };
    return chain;
  }

  return {
    SUPABASE_CONFIGURED: true,
    createClient: () => ({
      from(table: string) {
        return {
          select: () => selectResult(table),
          upsert: (payload: unknown) => {
            h.calls.push({ table, op: "upsert", payload });
            const failed = h.failOn === `upsert:${table}`;
            return Promise.resolve({
              error: failed ? { message: "permission denied", code: "42501" } : null,
            });
          },
          delete: () => deleteChain(table),
        };
      },
    }),
  };
});

// 身份读取统一收敛在 use-session；这里替换成可控的桩，避免测试依赖真实会话。
vi.mock("@/lib/use-session", () => ({
  getSessionIdentity: async () => h.session,
}));

import {
  addPageItemToTrip,
  createPageTrip,
  pageKindToPlaceKind,
  pageKindToSavedKind,
  readTripOptions,
  resolvePageMode,
  savePageItem,
  type PageSavedInput,
} from "@/lib/travel-workspace";
import { GUEST_WORKSPACE_KEY } from "@/lib/workspace/guest";

const USER_A = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb";

class MemoryStorage {
  private readonly map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

let storage: MemoryStorage;

function writes(): Array<{ table: string; op: string; payload?: unknown }> {
  return h.calls.filter((c) => c.op === "upsert" || c.op === "delete");
}

function payloadOf(table: string): Array<Record<string, unknown>> {
  const call = h.calls.find((c) => c.table === table && c.op === "upsert");
  return (call?.payload ?? []) as Array<Record<string, unknown>>;
}

function storedGuest(): Record<string, unknown> | null {
  const raw = storage.getItem(GUEST_WORKSPACE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

/** 用户 A 名下一个 Trip 的云端行（多次测试共用）。 */
function seedUserATrip(): void {
  h.rows = {
    trips: [
      {
        id: `${USER_A}:trip-1`,
        user_id: USER_A,
        destination: "Tokyo",
        name: null,
        destination_id: null,
        destination_slug: null,
        destination_image: null,
        country: "Japan",
        status: "upcoming",
        start_date: "2026-10-18",
        end_date: "2026-10-24",
        currency: "CNY",
        flight: null,
        budget_planned: 0,
        flight_booked: false,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
}

/**
 * 把 mock 收到的 upsert 载荷写回 h.rows —— 模拟数据库真的落盘了。
 *
 * 对「第二次调用」的幂等性测试这是必需的：mock 的 upsert 默认不改 h.rows，
 * 于是第二次 loadWorkspace 读到的仍是空库，测出来的东西没有意义。
 * 回灌的 id 带 `<userId>:` 前缀，因此这条路径同时验证了
 * 「派生 id 经过 mapper 的加前缀 / 剥前缀往返后仍然相等」。
 */
function persistUpserts(): void {
  for (const call of h.calls) {
    if (call.op !== "upsert") continue;
    const rows = Array.isArray(call.payload) ? (call.payload as Array<Record<string, unknown>>) : [];
    const existing = (h.rows[call.table] ?? []) as Array<Record<string, unknown>>;
    const merged = new Map<string, Record<string, unknown>>();
    for (const row of [...existing, ...rows]) {
      // saved_item_trips 没有 id 列（主键是 saved_item_id + trip_id），退化为行内容做键
      merged.set(row.id === undefined ? JSON.stringify(row) : String(row.id), row);
    }
    h.rows[call.table] = [...merged.values()];
  }
}

beforeEach(() => {
  h.calls.length = 0;
  h.rows = {};
  h.failOn = null;
  h.session = { userId: null, email: null, resolved: true };
  storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── kind 归一（数据库 CHECK 合规） ──────────────────────────────────────

describe("travel-workspace — kind 归一", () => {
  it("restaurant 归一到 SavedItem 的合法词表（place），而不是直接写 restaurant", () => {
    expect(pageKindToSavedKind("restaurant")).toBe("place");
    expect(pageKindToSavedKind("place")).toBe("place");
    expect(pageKindToSavedKind("hotel")).toBe("hotel");
    expect(pageKindToSavedKind("activity")).toBe("activity");
    expect(pageKindToSavedKind("guide")).toBe("guide");
  });

  it("Trip 内的分类单独一层：restaurant → food，activity → activity，其余 → sight", () => {
    expect(pageKindToPlaceKind("restaurant")).toBe("food");
    expect(pageKindToPlaceKind("activity")).toBe("activity");
    expect(pageKindToPlaceKind("place")).toBe("sight");
    expect(pageKindToPlaceKind("guide")).toBe("sight");
  });
});

// ── 身份解析 ──────────────────────────────────────────────────────────

describe("travel-workspace — resolvePageMode", () => {
  it("已登录 → remote:<userId>", async () => {
    h.session = { userId: USER_A, email: "a@example.com", resolved: true };
    expect(await resolvePageMode()).toEqual({ kind: "remote", userId: USER_A });
  });

  it("未登录 → guest", async () => {
    h.session = { userId: null, email: null, resolved: true };
    expect(await resolvePageMode()).toEqual({ kind: "guest" });
  });

  it("身份无法确认 → null（必须拒绝写入，不能退化成 guest 把数据写进浏览器）", async () => {
    h.session = { userId: null, email: null, resolved: false };
    expect(await resolvePageMode()).toBeNull();
  });
});

// ── remote：Save ──────────────────────────────────────────────────────

describe("travel-workspace — 登录用户 Save", () => {
  it("落到 saved_items，带 user_id 与 id 前缀，且不写 localStorage", async () => {
    h.session = { userId: USER_A, email: null, resolved: true };
    const res = await savePageItem(
      { kind: "remote", userId: USER_A },
      { kind: "place", title: "Senso-ji", meta: "Asakusa", source: "Destination · Tokyo", sourceUrl: "/destinations/tokyo" },
    );

    expect(res.ok).toBe(true);
    const rows = payloadOf("saved_items");
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(USER_A);
    expect(rows[0].id).toMatch(new RegExp(`^${USER_A}:sv-`));
    expect(rows[0].kind).toBe("place");
    expect(rows[0].title).toBe("Senso-ji");
    expect(rows[0].source_url).toBe("/destinations/tokyo");
    // 双真相防线：remote 路径不碰浏览器存储
    expect(storedGuest()).toBeNull();
  });

  it("餐厅经 Save → saved_items.kind 是 place（不会是 23514）", async () => {
    await savePageItem(
      { kind: "remote", userId: USER_A },
      { kind: "restaurant", title: "Sushi Dai", source: "Destination · Tokyo" },
    );
    const rows = payloadOf("saved_items");
    expect(rows[0].kind).toBe("place");
    expect(rows.map((r) => r.kind)).not.toContain("restaurant");
  });

  it("匿名通道使用**同一套** kind 归一（否则 guest 与 remote 会产生两套去重键）", async () => {
    await savePageItem({ kind: "guest" }, {
      kind: "restaurant",
      title: "Sushi Dai",
      source: "Destination · Tokyo",
    });
    const saved = storedGuest()!.saved as Array<Record<string, unknown>>;
    expect(saved[0].kind).toBe("place");
    // 旧实现把 "restaurant" 原样存进 localStorage：既骗过了 SavedItem 的类型，
    // 又让同一条收藏在云端(place)/本地(restaurant)成为两个不同的去重键。
    expect(saved.map((s) => s.kind)).not.toContain("restaurant");
  });
});

// ── remote：Add to Trip ───────────────────────────────────────────────

describe("travel-workspace — 登录用户 Add to Trip", () => {
  it("一次动作写全：places + saved_items + saved_item_trips + activity", async () => {
    seedUserATrip();
    const res = await addPageItemToTrip(
      { kind: "remote", userId: USER_A },
      "trip-1",
      { kind: "restaurant", title: "Sushi Dai", meta: "Toyosu", source: "Destination · Tokyo" },
    );

    expect(res).toEqual({ ok: true, status: "added" });

    const places = payloadOf("places");
    expect(places).toHaveLength(1);
    expect(places[0].user_id).toBe(USER_A);
    expect(places[0].trip_id).toBe(`${USER_A}:trip-1`);
    expect(places[0].kind).toBe("food"); // restaurant → food（places.kind 的合法值）
    expect(places[0].status).toBe("want");
    expect(places[0].from_saved).toBe(true);

    const saved = payloadOf("saved_items");
    expect(saved).toHaveLength(1);
    expect(saved[0].kind).toBe("place");
    expect(saved[0].id).toMatch(new RegExp(`^${USER_A}:sv-`));

    // Saved ↔ Trip 的双向关联
    const links = payloadOf("saved_item_trips");
    expect(links).toHaveLength(1);
    expect(links[0].trip_id).toBe(`${USER_A}:trip-1`);
    expect(links[0].saved_item_id).toBe(saved[0].id);
    expect(links[0].user_id).toBe(USER_A);

    // Activity 流水（text 在写入时即格式化）
    const activity = payloadOf("activity");
    expect(activity).toHaveLength(1);
    expect(String(activity[0].text)).toBe("Added Sushi Dai to Tokyo from Destination · Tokyo");

    expect(storedGuest()).toBeNull();
  });

  it("Trip 内已有同名条目 → status=exists 且不再插入 places（不产生重复）", async () => {
    seedUserATrip();
    h.rows.places = [
      {
        id: `${USER_A}:p-9`,
        user_id: USER_A,
        trip_id: `${USER_A}:trip-1`,
        name: "Sushi Dai",
        kind: "food",
        area: null,
        note: null,
        status: "want",
        from_saved: false,
      },
    ];

    const res = await addPageItemToTrip({ kind: "remote", userId: USER_A }, "trip-1", {
      kind: "restaurant",
      title: "sushi dai", // 大小写不敏感的同名判定
      source: "Destination · Tokyo",
    });

    expect(res).toEqual({ ok: true, status: "exists" });
    expect(h.calls.some((c) => c.table === "places" && c.op === "upsert")).toBe(false);
    // 收藏与关联仍然补上（Saved 语义：加入 Trip 不删收藏）
    expect(payloadOf("saved_items")).toHaveLength(1);
    expect(payloadOf("saved_item_trips")).toHaveLength(1);
  });

  it("Trip 不存在 → no-trip，且一个写入请求都不发", async () => {
    const res = await addPageItemToTrip({ kind: "remote", userId: USER_A }, "trip-gone", {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });

    expect(res).toEqual({ ok: false, reason: "no-trip" });
    expect(writes()).toEqual([]);
    expect(storedGuest()).toBeNull();
  });
});

// ── 重复 Add 的幂等性（稳定身份，跨通道同语义） ─────────────────────────
//
// 真实浏览器复现的缺陷：连续两次 Add to Trip 同一个对象后，Trip 里出现两条
// 同名 Place。这里从**适配层**验证修复：第二次必须是 exists，且不再写 places 行。

describe("travel-workspace — 重复 Add 幂等", () => {
  it("remote：同一对象 Add 两次 → 第二次 exists，且 places 只落一行", async () => {
    seedUserATrip();
    const mode = { kind: "remote", userId: USER_A } as const;
    const input: PageSavedInput = { kind: "restaurant", title: "Sushi Dai", meta: "Toyosu", source: "Destination · Tokyo" };

    const first = await addPageItemToTrip(mode, "trip-1", input);
    expect(first).toEqual({ ok: true, status: "added" });
    persistUpserts(); // 模拟数据库已落盘（含 id 前缀往返）

    const second = await addPageItemToTrip(mode, "trip-1", input);
    expect(second).toEqual({ ok: true, status: "exists" });

    // 累计只有一行 place，且 id 是派生身份（不是随机 id）
    const persisted = (h.rows.places ?? []) as Array<Record<string, unknown>>;
    expect(persisted).toHaveLength(1);
    expect(String(persisted[0].id)).toMatch(/^aaaaaaaa-[^:]+:svp:.+@trip-1$/);
    expect(new Set(persisted.map((p) => p.name)).size).toBe(1);
  });

  it("remote：把 Place 改名后再 Add → 依然 exists（判据不是标题字符串）", async () => {
    seedUserATrip();
    const mode = { kind: "remote", userId: USER_A } as const;
    const input: PageSavedInput = { kind: "place", title: "Senso-ji", source: "Destination · Tokyo" };

    await addPageItemToTrip(mode, "trip-1", input);
    persistUpserts();
    // 模拟用户在 /trips 里把该 Place 改了名
    const place = (h.rows.places as Array<Record<string, unknown>>)[0];
    place.name = "Sensō-ji Temple";

    const again = await addPageItemToTrip(mode, "trip-1", input);
    expect(again).toEqual({ ok: true, status: "exists" });
    expect((h.rows.places as Array<Record<string, unknown>>).length).toBe(1);
  });

  it("remote：同一条收藏加入两个不同 Trip → 各写一行（id 含 tripId，互不覆盖）", async () => {
    seedUserATrip();
    h.rows.trips = [
      ...(h.rows.trips as Array<Record<string, unknown>>),
      {
        id: `${USER_A}:trip-2`,
        user_id: USER_A,
        destination: "Kyoto",
        name: null,
        destination_id: null,
        destination_slug: null,
        destination_image: null,
        country: "Japan",
        status: "upcoming",
        start_date: null,
        end_date: null,
        currency: "CNY",
        flight: null,
        budget_planned: 0,
        flight_booked: false,
        created_at: "2026-01-02T00:00:00.000Z",
      },
    ];
    const mode = { kind: "remote", userId: USER_A } as const;
    const input: PageSavedInput = { kind: "place", title: "Senso-ji", source: "Destination · Tokyo" };

    await addPageItemToTrip(mode, "trip-1", input);
    persistUpserts();
    const second = await addPageItemToTrip(mode, "trip-2", input);
    expect(second).toEqual({ ok: true, status: "added" });
    persistUpserts();

    const places = (h.rows.places ?? []) as Array<Record<string, unknown>>;
    expect(places.map((p) => p.trip_id).sort()).toEqual([`${USER_A}:trip-1`, `${USER_A}:trip-2`]);
    expect(new Set(places.map((p) => p.id)).size).toBe(2);
  });

  it("guest：三次 Add 落盘后 localStorage 里只有一条 Place（浏览器实测路径）", async () => {
    const created = await createPageTrip({ kind: "guest" }, "Tokyo", "2026-10-18", "2026-10-24");
    if (!created.ok) throw new Error("create failed");
    const mode = { kind: "guest" } as const;
    const input: PageSavedInput = { kind: "place", title: "Senso-ji", meta: "Asakusa", source: "Destination · Tokyo" };

    expect(await addPageItemToTrip(mode, created.id, input)).toEqual({ ok: true, status: "added" });
    expect(await addPageItemToTrip(mode, created.id, input)).toEqual({ ok: true, status: "exists" });
    expect(await addPageItemToTrip(mode, created.id, input)).toEqual({ ok: true, status: "exists" });

    const state = storedGuest()!;
    const trip = (state.trips as Array<Record<string, unknown>>).find((t) => t.id === created.id);
    const places = trip!.places as Array<Record<string, unknown>>;
    expect(places).toHaveLength(1);
    expect(places[0].id).toBe(`svp:${(state.saved as Array<Record<string, unknown>>)[0].id}@${created.id}`);
    // Saved 语义不回退：收藏仍在，且只关联这一个 Trip
    expect(state.saved).toHaveLength(1);
    expect((state.saved as Array<Record<string, unknown>>)[0].tripIds).toEqual([created.id]);
  });

  it("guest 与 remote 用**同一套**身份派生（同输入 → 同 id 形状）", async () => {
    // guest 侧
    const created = await createPageTrip({ kind: "guest" }, "Tokyo", "2026-10-18", "2026-10-24");
    if (!created.ok) throw new Error("create failed");
    await addPageItemToTrip({ kind: "guest" }, created.id, {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });
    const guestTrip = (storedGuest()!.trips as Array<Record<string, unknown>>).find((t) => t.id === created.id);
    const guestPlaceId = String((guestTrip!.places as Array<Record<string, unknown>>)[0].id);

    // remote 侧
    seedUserATrip();
    await addPageItemToTrip({ kind: "remote", userId: USER_A }, "trip-1", {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });
    const remotePlaceId = String(payloadOf("places")[0].id).replace(`${USER_A}:`, "");

    // 两条通道产生的是同一种身份表达式：svp:<savedId>@<tripId>
    expect(guestPlaceId).toMatch(/^svp:.+@.+$/);
    expect(remotePlaceId).toMatch(/^svp:.+@trip-1$/);
    // 收藏 id 由 localId("sv") 生成，与通道无关 → 同 title 的收藏在两通道下同一形状
    expect(guestPlaceId.slice(4, guestPlaceId.indexOf("@"))).toMatch(/^sv-/);
    expect(remotePlaceId.slice(4, remotePlaceId.indexOf("@"))).toMatch(/^sv-/);
  });
});

// ── guest：行为不变，且完全不碰云端 ────────────────────────────────────

describe("travel-workspace — 匿名访客", () => {
  it("Save 只写 localStorage，一次 Supabase 调用都没有", async () => {
    const res = await savePageItem({ kind: "guest" }, {
      kind: "place",
      title: "Senso-ji",
      meta: "Asakusa",
      source: "Destination · Tokyo",
    });

    expect(res.ok).toBe(true);
    expect(h.calls).toEqual([]);
    const state = storedGuest();
    expect(state).not.toBeNull();
    expect((state!.saved as Array<Record<string, unknown>>)[0].title).toBe("Senso-ji");
    expect((state!.saved as Array<Record<string, unknown>>)[0].kind).toBe("place");
  });

  it("Add to Trip：新 Trip 从空工作区起也能建 + 加（旧实现此处静默什么都不做）", async () => {
    const created = await createPageTrip({ kind: "guest" }, "Tokyo", "2026-10-18", "2026-10-24");
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const res = await addPageItemToTrip({ kind: "guest" }, created.id, {
      kind: "activity",
      title: "teamLab",
      source: "Destination · Tokyo",
    });
    expect(res).toEqual({ ok: true, status: "added" });

    const state = storedGuest()!;
    const trip = (state.trips as Array<Record<string, unknown>>).find((t) => t.id === created.id);
    expect(trip).toBeDefined();
    expect((trip!.places as Array<Record<string, unknown>>)[0].name).toBe("teamLab");
    expect((trip!.places as Array<Record<string, unknown>>)[0].kind).toBe("activity");
    expect((state.saved as Array<Record<string, unknown>>)[0].kind).toBe("activity");
    // guest 通道不得触碰云端
    expect(h.calls).toEqual([]);
  });

  it("新建 Trip 的 currency 是 ISO 代码（不再写符号 ¥）", async () => {
    const created = await createPageTrip({ kind: "guest" }, "Tokyo", "2026-10-18", "2026-10-24");
    expect(created.ok).toBe(true);
    const state = storedGuest()!;
    expect((state.trips as Array<Record<string, unknown>>)[0].currency).toBe("CNY");
  });

  it("readTripOptions 传入 title 时一次给出「已加入」判定", async () => {
    const created = await createPageTrip({ kind: "guest" }, "Tokyo", "2026-10-18", "2026-10-24");
    if (!created.ok) throw new Error("create failed");
    await addPageItemToTrip({ kind: "guest" }, created.id, {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });

    const options = await readTripOptions({ kind: "guest" }, "Senso-ji");
    expect(options).toHaveLength(1);
    expect(options[0].hasItem).toBe(true);

    const other = await readTripOptions({ kind: "guest" }, "Skytree");
    expect(other[0].hasItem).toBe(false);
  });

  it("从未存过 → 空列表（不是崩溃）", async () => {
    expect(await readTripOptions({ kind: "guest" }, "Senso-ji")).toEqual([]);
  });
});

// ── 失败：显式返回，绝不回落 guest ─────────────────────────────────────

describe("travel-workspace — 云端失败", () => {
  it("Save 的 upsert 被拒（RLS 42501）→ ok:false 且带 code，浏览器里不留假成功", async () => {
    h.session = { userId: USER_A, email: null, resolved: true };
    h.failOn = "upsert:saved_items";

    const res = await savePageItem(
      { kind: "remote", userId: USER_A },
      { kind: "place", title: "Senso-ji", source: "Destination · Tokyo" },
    );

    expect(res.ok).toBe(false);
    if (res.ok || res.reason !== "write-failed") {
      throw new Error(`expected a write failure, got ${JSON.stringify(res)}`);
    }
    expect(res.code).toBe("42501");
    // 关键：失败不得回落到 localStorage
    expect(storedGuest()).toBeNull();
  });

  it("Add to Trip 的中途失败（places 被拒）→ 失败传播，且不写 localStorage", async () => {
    h.rows = {
      trips: [
        {
          id: `${USER_A}:trip-1`,
          user_id: USER_A,
          destination: "Tokyo",
          name: null,
          destination_id: null,
          destination_slug: null,
          destination_image: null,
          country: "Japan",
          status: "upcoming",
          start_date: null,
          end_date: null,
          currency: "CNY",
          flight: null,
          budget_planned: 0,
          flight_booked: false,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    h.failOn = "upsert:places";

    const res = await addPageItemToTrip({ kind: "remote", userId: USER_A }, "trip-1", {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });

    expect(res.ok).toBe(false);
    if (res.ok || res.reason !== "write-failed") {
      throw new Error(`expected a write failure, got ${JSON.stringify(res)}`);
    }
    expect(res.code).toBe("42501");
    expect(storedGuest()).toBeNull();
  });
});

// ── 两个用户：命名空间隔离 ────────────────────────────────────────────

describe("travel-workspace — 用户隔离", () => {
  it("同标题在两个账号下写入 → id 各自带本账号前缀，互不相撞", async () => {
    h.session = { userId: USER_A, email: null, resolved: true };
    await savePageItem({ kind: "remote", userId: USER_A }, {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });

    h.session = { userId: USER_B, email: null, resolved: true };
    await savePageItem({ kind: "remote", userId: USER_B }, {
      kind: "place",
      title: "Senso-ji",
      source: "Destination · Tokyo",
    });

    const rows = h.calls
      .filter((c) => c.table === "saved_items" && c.op === "upsert")
      .flatMap((c) => c.payload as Array<Record<string, unknown>>);

    expect(rows).toHaveLength(2);
    expect(rows[0].id).toMatch(new RegExp(`^${USER_A}:`));
    expect(rows[0].user_id).toBe(USER_A);
    expect(rows[1].id).toMatch(new RegExp(`^${USER_B}:`));
    expect(rows[1].user_id).toBe(USER_B);
    // 0001 迁移的 id 是全局 text 主键：不带前缀会撞 23505
    expect(rows[0].id).not.toBe(rows[1].id);
  });

  it("B 的读取不会看到 A 的行（每次调用都按传入 mode 重新读，无跨模式缓存）", async () => {
    h.rows = {
      trips: [
        {
          id: `${USER_A}:trip-1`,
          user_id: USER_A,
          destination: "A-only",
          name: null,
          destination_id: null,
          destination_slug: null,
          destination_image: null,
          country: null,
          status: "upcoming",
          start_date: null,
          end_date: null,
          currency: "CNY",
          flight: null,
          budget_planned: 0,
          flight_booked: false,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    const aOptions = await readTripOptions({ kind: "remote", userId: USER_A }, "x");
    expect(aOptions.map((o) => o.destination)).toEqual(["A-only"]);

    // RLS 在真实环境里会让 B 的 select 返回空；这里用空 rows 模拟同一事实
    h.rows = {};
    const bOptions = await readTripOptions({ kind: "remote", userId: USER_B }, "x");
    expect(bOptions).toEqual([]);
  });

  it("切换账号后 guest 通道读的是浏览器里那份，不掺入上一个账号的数据", async () => {
    h.session = { userId: USER_A, email: null, resolved: true };
    await savePageItem({ kind: "remote", userId: USER_A }, {
      kind: "place",
      title: "A-only",
      source: "Destination · Tokyo",
    });
    // A 的写入在云端，浏览器里什么都没有 → 登出后回到匿名通道就是空的
    expect(await readTripOptions({ kind: "guest" })).toEqual([]);
  });
});

// ── 新建 Trip ────────────────────────────────────────────────────────

describe("travel-workspace — 新建 Trip", () => {
  it("remote：写 trips 表，user_id / id 前缀 / ISO currency 正确", async () => {
    const res = await createPageTrip({ kind: "remote", userId: USER_A }, "Tokyo", "2026-10-18", "2026-10-24");
    expect(res.ok).toBe(true);

    const rows = payloadOf("trips");
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(USER_A);
    expect(rows[0].id).toMatch(new RegExp(`^${USER_A}:trip-`));
    expect(rows[0].currency).toBe("CNY");
    expect(rows[0].destination).toBe("Tokyo");
    expect(storedGuest()).toBeNull();
  });

  it("remote：创建失败同样显式返回，不回落 guest", async () => {
    h.failOn = "upsert:trips";
    const res = await createPageTrip({ kind: "remote", userId: USER_A }, "Tokyo", "2026-10-18", "2026-10-24");
    expect(res.ok).toBe(false);
    if (res.ok || res.reason !== "write-failed") {
      throw new Error(`expected a write failure, got ${JSON.stringify(res)}`);
    }
    expect(res.code).toBe("42501");
    expect(storedGuest()).toBeNull();
  });
});

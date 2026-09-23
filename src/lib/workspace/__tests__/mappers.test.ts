/**
 * 数据层核心的不变量测试：**映射是双射，且 id 按用户隔离**。
 *
 * 这两条是整套云端工作区的地基：
 *  - 双射（flatten → assemble 回到原样）保证「读回来的东西就是写出去的东西」，
 *    否则 diff 会在每次加载后都算出幻影差异，把库写成另一个样子；
 *  - id 隔离保证两个用户各自 load demo 不会撞主键（所有表的 id 都是全局
 *    primary key，不是 (user_id, id) 复合键）。
 */

import { describe, expect, it } from "vitest";

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { assembleWorkspace, flattenWorkspace, fromDbId, idScope, toDbId } from "@/lib/workspace/mappers";
import type { FlatWorkspace } from "@/lib/workspace/types";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

/**
 * 必须**逐字段往返无损**：这里刻意不写任何会被映射归一掉的形状
 * （`fromSaved: false`、`preferred: false`、`savedAt` 带时间、`updatedAt ≠ createdAt`
 * 都会在读出侧变成 undefined / 日粒度），因此可以直接断言深度相等。
 */
function fixture(): WorkspaceState {
  return {
    trips: [
      {
        id: "trip-tokyo",
        destination: "Tokyo",
        name: "Golden Week",
        destinationId: "tokyo",
        destinationSlug: "tokyo",
        destinationImage: "/destinations/tokyo.jpg",
        country: "Japan",
        status: "current",
        startDate: "2026-10-18",
        endDate: "2026-10-24",
        currency: "CNY",
        flight: {
          airline: "ANA",
          flightNumber: "NH960",
          departAirport: "PVG",
          arriveAirport: "NRT",
          date: "2026-10-18",
          time: "09:00",
        },
        budgetPlanned: 100000,
        flightBooked: true,
        travelers: [
          { id: "t-1", name: "Alex" },
          { id: "t-2", name: "Sam" },
        ],
        places: [
          {
            id: "p-1",
            name: "Senso-ji",
            kind: "sight",
            area: "Asakusa",
            note: "Go early",
            status: "must",
          },
        ],
        hotels: [
          {
            id: "h-1",
            name: "Hotel Gracery Shinjuku",
            pricePerNight: 21000,
            rating: 8.7,
            distanceKm: 1.2,
            breakfast: true,
            nights: 2,
          },
        ],
        routeDays: [
          {
            id: "d-1",
            title: "Day 1 · Old Tokyo",
            distanceKm: 8.7,
            transitMin: 134,
            stops: [
              { id: "s-1", name: "Senso-ji", time: "09:00", area: "Asakusa", placeId: "p-1" },
              { id: "s-2", name: "Lunch", time: "13:00", kind: "meal", note: "Tempura" },
            ],
          },
        ],
        // Trip.expenses 是 v5 之前的旧存储：云端不建表，读出侧恒为空数组。
        expenses: [],
        checklist: [{ id: "c-1", label: "Hotel", phase: "before", done: true }],
      },
    ],
    saved: [
      {
        id: "sv-1",
        kind: "place",
        title: "Shibuya Sky",
        meta: "Shibuya",
        savedAt: "2026-09-20",
        source: "Destination · Tokyo",
        sourceUrl: "/destinations/tokyo",
        tripIds: ["trip-tokyo"],
      },
    ],
    inbox: [
      { id: "in-1", kind: "hotel", title: "Hotel Gracery", meta: "Shinjuku · Tokyo", savedAt: "2026-09-19" },
    ],
    activity: [{ id: "a-1", text: "Added Shibuya Sky to Tokyo places", at: "Sep 20, 09:14" }],
    transactions: [
      {
        id: "txn-1",
        source: "manual",
        merchant: "Sushi dinner",
        occurredAt: "2026-10-19",
        originalAmount: 8600,
        originalCurrency: "JPY",
        category: "food",
        tripId: "trip-tokyo",
        status: "confirmed",
        paidBy: "t-1",
        splitBetween: ["t-1", "t-2"],
        splitMode: "equal",
        splitShares: { "t-1": 4300, "t-2": 4300 },
        note: "Conveyor belt",
        paymentMethod: "cash",
        createdAt: "2026-10-19T12:00:00.000Z",
        updatedAt: "2026-10-19T12:00:00.000Z",
      },
    ],
    merchantRules: { sushi: { category: "food", subcategory: "dining" } },
  };
}

function flatFor(userId: string, state: WorkspaceState): FlatWorkspace {
  return flattenWorkspace(idScope(userId), state);
}

describe("workspace/mappers — id 命名空间", () => {
  it("idScope 原样返回 userId，不做有损变换", () => {
    expect(idScope(USER_A)).toBe(USER_A);
  });

  it("toDbId / fromDbId 往返，且不误剥离他人的前缀", () => {
    const scoped = toDbId(USER_A, "trip-tokyo");
    expect(scoped).toBe(`${USER_A}:trip-tokyo`);
    expect(fromDbId(USER_A, scoped)).toBe("trip-tokyo");
    // 另一个用户的前缀不得被剥离（否则会把别人的行当成自己的）
    expect(fromDbId(USER_A, `${USER_B}:trip-tokyo`)).toBe(`${USER_B}:trip-tokyo`);
    // 无前缀的行（手工插入 / 换过账号）原样返回
    expect(fromDbId(USER_A, "trip-legacy")).toBe("trip-legacy");
  });

  it("两个用户展开同一份本地数据 → 行 id 完全不相交（主键不会撞车）", () => {
    const a = flatFor(USER_A, fixture());
    const b = flatFor(USER_B, fixture());

    const idsOf = (flat: FlatWorkspace) =>
      new Set([
        ...flat.trips.map((r) => r.id),
        ...flat.places.map((r) => r.id),
        ...flat.stays.map((r) => r.id),
        ...flat.itinerary_days.map((r) => r.id),
        ...flat.itinerary_stops.map((r) => r.id),
        ...flat.trip_people.map((r) => r.id),
        ...flat.checklist_items.map((r) => r.id),
        ...flat.expenses.map((r) => r.id),
        ...flat.saved_items.map((r) => r.id),
        ...flat.inbox_items.map((r) => r.id),
        ...flat.activity.map((r) => r.id),
      ]);

    const idsA = idsOf(a);
    const idsB = idsOf(b);
    const overlap = [...idsA].filter((id) => idsB.has(id));
    expect(overlap).toEqual([]);
    expect(idsA.size).toBe(13);
  });

  it("外键（trip_id / day_id / place_id / saved_item_id）与外键列跟着一起加前缀", () => {
    const flat = flatFor(USER_A, fixture());
    expect(flat.places[0].trip_id).toBe(`${USER_A}:trip-tokyo`);
    expect(flat.itinerary_stops[0].day_id).toBe(`${USER_A}:d-1`);
    expect(flat.itinerary_stops[0].place_id).toBe(`${USER_A}:p-1`);
    expect(flat.itinerary_stops[0].trip_id).toBe(`${USER_A}:trip-tokyo`);
    expect(flat.saved_item_trips[0]).toEqual({
      saved_item_id: `${USER_A}:sv-1`,
      trip_id: `${USER_A}:trip-tokyo`,
      user_id: USER_A,
    });
  });

  it("user_id 列始终是原始 uuid（带连字符），与 scope 同源", () => {
    const flat = flatFor(USER_A, fixture());
    for (const rows of Object.values(flat)) {
      for (const row of rows as Array<Record<string, unknown>>) {
        if ("user_id" in row) expect(row.user_id).toBe(USER_A);
      }
    }
  });
});

describe("workspace/mappers — 往返", () => {
  it("flatten → assemble 逐字段回到原状", () => {
    const before = fixture();
    const after = assembleWorkspace(idScope(USER_A), flatFor(USER_A, before));
    expect(after).toEqual(before);
  });

  it("往返是幂等的：再走一遍结果完全相同", () => {
    const once = assembleWorkspace(idScope(USER_A), flatFor(USER_A, fixture()));
    const twice = assembleWorkspace(idScope(USER_A), flatFor(USER_A, once));
    expect(twice).toEqual(once);
  });

  it("Trip.expenses 不往返（云端账本只有 transactions）", () => {
    const state = fixture();
    state.trips[0].expenses = [
      {
        id: "e-legacy",
        title: "Old sushi",
        amount: 100,
        category: "food",
        paidBy: "t-1",
        splitBetween: ["t-1"],
      },
    ];
    const after = assembleWorkspace(idScope(USER_A), flatFor(USER_A, state));
    expect(after.trips[0].expenses).toEqual([]);
    expect(after.transactions).toHaveLength(1);
  });

  it("itinerary_days / itinerary_stops 用序号列还原顺序（不依赖 created_at）", () => {
    const scope = idScope(USER_A);
    const flat = flatFor(USER_A, fixture());
    flat.itinerary_stops = [
      { ...flat.itinerary_stops[0], id: `${scope}:s-2`, name: "Second", stop_index: 1 },
      { ...flat.itinerary_stops[0], id: `${scope}:s-1`, name: "First", stop_index: 0 },
    ];
    const state = assembleWorkspace(scope, flat);
    expect(state.trips[0].routeDays[0].stops.map((s) => s.name)).toEqual(["First", "Second"]);
  });

  it("created_at 降序 = 新在前（saved / inbox / activity / transactions）", () => {
    const scope = idScope(USER_A);
    const flat = flatFor(USER_A, fixture());
    flat.saved_items = [
      { ...flat.saved_items[0], id: `${scope}:sv-old`, created_at: "2026-01-01T00:00:00.000Z" },
      { ...flat.saved_items[0], id: `${scope}:sv-new`, created_at: "2026-02-01T00:00:00.000Z" },
    ];
    const state = assembleWorkspace(scope, flat);
    expect(state.saved.map((s) => s.id)).toEqual(["sv-new", "sv-old"]);
  });

  it("空的 13 组行组装出空工作区（空库不是 null）", () => {
    const scope = idScope(USER_A);
    const empty: FlatWorkspace = {
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
    expect(assembleWorkspace(scope, empty)).toEqual({
      trips: [],
      saved: [],
      inbox: [],
      activity: [],
      transactions: [],
      merchantRules: {},
    });
  });
});

/**
 * 引用完整性兜底。
 *
 * `saved_item_trips.trip_id` 与 `expenses.trip_id` 都是 FK：指向不存在的 Trip
 * 会让**整批写入**撞 23503，而 PostgREST 的报错不会告诉你是哪一行。
 * 清理动作在各处的 reducer 里（DELETE_TRIP），这里是最后一层保证——
 * 旧 localStorage 快照、并发删除、任何来源都不该写出非法行。
 */
describe("flattenWorkspace — 悬空 trip 引用兜底", () => {
  it("Saved.tripIds 指向已不存在的 Trip → 不写出关联行", () => {
    const scope = idScope(USER_A);
    const state = fixture();
    state.trips = []; // 模拟「Trip 已删但快照没清理」
    const flat = flattenWorkspace(scope, state);
    // 收藏对象本身照常写出，只是不再带那条非法关联
    expect(flat.saved_items).toHaveLength(1);
    expect(flat.saved_item_trips).toEqual([]);
  });

  it("Transaction.tripId 悬空 → 降级为 Unassigned(null)，消费记录本身不丢", () => {
    const scope = idScope(USER_A);
    const state = fixture();
    state.trips = [];
    const flat = flattenWorkspace(scope, state);
    expect(flat.expenses).toHaveLength(1);
    expect(flat.expenses[0].id).toBe(`${scope}:txn-1`);
    // 「未归属」是一等状态（删 Trip 只解绑），因此降级不损失任何真实消费
    expect(flat.expenses[0].trip_id).toBeNull();
  });

  it("引用存在的 Trip 时行为不变（正常路径不受兜底影响）", () => {
    const scope = idScope(USER_A);
    const flat = flattenWorkspace(scope, fixture());
    expect(flat.saved_item_trips).toHaveLength(1);
    expect(flat.saved_item_trips[0].trip_id).toBe(`${scope}:trip-tokyo`);
    expect(flat.expenses[0].trip_id).toBe(`${scope}:trip-tokyo`);
  });
});

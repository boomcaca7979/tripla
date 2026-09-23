/**
 * 云端写入通道测试（不需要网络、不需要密钥）。
 *
 * 用假的 Supabase client 记录每一次调用，验证三件在真实环境里很难复现的事：
 *  - **顺序**：父表先写、子表后写，删除反向 —— 外键存在性是顺序问题，
 *    顺序错了会得到 23503（外键违例）；
 *  - **载荷**：`created_at` / `updated_at` 归数据库所有，除 expenses 外一律剥离，
 *    否则每次 upsert 都会把「创建时间」改写成"刚刚"，破坏历史；
 *  - **失败传播**：任何一层失败都必须抛出带表名的错误（静默 = 假成功）。
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceState } from "@/components/trips/workspace/types";

const h = vi.hoisted(() => ({
  calls: [] as Array<{ table: string; op: string; payload?: unknown }>,
  rows: {} as Record<string, unknown[]>,
  failOn: null as string | null,
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
      // 连续 eq 之后直接 await 也能落账
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

import { countUpserts, diffWorkspace, emptyChanges } from "@/lib/workspace/diff";
import { flattenWorkspace, idScope } from "@/lib/workspace/mappers";
import { WorkspaceSyncError, applyRemoteChanges, loadRemoteWorkspace } from "@/lib/workspace/remote";

const USER = "11111111-1111-4111-8111-111111111111";
const SCOPE = idScope(USER);

/** 写库顺序是**契约**（外键存在性），因此显式抄一遍而不是引用实现里的常量。 */
const EXPECTED_UPSERT_ORDER = [
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

const ALL_TABLES = [
  "trips",
  "places",
  "stays",
  "itinerary_days",
  "itinerary_stops",
  "expenses",
  "trip_people",
  "checklist_items",
  "saved_items",
  "saved_item_trips",
  "inbox_items",
  "activity",
  "merchant_rules",
] as const;

function emptyState(): WorkspaceState {
  return {
    trips: [],
    saved: [],
    inbox: [],
    activity: [],
    transactions: [],
    merchantRules: {},
  };
}

function fixture(): WorkspaceState {
  return {
    trips: [
      {
        id: "trip-1",
        destination: "Tokyo",
        country: "Japan",
        status: "upcoming",
        startDate: "2026-10-18",
        endDate: "2026-10-24",
        currency: "CNY",
        budgetPlanned: 1000,
        flightBooked: false,
        travelers: [{ id: "t-1", name: "Alex" }],
        places: [{ id: "p-1", name: "Senso-ji", kind: "sight", status: "must" }],
        hotels: [{ id: "h-1", name: "Gracery", pricePerNight: 21000, nights: 2 }],
        routeDays: [
          {
            id: "d-1",
            title: "Day 1",
            distanceKm: 1,
            transitMin: 10,
            stops: [{ id: "s-1", name: "Senso-ji", time: "09:00", placeId: "p-1" }],
          },
        ],
        expenses: [],
        checklist: [{ id: "c-1", label: "Hotel", phase: "before", done: false }],
      },
    ],
    saved: [
      {
        id: "sv-1",
        kind: "place",
        title: "Shibuya Sky",
        savedAt: "2026-09-20",
        tripIds: ["trip-1"],
      },
    ],
    inbox: [{ id: "in-1", kind: "hotel", title: "Gracery", meta: "Shinjuku", savedAt: "2026-09-19" }],
    activity: [{ id: "a-1", text: "Added Senso-ji", at: "Sep 20, 09:14" }],
    transactions: [
      {
        id: "txn-1",
        source: "manual",
        merchant: "Sushi",
        occurredAt: "2026-10-19",
        originalCurrency: "JPY",
        category: "food",
        tripId: "trip-1",
        status: "confirmed",
        splitBetween: [],
        createdAt: "2026-10-19T12:00:00.000Z",
        updatedAt: "2026-10-19T12:00:00.000Z",
      },
    ],
    merchantRules: { sushi: { category: "food" } },
  };
}

function changesOf(prev: WorkspaceState, next: WorkspaceState) {
  return diffWorkspace(flattenWorkspace(SCOPE, prev), flattenWorkspace(SCOPE, next));
}

function payloadOf(table: string): Array<Record<string, unknown>> {
  const call = h.calls.find((c) => c.table === table && c.op === "upsert");
  return (call?.payload ?? []) as Array<Record<string, unknown>>;
}

beforeEach(() => {
  h.calls.length = 0;
  h.rows = {};
  h.failOn = null;
});

describe("workspace/remote — 读", () => {
  it("一次并行拉全 13 张表，剥掉 id 前缀并按外键挂回 Trip", async () => {
    h.rows = {
      trips: [
        {
          id: `${SCOPE}:trip-1`,
          user_id: USER,
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
          budget_planned: 100000,
          flight_booked: false,
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      places: [
        {
          id: `${SCOPE}:p-1`,
          user_id: USER,
          trip_id: `${SCOPE}:trip-1`,
          name: "Senso-ji",
          kind: "sight",
          area: "Asakusa",
          note: null,
          status: "must",
          from_saved: false,
        },
      ],
      trip_people: [
        { id: `${SCOPE}:t-1`, user_id: USER, trip_id: `${SCOPE}:trip-1`, name: "Alex" },
      ],
    };

    const state = await loadRemoteWorkspace(USER);

    const selected = h.calls.filter((c) => c.op === "select").map((c) => c.table).sort();
    expect(selected).toEqual([...ALL_TABLES].sort());
    expect(state.trips).toHaveLength(1);
    expect(state.trips[0].id).toBe("trip-1"); // 前缀已剥离，内存里是裸 id
    expect(state.trips[0].places[0].name).toBe("Senso-ji");
    expect(state.trips[0].travelers[0].name).toBe("Alex");
    // 空表 → 空数组 / 空对象，不是 undefined
    expect(state.saved).toEqual([]);
    expect(state.merchantRules).toEqual({});
    expect(state.transactions).toEqual([]);
  });
});

describe("workspace/remote — 写", () => {
  it("空增量 → 零请求（加载/切视图不改数据时不得产生任何写入）", async () => {
    await applyRemoteChanges(USER, emptyChanges());
    expect(h.calls).toEqual([]);
  });

  it("父表先写、子表后写（外键必须已存在）", async () => {
    const changes = changesOf(emptyState(), fixture());
    // 13 张表每张至少 1 行：13 = 1trip + 1person + 1place + 1stay + 1day + 1stop
    //                      + 1checklist + 1expense + 1saved + 1link + 1inbox
    //                      + 1activity + 1rule
    expect(countUpserts(changes)).toBe(13);
    await applyRemoteChanges(USER, changes);

    const upsertOrder = h.calls.filter((c) => c.op === "upsert").map((c) => c.table);
    expect(upsertOrder).toEqual(EXPECTED_UPSERT_ORDER);
    expect(upsertOrder.indexOf("itinerary_days")).toBeLessThan(
      upsertOrder.indexOf("itinerary_stops"),
    );
    expect(upsertOrder.indexOf("saved_items")).toBeLessThan(
      upsertOrder.indexOf("saved_item_trips"),
    );
    // 写路径不会顺带删除任何东西
    expect(h.calls.filter((c) => c.op === "delete")).toEqual([]);
  });

  it("剥离 created_at / updated_at（expenses 的 created_at 例外）", async () => {
    await applyRemoteChanges(USER, changesOf(emptyState(), fixture()));

    for (const table of ALL_TABLES) {
      for (const row of payloadOf(table)) {
        expect(row).not.toHaveProperty("updated_at");
        if (table !== "expenses") expect(row).not.toHaveProperty("created_at");
        if ("user_id" in row) expect(row.user_id).toBe(USER);
      }
    }
    expect(payloadOf("expenses")[0].created_at).toBe("2026-10-19T12:00:00.000Z");
    expect(payloadOf("trips")[0].id).toBe(`${SCOPE}:trip-1`);
    // 外键同样带前缀
    expect(payloadOf("places")[0].trip_id).toBe(`${SCOPE}:trip-1`);
    expect(payloadOf("itinerary_stops")[0].day_id).toBe(`${SCOPE}:d-1`);
  });

  it("upsert 失败 → 抛错并停在失败点（不静默、不继续写后面的表）", async () => {
    h.failOn = "upsert:places";
    await expect(applyRemoteChanges(USER, changesOf(emptyState(), fixture()))).rejects.toThrow(
      /places/,
    );

    h.calls.length = 0;
    h.failOn = "upsert:places";
    let caught: unknown = null;
    try {
      await applyRemoteChanges(USER, changesOf(emptyState(), fixture()));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(WorkspaceSyncError);
    expect((caught as WorkspaceSyncError).table).toBe("places");
    expect((caught as WorkspaceSyncError).code).toBe("42501");
    // places 之后的表一个都没写
    expect(h.calls.some((c) => c.table === "stays")).toBe(false);
  });

  it("删除：先子后父，且每条都带 user_id 过滤", async () => {
    const changes = changesOf(fixture(), emptyState());
    await applyRemoteChanges(USER, changes);

    const deleteOrder = h.calls.filter((c) => c.op === "delete").map((c) => c.table);
    expect(deleteOrder[0]).toBe("itinerary_stops");
    expect(deleteOrder.indexOf("places")).toBeLessThan(deleteOrder.indexOf("trips"));
    expect(deleteOrder.indexOf("saved_item_trips")).toBeLessThan(
      deleteOrder.indexOf("saved_items"),
    );
    expect(deleteOrder[deleteOrder.length - 1]).toBe("trips");

    for (const call of h.calls.filter((c) => c.op === "delete")) {
      const filters = call.payload as Array<[string, unknown]>;
      expect(filters[0]).toEqual(["user_id", USER]);
    }
  });

  it("删除失败同样抛错（delete 路径不是「尽力而为」）", async () => {
    h.failOn = "delete:places";
    await expect(applyRemoteChanges(USER, changesOf(fixture(), emptyState()))).rejects.toThrow(
      /places/,
    );
  });
});

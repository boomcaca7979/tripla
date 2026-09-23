/**
 * 增量折算的不变量测试。
 *
 * 这里守的是「一次点击只写这次点击真正改动的行」这条纪律：
 *  - 没改 → 0 行（绝不产生网络请求）；
 *  - 改了 1 个字段 → 只 upsert 那 1 行；
 *  - 只换了展示顺序 → 0 行（顺序不是内容，不能变成写入）；
 *  - 删 Trip → 子表行被删、真实消费只解绑（trip_id = null）而不是被删。
 */

import { describe, expect, it } from "vitest";

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { countRemoved, countUpserts, diffWorkspace, hasChanges } from "@/lib/workspace/diff";
import { flattenWorkspace, idScope } from "@/lib/workspace/mappers";

const USER_A = "11111111-1111-4111-8111-111111111111";

function fixture(): WorkspaceState {
  return {
    trips: [
      {
        id: "trip-tokyo",
        destination: "Tokyo",
        country: "Japan",
        status: "current",
        startDate: "2026-10-18",
        endDate: "2026-10-24",
        currency: "CNY",
        budgetPlanned: 100000,
        flightBooked: true,
        travelers: [{ id: "t-1", name: "Alex" }],
        places: [
          { id: "p-1", name: "Senso-ji", kind: "sight", area: "Asakusa", status: "must" },
          { id: "p-2", name: "Shibuya Sky", kind: "sight", status: "want" },
        ],
        hotels: [
          { id: "h-1", name: "Hotel Gracery", pricePerNight: 21000, nights: 2, booked: true },
        ],
        routeDays: [
          {
            id: "d-1",
            title: "Day 1",
            distanceKm: 8.7,
            transitMin: 134,
            stops: [
              { id: "s-1", name: "Senso-ji", time: "09:00", placeId: "p-1" },
              { id: "s-2", name: "Lunch", time: "13:00", kind: "meal" },
            ],
          },
        ],
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
        tripIds: ["trip-tokyo"],
      },
    ],
    inbox: [{ id: "in-1", kind: "hotel", title: "Hotel Gracery", meta: "Shinjuku", savedAt: "2026-09-19" }],
    activity: [{ id: "a-1", text: "Added Senso-ji", at: "Sep 20, 09:14" }],
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
        splitBetween: ["t-1"],
        createdAt: "2026-10-19T12:00:00.000Z",
        updatedAt: "2026-10-19T12:00:00.000Z",
      },
    ],
    merchantRules: { sushi: { category: "food" } },
  };
}

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

function diff(prev: WorkspaceState, next: WorkspaceState) {
  const scope = idScope(USER_A);
  return diffWorkspace(flattenWorkspace(scope, prev), flattenWorkspace(scope, next));
}

describe("workspace/diff", () => {
  it("完全相同的快照 → 空增量（零请求）", () => {
    const changes = diff(fixture(), fixture());
    expect(hasChanges(changes)).toBe(false);
    expect(countUpserts(changes)).toBe(0);
    expect(countRemoved(changes)).toBe(0);
  });

  it("空 → 有数据：逐表行数与 WorkspaceState 的嵌套结构一致", () => {
    const changes = diff(emptyState(), fixture());
    // 1 trip + 2 places + 1 stay + 1 day + 2 stops + 1 person + 1 checklist
    // + 1 expense + 1 saved + 1 saved↔trip link + 1 inbox + 1 activity + 1 rule
    expect(countUpserts(changes)).toBe(15);
    expect(changes.upserts.trips).toHaveLength(1);
    expect(changes.upserts.places).toHaveLength(2);
    expect(changes.upserts.stays).toHaveLength(1);
    expect(changes.upserts.itinerary_days).toHaveLength(1);
    expect(changes.upserts.itinerary_stops).toHaveLength(2);
    expect(changes.upserts.trip_people).toHaveLength(1);
    expect(changes.upserts.checklist_items).toHaveLength(1);
    expect(changes.upserts.expenses).toHaveLength(1);
    expect(changes.upserts.saved_items).toHaveLength(1);
    expect(changes.upserts.saved_item_trips).toHaveLength(1);
    expect(changes.upserts.inbox_items).toHaveLength(1);
    expect(changes.upserts.activity).toHaveLength(1);
    expect(changes.upserts.merchant_rules).toHaveLength(1);
    expect(countRemoved(changes)).toBe(0);
  });

  it("改一个字段 → 只 upsert 那一行", () => {
    const before = fixture();
    const after = fixture();
    after.trips[0].places[0].status = "done";
    const changes = diff(before, after);
    expect(countUpserts(changes)).toBe(1);
    expect(countRemoved(changes)).toBe(0);
    expect(changes.upserts.places[0].status).toBe("done");
  });

  it("只换展示顺序 → 0 行（顺序不是内容）", () => {
    const before = fixture();
    const after = fixture();
    after.trips[0].places = [...after.trips[0].places].reverse();
    after.trips[0].checklist = [...after.trips[0].checklist];
    expect(hasChanges(diff(before, after))).toBe(false);
  });

  it("调整 stop 顺序 → 只有 stop_index 变化的那几行被 upsert", () => {
    const before = fixture();
    const after = fixture();
    after.trips[0].routeDays[0].stops = [...after.trips[0].routeDays[0].stops].reverse();
    const changes = diff(before, after);
    expect(changes.upserts.itinerary_stops).toHaveLength(2);
    const byId = new Map(changes.upserts.itinerary_stops.map((r) => [r.id, r.stop_index]));
    expect(byId.get(`${USER_A}:s-1`)).toBe(1);
    expect(byId.get(`${USER_A}:s-2`)).toBe(0);
  });

  it("删 Trip → 子表行删除，真实消费只解绑（trip_id = null）", () => {
    const before = fixture();
    const after = fixture();
    // DELETE_TRIP 的语义：Trip 与它的内容消失，账本保留但变成 Unassigned
    after.trips = [];
    after.saved[0].tripIds = undefined;
    after.transactions[0].tripId = undefined;

    const changes = diff(before, after);
    expect(changes.removed.trips).toHaveLength(1);
    expect(changes.removed.places).toHaveLength(2);
    expect(changes.removed.stays).toHaveLength(1);
    expect(changes.removed.itinerary_days).toHaveLength(1);
    expect(changes.removed.itinerary_stops).toHaveLength(2);
    expect(changes.removed.trip_people).toHaveLength(1);
    expect(changes.removed.checklist_items).toHaveLength(1);
    expect(changes.removed.saved_item_trips).toHaveLength(1);
    // 消费没有被删，只是解绑
    expect(changes.removed.expenses).toHaveLength(0);
    expect(changes.upserts.expenses).toHaveLength(1);
    expect(changes.upserts.expenses[0].trip_id).toBeNull();
  });

  it("Saved 加入 Trip → 只新增一条 saved_item_trips", () => {
    const before = fixture();
    const after = fixture();
    after.saved[0].tripIds = [];
    const changes = diff(before, after);
    expect(countUpserts(changes)).toBe(0);
    expect(changes.removed.saved_item_trips).toHaveLength(1);
    expect(changes.removed.saved_item_trips[0].trip_id).toBe(`${USER_A}:trip-tokyo`);
  });

  it("全部清空 → 每一张表都进入 removed", () => {
    const changes = diff(fixture(), emptyState());
    expect(countUpserts(changes)).toBe(0);
    expect(changes.removed.trips).toHaveLength(1);
    expect(changes.removed.saved_items).toHaveLength(1);
    expect(changes.removed.saved_item_trips).toHaveLength(1);
    expect(changes.removed.expenses).toHaveLength(1);
    expect(changes.removed.inbox_items).toHaveLength(1);
    expect(changes.removed.activity).toHaveLength(1);
    expect(changes.removed.merchant_rules).toHaveLength(1);
    expect(countRemoved(changes)).toBe(15);
  });

  it("对象键顺序不影响判断（规范化比较，不因构造顺序产生幻影写入）", () => {
    const before = fixture();
    const after = fixture();
    // 用不同顺序重建同一个地点对象
    after.trips[0].places[0] = {
      status: "must",
      area: "Asakusa",
      kind: "sight",
      name: "Senso-ji",
      id: "p-1",
    };
    expect(hasChanges(diff(before, after))).toBe(false);
  });
});

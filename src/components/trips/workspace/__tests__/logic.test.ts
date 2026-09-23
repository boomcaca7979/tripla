/**
 * Reducer 语义测试 —— 只覆盖本轮改动触及的路径。
 *
 * 重点是**外部页写入意图**（SAVE_AND_ADD_TO_TRIP）必须与 /trips 内页共享语义，
 * 以及删除 Trip 时不能留下会撞外键的悬空关联。
 */

import { describe, expect, it } from "vitest";

import { fromSavedLinkId, placeKindOfSaved, tripNameTaken, workspaceReducer } from "@/components/trips/workspace/logic";
import type { SavedItem, Trip, WorkspaceState } from "@/components/trips/workspace/types";

function emptyState(): WorkspaceState {
  return { trips: [], saved: [], inbox: [], activity: [], transactions: [], merchantRules: {} };
}

function tripWith(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    destination: "Tokyo",
    country: "Japan",
    status: "upcoming",
    startDate: "2026-10-18",
    endDate: "2026-10-24",
    currency: "CNY",
    budgetPlanned: 0,
    flightBooked: false,
    travelers: [{ id: "t-1", name: "You" }],
    places: [],
    hotels: [],
    routeDays: [],
    expenses: [],
    checklist: [],
    ...overrides,
  };
}

function savedWith(overrides: Partial<SavedItem> = {}): SavedItem {
  return { id: "sv-1", kind: "place", title: "Shibuya Sky", savedAt: "2026-09-20", ...overrides };
}

const SAVED_AT = "2026-09-22T00:00:00.000Z";

describe("workspaceReducer — SAVE_AND_ADD_TO_TRIP", () => {
  it("新对象：写入 Place（fromSaved）+ 收藏 + 关联 + 流水", () => {
    const state: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const next = workspaceReducer(state, {
      type: "SAVE_AND_ADD_TO_TRIP",
      tripId: "trip-1",
      kind: "place",
      title: "Senso-ji",
      meta: "Asakusa",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
      sourceUrl: "/destinations/tokyo",
      placeKind: "sight",
    });

    const place = next.trips[0].places[0];
    expect(next.trips[0].places).toHaveLength(1);
    expect(place.name).toBe("Senso-ji");
    expect(place.kind).toBe("sight");
    expect(place.status).toBe("want");
    expect(place.area).toBe("Asakusa");
    expect(place.note).toBe("Destination · Tokyo");
    expect(place.fromSaved).toBe(true);

    expect(next.saved).toHaveLength(1);
    expect(next.saved[0].kind).toBe("place");
    expect(next.saved[0].title).toBe("Senso-ji");
    expect(next.saved[0].savedAt).toBe(SAVED_AT);
    expect(next.saved[0].sourceUrl).toBe("/destinations/tokyo");
    // Saved ↔ Trip 双向关联
    expect(next.saved[0].tripIds).toEqual(["trip-1"]);

    expect(next.activity[0].text).toBe("Added Senso-ji to Tokyo from Destination · Tokyo");
  });

  it("hotel：进 hotels 而不是 places，价格缺省为 0", () => {
    const state: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const next = workspaceReducer(state, {
      type: "SAVE_AND_ADD_TO_TRIP",
      tripId: "trip-1",
      kind: "hotel",
      title: "Gracery",
      meta: "Shinjuku",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
    });

    expect(next.trips[0].hotels).toHaveLength(1);
    expect(next.trips[0].hotels[0].name).toBe("Gracery");
    expect(next.trips[0].hotels[0].pricePerNight).toBe(0);
    expect(next.trips[0].hotels[0].area).toBe("Shinjuku");
    expect(next.trips[0].places).toHaveLength(0);
    expect(next.saved[0].kind).toBe("hotel");
  });

  it("Trip 不存在 → 返回原状态（不产生半截写入）", () => {
    const state: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const next = workspaceReducer(state, {
      type: "SAVE_AND_ADD_TO_TRIP",
      tripId: "nope",
      kind: "place",
      title: "Senso-ji",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
    });
    expect(next).toBe(state);
  });

  it("重复触发同一对象 → 不产生重复 Place，也不产生重复关联", () => {
    const state: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const action = {
      type: "SAVE_AND_ADD_TO_TRIP" as const,
      tripId: "trip-1",
      kind: "place" as const,
      title: "Senso-ji",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
      placeKind: "sight" as const,
    };
    const once = workspaceReducer(state, action);
    const twice = workspaceReducer(once, action);

    expect(twice.trips[0].places).toHaveLength(1);
    expect(twice.saved).toHaveLength(1);
    // saved_item_trips 的主键是 (saved_item_id, trip_id)：重复行在云端会 23505
    expect(twice.saved[0].tripIds).toEqual(["trip-1"]);
  });

  it("Trip 内已有同名条目（大小写不敏感）→ 只补收藏与关联，不再插入", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [
        tripWith({
          places: [{ id: "p-9", name: "Senso-ji", kind: "sight", status: "must" }],
        }),
      ],
    };
    const next = workspaceReducer(state, {
      type: "SAVE_AND_ADD_TO_TRIP",
      tripId: "trip-1",
      kind: "place",
      title: "SENSO-JI",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
    });

    expect(next.trips[0].places).toHaveLength(1);
    expect(next.trips[0].places[0].status).toBe("must"); // 未被覆盖
    expect(next.saved).toHaveLength(1);
    expect(next.saved[0].tripIds).toEqual(["trip-1"]);
    expect(next.activity).toHaveLength(0); // 没有真的加入，就不写流水
  });

  it("已有收藏 → 刷新来源而不新增行（与数据库唯一索引同口径）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith()],
      saved: [savedWith({ title: "senso-ji", source: "Manual" })],
    };
    const next = workspaceReducer(state, {
      type: "SAVE_AND_ADD_TO_TRIP",
      tripId: "trip-1",
      kind: "place",
      title: "Senso-ji",
      meta: "Asakusa",
      savedAt: SAVED_AT,
      source: "Destination · Tokyo",
    });

    expect(next.saved).toHaveLength(1);
    expect(next.saved[0].id).toBe("sv-1");
    expect(next.saved[0].source).toBe("Destination · Tokyo");
    expect(next.saved[0].tripIds).toEqual(["trip-1"]);
  });
});

describe("workspaceReducer — 既有 Saved 语义不回退", () => {
  it("ADD_SAVED 大小写不敏感去重，只刷新来源", () => {
    const state: WorkspaceState = { ...emptyState(), saved: [savedWith({ title: "Shibuya Sky" })] };
    const next = workspaceReducer(state, {
      type: "ADD_SAVED",
      item: { kind: "place", title: "shibuya sky", savedAt: SAVED_AT, source: "Destination · Tokyo" },
    });
    expect(next.saved).toHaveLength(1);
    expect(next.saved[0].id).toBe("sv-1");
    expect(next.saved[0].source).toBe("Destination · Tokyo");
  });

  it("SAVED_ADD_TO_TRIP 的关联是幂等的", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith()],
      saved: [savedWith()],
    };
    const once = workspaceReducer(state, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "trip-1" });
    const twice = workspaceReducer(once, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "trip-1" });
    expect(twice.saved[0].tripIds).toEqual(["trip-1"]);
  });
});

describe("workspaceReducer — DELETE_TRIP 的引用清理", () => {
  it("删 Trip 时清掉 Saved 上的悬空 tripId（否则云端写入撞 FK 23503）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith({ id: "trip-1" }), tripWith({ id: "trip-2", destination: "Kyoto" })],
      saved: [savedWith({ tripIds: ["trip-1", "trip-2"] })],
    };
    const next = workspaceReducer(state, { type: "DELETE_TRIP", tripId: "trip-1" });

    expect(next.trips.map((t) => t.id)).toEqual(["trip-2"]);
    expect(next.saved[0].tripIds).toEqual(["trip-2"]);
  });

  it("没有引用该 Trip 的收藏对象保持原引用（不误伤）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith({ id: "trip-1" })],
      saved: [savedWith({ id: "sv-x", tripIds: ["trip-other"] })],
    };
    const next = workspaceReducer(state, { type: "DELETE_TRIP", tripId: "trip-1" });
    expect(next.saved[0].tripIds).toEqual(["trip-other"]);
  });
});

describe("tripNameTaken", () => {
  it("places 与 hotels 一起判定，大小写不敏感", () => {
    const trip = tripWith({ places: [{ id: "p-1", name: "Senso-ji", kind: "sight", status: "want" }] });
    expect(tripNameTaken(trip, "senso-ji")).toBe(true);
    expect(tripNameTaken(trip, "Skytree")).toBe(false);
  });
});

// ── Saved → Trip 内实体的稳定身份（重复 Add 幂等） ─────────────────────
//
// 真实浏览器已复现的缺陷：/trips 内 Saved → Add to Trip 连续点两次后，
// trip.places 出现两条同名记录（每次 localId("p") 都是一条新行）。
// 这一组测试把「重复 Add 不得产生重复实体」钉死。

describe("fromSavedLinkId — 稳定身份", () => {
  it("由 (entity, savedId, tripId) 确定性派生：同样的输入永远同样的 id", () => {
    expect(fromSavedLinkId("place", "trip-1", "sv-1")).toBe(fromSavedLinkId("place", "trip-1", "sv-1"));
  });

  it("不同 Trip / 不同收藏 / 不同实体类型 → 互不相同", () => {
    const base = fromSavedLinkId("place", "trip-1", "sv-1");
    expect(fromSavedLinkId("place", "trip-2", "sv-1")).not.toBe(base);
    expect(fromSavedLinkId("place", "trip-1", "sv-2")).not.toBe(base);
    expect(fromSavedLinkId("hotel", "trip-1", "sv-1")).not.toBe(base);
  });

  it("与 localId() 的取值空间不相交（不会与随机 id 撞车）", () => {
    // localId 形如 `p-<base36>-<n>`：只含 [a-z0-9-]，不含分隔符 `:` `@`
    expect(/^[a-z]+-[a-z0-9]+-\d+$/.test(fromSavedLinkId("place", "trip-1", "sv-1"))).toBe(false);
  });
});

describe("workspaceReducer — SAVED_ADD_TO_TRIP 重复 Add 必须幂等", () => {
  const action = { type: "SAVED_ADD_TO_TRIP" as const, itemId: "sv-1", tripId: "trip-1" };

  function stateWithTrip(): WorkspaceState {
    return { ...emptyState(), trips: [tripWith()], saved: [savedWith()] };
  }

  it("连续 Add 三次 → places 只有一条（缺陷复现点）", () => {
    const once = workspaceReducer(stateWithTrip(), action);
    const twice = workspaceReducer(once, action);
    const thrice = workspaceReducer(twice, action);

    expect(once.trips[0].places).toHaveLength(1);
    expect(twice.trips[0].places).toHaveLength(1);
    expect(thrice.trips[0].places).toHaveLength(1);
    // 同一条记录（id 一致），而不是「被替换成另一条」
    expect(twice.trips[0].places[0].id).toBe(once.trips[0].places[0].id);
  });

  it("Place 的 id 是 (savedId, tripId) 的派生值，不是随机 id", () => {
    const next = workspaceReducer(stateWithTrip(), action);
    expect(next.trips[0].places[0].id).toBe(fromSavedLinkId("place", "trip-1", "sv-1"));
    expect(next.trips[0].places[0].fromSaved).toBe(true);
  });

  it("**改名后**再 Add 仍不重复（标题判据在此必然失效，身份判据生效）", () => {
    const once = workspaceReducer(stateWithTrip(), action);
    const placeId = once.trips[0].places[0].id;
    // 用户把 Place 改成完全不同的名字
    const renamed = workspaceReducer(once, {
      type: "EDIT_PLACE",
      tripId: "trip-1",
      placeId,
      name: "Sensō-ji Temple (Asakusa)",
      kind: "sight",
      status: "must",
    });
    expect(renamed.trips[0].places[0].name).toBe("Sensō-ji Temple (Asakusa)");

    const again = workspaceReducer(renamed, action);
    expect(again.trips[0].places).toHaveLength(1);
    expect(again.trips[0].places[0].name).toBe("Sensō-ji Temple (Asakusa)"); // 用户编辑未被覆盖
  });

  it("重复 Add 是**完全空操作**：state 引用不变、流水不增长", () => {
    const once = workspaceReducer(stateWithTrip(), action);
    expect(once.activity).toHaveLength(1);
    const twice = workspaceReducer(once, action);
    expect(twice).toBe(once);
  });

  it("同一条收藏加入**两个不同 Trip** → 各自一条（幂等不跨 Trip 误伤）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith({ id: "trip-1" }), tripWith({ id: "trip-2", destination: "Kyoto" })],
      saved: [savedWith()],
    };
    const first = workspaceReducer(state, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "trip-1" });
    const both = workspaceReducer(first, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "trip-2" });

    expect(both.trips[0].places).toHaveLength(1);
    expect(both.trips[1].places).toHaveLength(1);
    expect(both.trips[0].places[0].id).not.toBe(both.trips[1].places[0].id);
    expect(both.saved[0].tripIds).toEqual(["trip-1", "trip-2"]);
  });

  it("两条不同的收藏加入同一个 Trip → 两条 Place（不会互相吞掉）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith()],
      saved: [savedWith({ id: "sv-1", title: "Senso-ji" }), savedWith({ id: "sv-2", title: "Skytree" })],
    };
    const a = workspaceReducer(state, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "trip-1" });
    const b = workspaceReducer(a, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-2", tripId: "trip-1" });
    expect(b.trips[0].places.map((p) => p.name)).toEqual(["Senso-ji", "Skytree"]);
  });

  it("hotel 收藏走 hotels，同样只插一条", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith()],
      saved: [savedWith({ kind: "hotel", title: "Gracery", meta: "Shinjuku" })],
    };
    const once = workspaceReducer(state, action);
    const twice = workspaceReducer(once, action);
    expect(once.trips[0].hotels).toHaveLength(1);
    expect(twice.trips[0].hotels).toHaveLength(1);
    expect(twice.trips[0].hotels[0].id).toBe(fromSavedLinkId("hotel", "trip-1", "sv-1"));
    expect(twice.trips[0].places).toHaveLength(0);
  });

  it("目标 Trip 不存在 → 一个字节都不写（不留下假的「已加入」关联）", () => {
    const state: WorkspaceState = { ...emptyState(), trips: [tripWith({ id: "trip-1" })], saved: [savedWith()] };
    const next = workspaceReducer(state, { type: "SAVED_ADD_TO_TRIP", itemId: "sv-1", tripId: "gone" });
    expect(next).toBe(state);
    expect(next.saved[0].tripIds).toBeUndefined();
    expect(next.activity).toHaveLength(0);
  });

  it("Place 的分类来自收藏的 kind（activity/guide 不再一律当 sight）", () => {
    const state: WorkspaceState = {
      ...emptyState(),
      trips: [tripWith()],
      saved: [savedWith({ kind: "activity", title: "teamLab" })],
    };
    const next = workspaceReducer(state, action);
    expect(next.trips[0].places[0].kind).toBe("activity");
    expect(placeKindOfSaved("guide")).toBe("activity");
    expect(placeKindOfSaved("place")).toBe("sight");
  });

  it("用户删掉 Place 后重新 Add → 允许重新加入（幂等不等于永久禁止）", () => {
    const once = workspaceReducer(stateWithTrip(), action);
    const removed = workspaceReducer(once, {
      type: "REMOVE_PLACE",
      tripId: "trip-1",
      placeId: once.trips[0].places[0].id,
    });
    expect(removed.trips[0].places).toHaveLength(0);
    const again = workspaceReducer(removed, action);
    expect(again.trips[0].places).toHaveLength(1);
  });
});

describe("workspaceReducer — 外部页(SAVE_AND_ADD_TO_TRIP) 与内页(SAVED_ADD_TO_TRIP) 共用同一身份", () => {
  const SAVED_AT_2 = "2026-09-22T10:00:00.000Z";
  const external = {
    type: "SAVE_AND_ADD_TO_TRIP" as const,
    tripId: "trip-1",
    kind: "place" as const,
    title: "Senso-ji",
    savedAt: SAVED_AT_2,
    source: "Destination · Tokyo",
  };

  it("外部页先 Add → 内页对同一条收藏 Add → 仍只有一条 Place", () => {
    const start: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const fromExternal = workspaceReducer(start, external);
    const savedId = fromExternal.saved[0].id;
    const fromSavedList = workspaceReducer(fromExternal, {
      type: "SAVED_ADD_TO_TRIP",
      itemId: savedId,
      tripId: "trip-1",
    });

    expect(fromExternal.trips[0].places).toHaveLength(1);
    expect(fromSavedList.trips[0].places).toHaveLength(1);
    // 同一身份：外部页写下的 id 就是内页派生出的 id
    expect(fromExternal.trips[0].places[0].id).toBe(fromSavedLinkId("place", "trip-1", savedId));
  });

  it("内页先 Add → 外部页再 Add 同一对象 → 仍只有一条 Place（反向同样收敛）", () => {
    const start: WorkspaceState = { ...emptyState(), trips: [tripWith()], saved: [savedWith({ title: "Senso-ji" })] };
    const fromSavedList = workspaceReducer(start, {
      type: "SAVED_ADD_TO_TRIP",
      itemId: "sv-1",
      tripId: "trip-1",
    });
    const fromExternal = workspaceReducer(fromSavedList, external);

    expect(fromExternal.trips[0].places).toHaveLength(1);
    expect(fromExternal.saved).toHaveLength(1); // 收藏按 (kind, lower(title)) 仍是一条
    expect(fromExternal.trips[0].places[0].id).toBe(fromSavedLinkId("place", "trip-1", "sv-1"));
  });

  it("外部页重复 Add 同一标题 → 身份判据生效（即使 Place 被改名也不重复）", () => {
    const start: WorkspaceState = { ...emptyState(), trips: [tripWith()] };
    const once = workspaceReducer(start, external);
    const renamed = workspaceReducer(once, {
      type: "EDIT_PLACE",
      tripId: "trip-1",
      placeId: once.trips[0].places[0].id,
      name: "Renamed Temple",
      kind: "sight",
      status: "want",
    });
    const twice = workspaceReducer(renamed, external);
    expect(twice.trips[0].places).toHaveLength(1);
  });
});

/**
 * 匿名通道测试。
 *
 * 重点不是"能存能读"，而是两条容易被忽略的失败语义：
 *  - 读失败要**退化**（损坏数据 / 隐私模式 → 当作没有数据，不抛）；
 *  - 写失败要**抛错**（配额满 / 存储被禁 → 绝不当成保存成功）。
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceState } from "@/components/trips/workspace/types";
import {
  GUEST_WORKSPACE_KEY,
  loadGuestWorkspace,
  loadGuestWorkspaceOrEmpty,
  saveGuestWorkspace,
} from "@/lib/workspace/guest";

class MemoryStorage {
  private readonly map = new Map<string, string>();
  failWrites = false;

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new DOMException("QuotaExceededError");
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function install(storage: MemoryStorage): void {
  vi.stubGlobal("window", { localStorage: storage });
}

function sampleState(): WorkspaceState {
  return {
    trips: [],
    saved: [{ id: "sv-1", kind: "place", title: "Shibuya Sky", savedAt: "2026-09-20" }],
    inbox: [],
    activity: [{ id: "a-1", text: "Saved Shibuya Sky", at: "Sep 20, 09:14" }],
    transactions: [],
    merchantRules: { sushi: { category: "food" } },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("workspace/guest", () => {
  it("从未存过 → null（区别于「存过但是空的」）", () => {
    install(new MemoryStorage());
    expect(loadGuestWorkspace()).toBeNull();
    expect(loadGuestWorkspaceOrEmpty()).toEqual({
      trips: [],
      saved: [],
      inbox: [],
      activity: [],
      transactions: [],
      merchantRules: {},
    });
  });

  it("写入后读回逐字段一致", () => {
    install(new MemoryStorage());
    const state = sampleState();
    saveGuestWorkspace(state);
    expect(loadGuestWorkspace()).toEqual(state);
  });

  it("损坏 JSON → null（不抛，不覆盖磁盘上的原始内容）", () => {
    const storage = new MemoryStorage();
    storage.setItem(GUEST_WORKSPACE_KEY, "{not json");
    install(storage);
    expect(loadGuestWorkspace()).toBeNull();
    // 证据保留：损坏的内容不被静默清掉
    expect(storage.getItem(GUEST_WORKSPACE_KEY)).toBe("{not json");
  });

  it("形状不对（缺字段）→ 当作没有数据", () => {
    const storage = new MemoryStorage();
    storage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify({ trips: [], saved: [] }));
    install(storage);
    expect(loadGuestWorkspace()).toBeNull();
  });

  it("写入失败必须抛错（配额满 / 隐私模式不得假装成功）", () => {
    const storage = new MemoryStorage();
    storage.failWrites = true;
    install(storage);
    expect(() => saveGuestWorkspace(sampleState())).toThrow();
  });

  it("SSR（没有 window）→ 读为 null，写为 no-op 且不抛", () => {
    expect(loadGuestWorkspace()).toBeNull();
    expect(() => saveGuestWorkspace(sampleState())).not.toThrow();
  });
});

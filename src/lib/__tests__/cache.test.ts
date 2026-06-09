import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TravelCache, cache } from "../cache";

// ─── Helpers ─────────────────────────────────────────────────────

/** Advance fake timers past the given TTL, then clear it so Date.now()
 *  behaves normally for the next operation. */
function advancePastTtl(ms: number): void {
  vi.advanceTimersByTime(ms + 1);
}

// ─── TravelCache ─────────────────────────────────────────────────

describe("TravelCache", () => {
  let subject: TravelCache;

  beforeEach(() => {
    vi.useFakeTimers();
    subject = new TravelCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── set / get ──────────────────────────────────────────────────

  it("stores and retrieves a value", () => {
    subject.set("greeting", "hello", 60_000);
    expect(subject.get<string>("greeting")).toBe("hello");
  });

  it("retrieves a numeric value", () => {
    subject.set("count", 42, 60_000);
    expect(subject.get<number>("count")).toBe(42);
  });

  it("retrieves an object value", () => {
    const obj = { a: 1, b: [2, 3] };
    subject.set("obj", obj, 60_000);
    expect(subject.get<typeof obj>("obj")).toEqual(obj);
  });

  it("returns null for a missing key", () => {
    expect(subject.get<string>("nope")).toBeNull();
  });

  // ── TTL expiry ─────────────────────────────────────────────────

  it("returns null after the TTL expires", () => {
    subject.set("ephemeral", "data", 100); // 100 ms TTL
    expect(subject.get<string>("ephemeral")).toBe("data");

    advancePastTtl(100);

    expect(subject.get<string>("ephemeral")).toBeNull();
  });

  it("keeps a value alive before the TTL", () => {
    subject.set("lasting", "still-here", 5_000);
    vi.advanceTimersByTime(4_000);
    expect(subject.get<string>("lasting")).toBe("still-here");
  });

  it("handles zero TTL (expires immediately)", () => {
    subject.set("gone", "bye", 0);
    advancePastTtl(0);
    expect(subject.get<string>("gone")).toBeNull();
  });

  // ── Overwrite ──────────────────────────────────────────────────

  it("overwrites an existing key", () => {
    subject.set("key", "old", 60_000);
    subject.set("key", "new", 60_000);
    expect(subject.get<string>("key")).toBe("new");
  });

  // ── Delete ─────────────────────────────────────────────────────

  it("deletes a specific key", () => {
    subject.set("a", 1, 60_000);
    subject.set("b", 2, 60_000);
    subject.delete("a");

    expect(subject.get<number>("a")).toBeNull();
    expect(subject.get<number>("b")).toBe(2);
  });

  // ── Clear ──────────────────────────────────────────────────────

  it("clears all entries", () => {
    subject.set("x", 10, 60_000);
    subject.set("y", 20, 60_000);
    subject.set("z", 30, 60_000);
    subject.clear();

    expect(subject.get<number>("x")).toBeNull();
    expect(subject.get<number>("y")).toBeNull();
    expect(subject.get<number>("z")).toBeNull();
  });

  // ── Overlapping namespaces ─────────────────────────────────────

  it("does not confuse keys with similar prefixes", () => {
    subject.set("flight_tpe_nrt", "data-a", 60_000);
    subject.set("flight_tpe_nrt_extra", "data-b", 60_000);

    expect(subject.get<string>("flight_tpe_nrt")).toBe("data-a");
    expect(subject.get<string>("flight_tpe_nrt_extra")).toBe("data-b");

    subject.delete("flight_tpe_nrt");
    expect(subject.get<string>("flight_tpe_nrt")).toBeNull();
    expect(subject.get<string>("flight_tpe_nrt_extra")).toBe("data-b");
  });
});

// ─── Singleton ───────────────────────────────────────────────────

describe("cache singleton", () => {
  it("is a TravelCache instance", () => {
    expect(cache).toBeInstanceOf(TravelCache);
  });

  it("survives get/set round-trips", () => {
    cache.set("singleton_test", "works", 60_000);
    expect(cache.get<string>("singleton_test")).toBe("works");
    cache.delete("singleton_test");
  });
});

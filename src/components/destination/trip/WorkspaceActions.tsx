"use client";

/**
 * WorkspaceActions — Destinations / Guides 页面的最小工作区接入（蓝图 #9/#10/#11）。
 *
 * 两个动作：
 *  - Save        → 全局 Saved（travel-workspace.upsertSavedItem，幂等去重）
 *  - Add to Trip → Modal 选择用户 Trip（或新建）→ 直接写入该 Trip
 *
 * 不跳页、不改变页面布局，只以一枚次级按钮 + 弹层存在。
 * 数据写 localStorage（utripla.trips.workspace.v5），/trips 下次挂载自动恢复。
 */

import { useState } from "react";
import { DESTINATIONS } from "@/data/destinations";
import {
  addPageItemToTrip,
  readTripOptions,
  tripHasItem,
  upsertSavedItem,
} from "@/lib/travel-workspace";

export type WorkspaceKind = "place" | "hotel" | "activity" | "guide" | "restaurant";

export default function WorkspaceActions({
  kind,
  title,
  city,
  source,
  sourceUrl,
  compact = false,
}: {
  kind: WorkspaceKind;
  title: string;
  /** 所在城市 / 区域（写入 Trip 条目的 area） */
  city?: string;
  /** 来源标签，如 "Destination · Tokyo" */
  source: string;
  sourceUrl?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<Array<{ id: string; destination: string; currency: string }>>([]);
  const [savedDone, setSavedDone] = useState(false);
  const [addedTrip, setAddedTrip] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newDestination, setNewDestination] = useState(city ?? "");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const openModal = () => {
    const opts = readTripOptions();
    setTrips(opts);
    setNewDestination(city ?? "");
    setCreating(opts.length === 0);
    setOpen(true);
  };

  const save = () => {
    upsertSavedItem({ kind, title, meta: city, source, sourceUrl });
    setSavedDone(true);
  };

  const addTo = (tripId: string) => {
    const res = addPageItemToTrip(tripId, { kind, title, meta: city, source, sourceUrl });
    if (res.ok) {
      setAddedTrip(tripId);
      setTimeout(() => setOpen(false), 900);
    }
  };

  const createAndAdd = () => {
    if (!newDestination.trim() || !newStart || !newEnd) return;
    // 直接经 lib 创建 Trip（写 localStorage），再添加当前对象
    const id = createTripViaLib(newDestination.trim(), newStart, newEnd);
    if (id) addTo(id);
  };

  const sizeCls = compact
    ? "min-h-[30px] px-2.5 py-1 text-[0.75rem]"
    : "min-h-[36px] px-3.5 py-1.5 text-[0.8125rem]";

  return (
    <>
      <span className="inline-flex items-center gap-1.5 align-middle">
        <button
          type="button"
          onClick={save}
          aria-pressed={savedDone}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border transition-colors ${sizeCls} ${
            savedDone
              ? "border-ut-accent bg-ut-accent text-white"
              : "border-ut-border-strong text-ut-text hover:bg-ut-surface-hover"
          }`}
        >
          <span aria-hidden="true">{savedDone ? "✓" : "🔖"}</span>
          {savedDone ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={openModal}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ut-border-strong transition-colors hover:bg-ut-surface-hover ${sizeCls} text-ut-text`}
        >
          <span aria-hidden="true">+</span>
          Add to Trip
        </button>
      </span>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add to trip"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e8ecec] bg-white p-6 shadow-[0_12px_40px_rgba(23,36,42,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[1.0625rem] font-bold tracking-[-0.01em] text-[#17242a]">Add to trip</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#dfe5e4] text-[0.8rem] text-[#8a969a] hover:text-[#17242a]"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-[0.8125rem] text-[#5c6b70]">
              <span className="font-semibold text-[#17242a]">{title}</span>
              {city ? ` · ${city}` : ""}
            </p>

            {addedTrip ? (
              <p className="rounded-xl bg-[#e0f3ea] px-4 py-3 text-[0.875rem] font-semibold text-[#0b6b47]">
                ✓ Added to {trips.find((t) => t.id === addedTrip)?.destination ?? "trip"}
              </p>
            ) : (
              <>
                {trips.length > 0 && !creating && (
                  <ul className="mb-3 space-y-1.5">
                    {trips.map((t) => {
                      const inTrip = tripHasItem(t.id, title);
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            disabled={inTrip}
                            onClick={() => addTo(t.id)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-[0.875rem] transition-colors ${
                              inTrip
                                ? "cursor-not-allowed border-[#e8ecec] bg-[#f6f8f7] text-[#9aa5a8]"
                                : "border-[#e3e8e7] text-[#17242a] hover:border-ut-accent hover:bg-[#f6fbf9]"
                            }`}
                          >
                            <span className="font-semibold">{t.destination}</span>
                            <span aria-hidden="true" className="text-[0.8125rem]">
                              {inTrip ? "✓ In trip" : "Add →"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!creating ? (
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="w-full cursor-pointer rounded-xl border border-dashed border-[#c6d0ce] px-4 py-3 text-left text-[0.875rem] font-semibold text-ut-accent hover:bg-[#f6fbf9]"
                  >
                    + New trip
                  </button>
                ) : (
                  <div className="rounded-xl border border-[#e3e8e7] bg-[#f6f8f7] p-4">
                    <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[#5c6b70]">
                      Create a trip
                    </p>
                    <div className="grid gap-2.5">
                      <input
                        className="h-10 w-full rounded-lg border border-[#e3e8e7] bg-white px-3 text-[0.875rem] text-[#17242a] focus:outline-none"
                        placeholder="Destination"
                        value={newDestination}
                        onChange={(e) => setNewDestination(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          className="h-10 w-full rounded-lg border border-[#e3e8e7] bg-white px-3 text-[0.8125rem] text-[#17242a] focus:outline-none"
                          type="date"
                          value={newStart}
                          onChange={(e) => setNewStart(e.target.value)}
                          aria-label="Start date"
                        />
                        <input
                          className="h-10 w-full rounded-lg border border-[#e3e8e7] bg-white px-3 text-[0.8125rem] text-[#17242a] focus:outline-none"
                          type="date"
                          value={newEnd}
                          onChange={(e) => setNewEnd(e.target.value)}
                          aria-label="End date"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={createAndAdd}
                        disabled={!newDestination.trim() || !newStart || !newEnd}
                        className="min-h-[36px] cursor-pointer rounded-full bg-ut-accent px-4 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-ut-accent-strong disabled:opacity-40"
                      >
                        Create &amp; add
                      </button>
                      {trips.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCreating(false)}
                          className="min-h-[36px] cursor-pointer rounded-full border border-[#dfe5e4] px-4 text-[0.8125rem] font-semibold text-[#5c6b70] hover:text-[#17242a]"
                        >
                          Back
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {trips.length === 0 && !creating && (
                  <p className="text-[0.8125rem] text-[#5c6b70]">You don&apos;t have any trips yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** lib 层创建 Trip（与 /trips CREATE_TRIP 的默认值一致：You 单旅客、空容器）。 */
function createTripViaLib(destination: string, startDate: string, endDate: string): string | null {
  if (typeof window === "undefined") return null;
  // 按名称匹配真实 Destination（蓝图 #5/#8）：destinationId/slug/country/image 快照
  const dest = DESTINATIONS.find(
    (d) => d.city.toLowerCase() === destination.trim().toLowerCase(),
  );
  try {
    const raw = window.localStorage.getItem("utripla.trips.workspace.v5");
    const state = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    if (!state || !Array.isArray(state.trips)) return null;
    const id = `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const status = deriveStatus(startDate, endDate);
    (state.trips as unknown[]).unshift({
      id,
      destination,
      destinationId: dest?.slug,
      destinationSlug: dest?.slug,
      destinationImage: dest?.image ?? null,
      country: dest?.country ?? "",
      currency: "¥",
      status,
      startDate,
      endDate,
      travelers: [{ id: `t-${Date.now().toString(36)}`, name: "You" }],
      places: [],
      hotels: [],
      routeDays: [],
      expenses: [],
      checklist: [],
      budgetPlanned: 0,
    });
    (state.activity as unknown[]).unshift({
      id: `a-${Date.now().toString(36)}`,
      at: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
      text: `Created trip ${destination}`,
    });
    window.localStorage.setItem("utripla.trips.workspace.v5", JSON.stringify(state));
    return id;
  } catch {
    return null;
  }
}

function deriveStatus(startDate: string, endDate: string): "current" | "upcoming" | "past" {
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (end < start) return "upcoming";
  if (start > t0) return "upcoming";
  if (end < t0) return "past";
  return "current";
}

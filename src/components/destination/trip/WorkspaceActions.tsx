"use client";

/**
 * WorkspaceActions — Destinations / Guides 页面的最小工作区接入（蓝图 #9/#10/#11）。
 *
 * 两个动作：
 *  - Save        → 全局 Saved（幂等去重：同 title 大小写不敏感 + 同 kind）
 *  - Add to Trip → Modal 选择用户 Trip（或新建）→ 写入该 Trip
 *
 * 本组件只声明**意图**；落到 localStorage 还是 Supabase 由
 * `@/lib/travel-workspace` 按当前身份解析（见该模块的边界说明）。
 * 因此这里既没有 localStorage、也没有 Supabase 的调用。
 *
 * 失败不置成功态：Save 失败时按钮停在可重试的形态，Add to Trip 失败时在
 * 弹层里给出原因，而不是显示 "✓ Added" 骗用户。
 */

import { useState } from "react";
import {
  addPageItemToTrip,
  createPageTrip,
  readTripOptions,
  resolvePageMode,
  savePageItem,
  type PageFailure,
  type TripOption,
} from "@/lib/travel-workspace";

export type WorkspaceKind = "place" | "hotel" | "activity" | "guide" | "restaurant";

/** 失败原因 → 人话。RLS 拒绝（42501）与网络失败要能分辨。 */
function describeFailure(failure: PageFailure): string {
  if (failure.reason === "not-ready") {
    return "Couldn't confirm your account — try again in a moment.";
  }
  if (failure.reason === "no-trip") {
    return "That trip no longer exists.";
  }
  if (failure.code === "42501") {
    return "Your account isn't allowed to change this trip.";
  }
  return "Couldn't reach your account — nothing was saved. Retry.";
}

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
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [savedDone, setSavedDone] = useState(false);
  const [addedTrip, setAddedTrip] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newDestination, setNewDestination] = useState(city ?? "");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const input = { kind, title, meta: city, source, sourceUrl };

  const save = async () => {
    const mode = await resolvePageMode();
    if (!mode) {
      setSaveError(describeFailure({ ok: false, reason: "not-ready" }));
      return;
    }
    setPending(true);
    setSaveError(null);
    const res = await savePageItem(mode, input);
    setPending(false);
    if (res.ok) {
      setSavedDone(true);
      return;
    }
    setSavedDone(false);
    setSaveError(describeFailure(res));
  };

  const openModal = async () => {
    setOpen(true);
    setAddedTrip(null);
    setModalError(null);
    setNewDestination(city ?? "");
    setCreating(false);
    const mode = await resolvePageMode();
    if (!mode) {
      setTrips([]);
      setCreating(true);
      setModalError(describeFailure({ ok: false, reason: "not-ready" }));
      return;
    }
    setLoadingTrips(true);
    try {
      const opts = await readTripOptions(mode, title);
      setTrips(opts);
      // 没有 Trip 时直接进创建表单
      setCreating(opts.length === 0);
    } catch {
      setTrips([]);
      setCreating(true);
      setModalError("Couldn't load your trips. Retry, or create a new one.");
    } finally {
      setLoadingTrips(false);
    }
  };

  const addTo = async (tripId: string) => {
    const mode = await resolvePageMode();
    if (!mode) {
      setModalError(describeFailure({ ok: false, reason: "not-ready" }));
      return;
    }
    setPending(true);
    setModalError(null);
    const res = await addPageItemToTrip(mode, tripId, input);
    setPending(false);
    if (!res.ok) {
      setModalError(describeFailure(res));
      return;
    }
    setAddedTrip(tripId);
    setTimeout(() => setOpen(false), 900);
  };

  const createAndAdd = async () => {
    if (!newDestination.trim() || !newStart || !newEnd) return;
    const mode = await resolvePageMode();
    if (!mode) {
      setModalError(describeFailure({ ok: false, reason: "not-ready" }));
      return;
    }
    setPending(true);
    setModalError(null);
    const created = await createPageTrip(mode, newDestination.trim(), newStart, newEnd);
    setPending(false);
    if (!created.ok) {
      setModalError(describeFailure(created));
      return;
    }
    await addTo(created.id);
  };

  const sizeCls = compact
    ? "min-h-[30px] px-2.5 py-1 text-[0.75rem]"
    : "min-h-[36px] px-3.5 py-1.5 text-[0.8125rem]";

  const saveFailed = Boolean(saveError) && !savedDone;

  return (
    <>
      <span className="inline-flex items-center gap-1.5 align-middle">
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          aria-pressed={savedDone}
          title={saveError ?? undefined}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border transition-colors disabled:opacity-60 ${sizeCls} ${
            savedDone
              ? "border-ut-accent bg-ut-accent text-white"
              : saveFailed
                ? "border-[#d92d20] text-[#b42318]"
                : "border-ut-border-strong text-ut-text hover:bg-ut-surface-hover"
          }`}
        >
          <span aria-hidden="true">{savedDone ? "✓" : saveFailed ? "↻" : "🔖"}</span>
          {savedDone ? "Saved" : saveFailed ? "Retry save" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => void openModal()}
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

            {modalError && (
              <p
                role="alert"
                className="mb-3 rounded-xl bg-[#fef3f2] px-4 py-3 text-[0.8125rem] font-semibold text-[#b42318]"
              >
                {modalError}
              </p>
            )}

            {addedTrip ? (
              <p className="rounded-xl bg-[#e0f3ea] px-4 py-3 text-[0.875rem] font-semibold text-[#0b6b47]">
                ✓ Added to {trips.find((t) => t.id === addedTrip)?.destination ?? "trip"}
              </p>
            ) : (
              <>
                {loadingTrips && (
                  <p className="mb-3 text-[0.8125rem] text-[#5c6b70]">Loading your trips…</p>
                )}

                {trips.length > 0 && !creating && (
                  <ul className="mb-3 space-y-1.5">
                    {trips.map((t) => {
                      const inTrip = t.hasItem;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            disabled={inTrip || pending}
                            onClick={() => void addTo(t.id)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-[0.875rem] transition-colors disabled:opacity-60 ${
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
                        onClick={() => void createAndAdd()}
                        disabled={!newDestination.trim() || !newStart || !newEnd || pending}
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

                {trips.length === 0 && !creating && !loadingTrips && (
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

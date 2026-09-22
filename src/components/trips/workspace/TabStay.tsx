"use client";

/**
 * TabStay — 数据库式住宿对比列表（Workspace-driven 重构）。
 *
 * 范式：
 *  - 表格列：Status / Hotel / Area / Price /night / Nights / Total（Total 自动计算）；
 *  - + Add hotel = 底部 inline 新行，Enter 保存；
 *  - 每格 click → inline edit（含 Status：Considering/Preferred/Booked 下拉）；
 *  - 点击行尾 "Details" 展开轻量详情（rating / breakfast / cancellation / notes），
 *    不再使用 window.prompt（旧交互已废弃）。
 */

import { useEffect, useRef, useState } from "react";
import type { Hotel, Trip, WorkspaceAction } from "./types";
import { money } from "./logic";
import { parseQuickCapture } from "./expenses/engine";
import {
  CaptureLine,
  HoverActions,
  HoverDelete,
  InlineNumber,
  InlineSelect,
  InlineText,
} from "./inline";
import { ModuleHead, Panel } from "./ui";

type HotelStatus = "considering" | "preferred" | "booked";

const statusOptions: Array<{ value: HotelStatus; label: string }> = [
  { value: "considering", label: "Considering" },
  { value: "preferred", label: "Preferred" },
  { value: "booked", label: "Booked" },
];

const statusPill = (s: HotelStatus) =>
  s === "booked"
    ? "bg-ut-accent/15 text-[#0b6b47]"
    : s === "preferred"
      ? "bg-[#fdf3df] text-[#8a5a12]"
      : "bg-[#f6f8f7] text-ut-text-2";

export default function TabStay({
  trip,
  dispatch,
  addNonce,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const captureRef = useRef<HTMLInputElement | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  useEffect(() => {
    if (addNonce > 0) captureRef.current?.focus();
  }, [addNonce]);

  const statusOf = (h: Hotel): HotelStatus => (h.booked ? "booked" : h.preferred ? "preferred" : "considering");

  const setStatus = (h: Hotel, s: HotelStatus) => {
    if (s === "booked") {
      dispatch({
        type: "SET_HOTEL_FLAG",
        tripId: trip.id,
        hotelId: h.id,
        flag: "booked",
        value: true,
        nights: h.nights ?? 1,
      });
    } else {
      if (h.booked) {
        dispatch({ type: "SET_HOTEL_FLAG", tripId: trip.id, hotelId: h.id, flag: "booked", value: false });
      }
      dispatch({
        type: "SET_HOTEL_FLAG",
        tripId: trip.id,
        hotelId: h.id,
        flag: "preferred",
        value: s === "preferred",
      });
    }
  };

  const patch = (h: Hotel, next: Partial<Pick<Hotel, "name" | "area" | "pricePerNight" | "nights">>) => {
    if (next.name !== undefined) {
      // 名称编辑走 EDIT——当前 reducer 无 EDIT_HOTEL，用 SET_HOTEL_FLAG 语义不符；
      // 名称/区域通过专用 reducer 分支处理（见 logic.ts PATCH_HOTEL）。
      dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: next } as never);
      return;
    }
    if (next.pricePerNight !== undefined || next.nights !== undefined) {
      dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: next } as never);
      return;
    }
    if (next.area !== undefined) {
      dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: next } as never);
    }
  };

  const committedTotal = trip.hotels
    .filter((h) => h.booked)
    .reduce((s, h) => s + h.pricePerNight * Math.max(1, h.nights ?? 1), 0);

  return (
    <div>
      <ModuleHead
        title="Stay"
        meta={committedTotal > 0 ? `${money(committedTotal, trip.currency)} committed` : "Hotel shortlist"}
      />

      <Panel className="divide-y divide-[#eef1f0]">
        {trip.hotels.length === 0 && (
          <p className="px-5 pt-6 text-center text-body text-ut-text-2">No hotels saved yet.</p>
        )}

        {/* 表头 */}
        {trip.hotels.length > 0 && (
          <div className="grid grid-cols-[7rem_minmax(0,2fr)_minmax(0,1.2fr)_6rem_5rem_6rem_minmax(5rem,auto)] items-center gap-x-3 px-4 pt-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ut-muted">
            <span>Status</span>
            <span>Hotel</span>
            <span className="hidden md:block">Area</span>
            <span className="text-right">/night</span>
            <span className="text-right">Nights</span>
            <span className="text-right">Total</span>
            <span aria-hidden="true" />
          </div>
        )}

        {trip.hotels.map((h) => {
          const s = statusOf(h);
          const total = h.pricePerNight * Math.max(1, h.nights ?? 1);
          return (
            <div key={h.id} className="group px-4 py-1.5">
              <div className="grid grid-cols-[7rem_minmax(0,2fr)_minmax(0,1.2fr)_6rem_5rem_6rem_minmax(5rem,auto)] items-center gap-x-3">
                <InlineSelect
                  value={s}
                  options={statusOptions}
                  render={(v) => (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${statusPill(v)}`}>
                      {statusOptions.find((o) => o.value === v)?.label}
                    </span>
                  )}
                  onCommit={(next) => setStatus(h, next)}
                />
                <div className="min-w-0">
                  <InlineText
                    value={h.name}
                    className="truncate text-[0.9375rem] font-medium text-ut-ink"
                    placeholder="Hotel name"
                    onCommit={(name) => name && patch(h, { name })}
                  />
                </div>
                <div className="hidden min-w-0 md:block">
                  <InlineText
                    value={h.area ?? ""}
                    muted={!h.area}
                    placeholder="Area…"
                    onCommit={(area) => patch(h, { area: area || undefined })}
                  />
                </div>
                <InlineNumber
                  value={h.pricePerNight}
                  display={h.pricePerNight > 0 ? money(h.pricePerNight, trip.currency) : "—"}
                  onCommit={(pricePerNight) => patch(h, { pricePerNight })}
                />
                <InlineNumber
                  value={h.nights ?? 0}
                  display={h.nights ? String(h.nights) : "—"}
                  onCommit={(nights) => patch(h, { nights: nights > 0 ? nights : undefined })}
                />
                <span className="text-right text-[0.8125rem] font-medium tabular-nums text-ut-text-2">
                  {h.pricePerNight > 0 ? money(total, trip.currency) : "—"}
                </span>
                <HoverActions>
                  <button
                    type="button"
                    aria-expanded={detailId === h.id}
                    className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] transition-colors hover:text-ut-ink"
                    onClick={() => setDetailId(detailId === h.id ? null : h.id)}
                  >
                    Details
                  </button>
                  <HoverDelete
                    label={h.name}
                    onConfirm={() => dispatch({ type: "REMOVE_HOTEL", tripId: trip.id, hotelId: h.id })}
                  />
                </HoverActions>
              </div>

              {/* 展开详情（spec #15：轻量 side panel，非巨型 Modal） */}
              {detailId === h.id && (
                <div className="mb-3 mt-2 grid gap-x-8 gap-y-3 rounded-xl border border-[#eef1f0] bg-[#f6f8f7] p-4 sm:grid-cols-2">
                  <DetailField
                    label="Rating (0-5)"
                    value={h.rating != null ? String(h.rating) : ""}
                    placeholder="—"
                    onCommit={(raw) => {
                      const r = Number(raw);
                      dispatch({
                        type: "PATCH_HOTEL",
                        tripId: trip.id,
                        hotelId: h.id,
                        patch: { rating: Number.isFinite(r) && r > 0 && r <= 5 ? r : undefined },
                      } as never);
                    }}
                  />
                  <div>
                    <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-muted">Breakfast</p>
                    <InlineSelect
                      value={h.breakfast ? "yes" : "no"}
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                      onCommit={(v) =>
                        dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: { breakfast: v === "yes" } } as never)
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-muted">Cancellation</p>
                    <InlineSelect
                      value={h.freeCancellation ? "free" : "fixed"}
                      options={[
                        { value: "fixed", label: "Fixed" },
                        { value: "free", label: "Free" },
                      ]}
                      onCommit={(v) =>
                        dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: { freeCancellation: v === "free" } } as never)
                      }
                    />
                  </div>
                  <DetailField
                    label="Notes"
                    value={h.notes ?? ""}
                    placeholder="Breakfast, cancellation, why you like it…"
                    onCommit={(notes) =>
                      dispatch({ type: "PATCH_HOTEL", tripId: trip.id, hotelId: h.id, patch: { notes: notes || undefined } } as never)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* 永久捕获行："Hotel Gracery 6000" → 名称 + 每晚价（其余属性之后整理） */}
        <CaptureLine
          focusRef={captureRef}
          placeholder="Write something...  e.g. Hotel Gracery 6000"
          onSubmit={(text) => {
            const parsed = parseQuickCapture(text);
            const name = parsed.title.trim();
            if (!name && parsed.amount === undefined) return;
            dispatch({
              type: "ADD_HOTEL",
              tripId: trip.id,
              name: name || "Untitled hotel",
              pricePerNight: parsed.amount ?? 0,
            });
          }}
        />
      </Panel>
    </div>
  );
}

function DetailField({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (next: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-muted">{label}</p>
      <InlineText value={value} placeholder={placeholder} onCommit={onCommit} />
    </div>
  );
}

"use client";

/**
 * TabPlaces — Notion database 式地点列表（Workspace-driven 重构）。
 *
 * 范式：See → Click → Edit。
 *  - 底部永久捕获行：写地名按 Enter 即成一条地点（Capture first，spec #22）；
 *  - 每个字段 click → inline edit（名称/区域文字、类型/状态下拉）；
 *  - hover 行尾出现 Add to itinerary / Delete（spec #30）；
 *  - All / Want / Must / Done 状态过滤保留。
 */

import { useEffect, useRef, useState } from "react";
import type { PlaceKind, PlaceStatus, Trip, WorkspaceAction } from "./types";
import { PLACE_KIND_LABELS, PLACE_STATUS_LABELS } from "./logic";
import {
  CaptureLine,
  HoverActions,
  HoverDelete,
  InlineSelect,
  InlineText,
} from "./inline";
import { ModuleHead, Panel } from "./ui";

const STATUS_ORDER: PlaceStatus[] = ["want", "must", "done", "skipped"];
const KINDS: PlaceKind[] = ["sight", "food", "activity", "nature", "shopping"];

const kindOptions = KINDS.map((k) => ({ value: k, label: PLACE_KIND_LABELS[k] }));
const statusOptions = STATUS_ORDER.map((s) => ({ value: s, label: PLACE_STATUS_LABELS[s] }));

const KIND_DOT: Record<PlaceKind, string> = {
  sight: "🗼",
  food: "🍜",
  activity: "🎫",
  nature: "🌿",
  shopping: "🛍️",
};

export default function TabPlaces({
  trip,
  dispatch,
  addNonce,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const [filter, setFilter] = useState<PlaceStatus | "all">("all");
  const captureRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (addNonce > 0) captureRef.current?.focus();
  }, [addNonce]);

  const counts = new Map<PlaceStatus, number>();
  for (const p of trip.places) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
  const shown = filter === "all" ? trip.places : trip.places.filter((p) => p.status === filter);

  const addPlace = (name: string, kind: PlaceKind, area: string, note: string) => {
    dispatch({ type: "ADD_PLACE", tripId: trip.id, name, kind, area: area || undefined, note: note || undefined });
  };

  return (
    <div>
      <ModuleHead title="Places" meta={`${trip.places.length} saved`} />

      {/* 状态过滤（database view tabs） */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-[#e8ecec]">
        {(["all", ...STATUS_ORDER] as Array<PlaceStatus | "all">).map((s) => {
          const label = s === "all" ? "All" : PLACE_STATUS_LABELS[s];
          const count = s === "all" ? trip.places.length : (counts.get(s) ?? 0);
          const active = filter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-current={active ? "true" : undefined}
              className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-t-lg px-3.5 text-[0.8125rem] font-medium transition-colors ${
                active ? "border-b-2 border-ut-accent text-ut-ink" : "text-ut-text-2 hover:text-ut-ink"
              }`}
            >
              {label}
              <span className="text-[0.6875rem] text-[#9aa5a8]">{count}</span>
            </button>
          );
        })}
      </div>

      <Panel className="divide-y divide-[#eef1f0] overflow-visible">
        {shown.length === 0 && (
          <p className="px-5 pt-6 text-center text-body text-ut-text-2">
            {trip.places.length === 0 ? "No places yet." : "Nothing with this status."}
          </p>
        )}

        {shown.map((p) => (
          <div key={p.id} className="group grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-2.5 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            {/* Name */}
            <div className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="text-[0.8rem]">{KIND_DOT[p.kind]}</span>
              <span className="min-w-0 flex-1">
                <InlineText
                  value={p.name}
                  className="text-[0.9375rem] font-medium text-ut-ink"
                  placeholder="Name"
                  onCommit={(next) => {
                    if (!next) return;
                    dispatch({
                      type: "EDIT_PLACE",
                      tripId: trip.id,
                      placeId: p.id,
                      name: next,
                      kind: p.kind,
                      area: p.area,
                      note: p.note,
                      status: p.status,
                    });
                  }}
                />
              </span>
              {p.fromSaved && (
                <span className="shrink-0 rounded-full bg-[#e0f3ea] px-2 py-0.5 text-[0.625rem] font-semibold text-[#0b6b47]">
                  Saved
                </span>
              )}
            </div>
            {/* Area */}
            <div className="hidden min-w-0 md:block">
              <InlineText
                value={p.area ?? ""}
                muted={!p.area}
                placeholder="Area…"
                onCommit={(next) =>
                  dispatch({
                    type: "EDIT_PLACE",
                    tripId: trip.id,
                    placeId: p.id,
                    name: p.name,
                    kind: p.kind,
                    area: next || undefined,
                    note: p.note,
                    status: p.status,
                  })
                }
              />
            </div>
            {/* Status（含类型下拉合并：Notion 的 select cell） */}
            <div className="flex items-center justify-end gap-2 md:justify-start">
              <InlineSelect
                value={p.kind}
                options={kindOptions}
                render={(v) => (
                  <span className="text-[0.75rem] text-ut-muted">{PLACE_KIND_LABELS[v]}</span>
                )}
                onCommit={(kind) =>
                  dispatch({
                    type: "EDIT_PLACE",
                    tripId: trip.id,
                    placeId: p.id,
                    name: p.name,
                    kind,
                    area: p.area,
                    note: p.note,
                    status: p.status,
                  })
                }
              />
              <InlineSelect
                value={p.status}
                options={statusOptions}
                render={(v) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                      v === "must"
                        ? "bg-[#e0f3ea] text-[#0b6b47]"
                        : v === "done"
                          ? "bg-[#eef1f0] text-ut-muted line-through"
                          : "bg-[#f6f8f7] text-ut-text-2"
                    }`}
                  >
                    {PLACE_STATUS_LABELS[v]}
                  </span>
                )}
                onCommit={(status) =>
                  dispatch({ type: "SET_PLACE_STATUS", tripId: trip.id, placeId: p.id, status })
                }
              />
            </div>
            {/* Hover actions */}
            <HoverActions>
              <button
                type="button"
                className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent transition-colors hover:text-ut-accent-strong"
                onClick={() => dispatch({ type: "ADD_PLACE_TO_ITINERARY", tripId: trip.id, placeId: p.id })}
              >
                + Itinerary
              </button>
              <HoverDelete
                label={p.name}
                onConfirm={() => dispatch({ type: "REMOVE_PLACE", tripId: trip.id, placeId: p.id })}
              />
            </HoverActions>
          </div>
        ))}

        {/* 永久捕获行：直接写地名，Enter 即成地点（其余属性之后整理） */}
        <CaptureLine
          focusRef={captureRef}
          placeholder="Write something...  e.g. Grand Palace"
          onSubmit={(text) => addPlace(text.trim(), "sight", "", "")}
        />
      </Panel>
    </div>
  );
}

"use client";

/**
 * TabRoute — Itinerary 主画布（Workspace-driven 重构，spec #16-18）。
 *
 *  - 全部 Day 垂直时间线铺开（不是"一次只看一天"）；
 *  - + Add item = 轻量菜单（Place / Activity / Meal / Flight / Custom）；
 *    Place → 已有 Places picker（placeId 引用同一对象，改名自动联动）；
 *    Activity/Meal/Custom → inline [Time][Name] 行；
 *  - 拖动排序 + inline 时间编辑 + hover 删除 + Day 增删；
 *  - Flight 作为 Day 1 顶部条目展示（数据仍是 trip.flight）。
 */

import { useState } from "react";
import type { FlightInfo, RouteStop, Trip, WorkspaceAction } from "./types";
import { dayDate, stopName } from "./logic";
import { parseQuickCapture } from "./expenses/engine";
import { ADD_ROW_BTN, CaptureLine, HoverActions, HoverDelete, InlineText } from "./inline";
import { ModuleHead, Panel } from "./ui";

type AddKind = "place" | "activity" | "meal" | "flight" | "custom";

const STOP_ICON: Record<string, string> = {
  activity: "🎫",
  meal: "🍜",
  custom: "📍",
};

export default function TabRoute({
  trip,
  dispatch,
  addNonce,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const [menuDayId, setMenuDayId] = useState<string | null>(null);
  const [menuKind, setMenuKind] = useState<AddKind | null>(null);
  const [seenNonce, setSeenNonce] = useState(0);
  if (addNonce > seenNonce) {
    setSeenNonce(addNonce);
    if (trip.routeDays[0]) {
      setMenuDayId(trip.routeDays[0].id);
      setMenuKind("place");
    }
  }
  const [dragFrom, setDragFrom] = useState<{ dayId: string; index: number } | null>(null);

  const addStop = (dayId: string, name: string, time: string, kind?: "activity" | "meal" | "custom", placeId?: string) =>
    dispatch({ type: "ADD_STOP", tripId: trip.id, dayId, name, time, kind, placeId });

  return (
    <div>
      <ModuleHead
        title="Itinerary"
        meta={trip.routeDays.length > 0 ? `${trip.routeDays.length} days` : undefined}
        action={
          <button
            type="button"
            className={ADD_ROW_BTN}
            onClick={() => dispatch({ type: "ADD_ROUTE_DAY", tripId: trip.id })}
          >
            + Add day
          </button>
        }
      />

      {trip.routeDays.length === 0 ? (
        <Panel className="py-4">
          <p className="px-5 pt-4 text-center text-body text-ut-text-2">Nothing planned yet.</p>
          {/* 空态也能直接捕获：写第一条自动建 Day 1 */}
          <CaptureLine
            placeholder="Write something...  e.g. 15:00 Grand Palace"
            onSubmit={(text) => {
              const parsed = parseQuickCapture(text);
              const name = parsed.title.trim();
              if (!name && !parsed.time) return;
              const place = trip.places.find((pl) => pl.name.toLowerCase() === name.toLowerCase());
              dispatch({
                type: "ADD_ROUTE_DAY",
                tripId: trip.id,
                firstStop: {
                  name: name || place?.name || "Untitled",
                  time: parsed.time ?? "12:00",
                  kind: place ? undefined : "custom",
                  placeId: place?.id,
                },
              });
            }}
          />
        </Panel>
      ) : (
        <div className="space-y-6">
          {trip.routeDays.map((day, dayIndex) => {
            const iso = dayDate(trip.startDate, dayIndex);
            const dt = iso ? new Date(`${iso}T00:00:00Z`) : null;
            const dateLabel = dt
              ? dt.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                  timeZone: "UTC",
                })
              : day.title;
            const menuOpen = menuDayId === day.id;

            return (
              <section key={day.id}>
                {/* Day 头 */}
                <div className="group mb-1 flex items-baseline gap-3">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ut-muted">
                    {dateLabel}
                  </p>
                  <p className="text-[0.6875rem] font-medium text-[#9aa5a8]">
                    Day {dayIndex + 1} · {day.stops.length} {day.stops.length === 1 ? "stop" : "stops"}
                  </p>
                  <span className="flex-1" />
                  <HoverActions>
                    <HoverDelete
                      label={`Day ${dayIndex + 1}`}
                      onConfirm={() => dispatch({ type: "REMOVE_ROUTE_DAY", tripId: trip.id, dayId: day.id })}
                    />
                  </HoverActions>
                </div>

                <Panel className="px-4 py-2">
                  {/* Flight 条目（仅 Day 1，来自 trip.flight） */}
                  {dayIndex === 0 && trip.flight && (
                    <FlightRow trip={trip} dispatch={dispatch} flight={trip.flight} />
                  )}

                  {day.stops.length === 0 && !menuOpen && dayIndex !== 0 && (
                    <p className="px-1 py-3 text-body-sm text-ut-muted">Nothing planned yet.</p>
                  )}

                  <ol>
                    {day.stops.map((s, i) => (
                      <StopRow
                        key={s.id}
                        trip={trip}
                        stop={s}
                        index={i}
                        dayId={day.id}
                        dispatch={dispatch}
                        dragFrom={dragFrom}
                        setDragFrom={setDragFrom}
                      />
                    ))}
                  </ol>

                  {/* 添加区 */}
                  {menuOpen && menuKind ? (
                    <AddItemRow
                      trip={trip}
                      kind={menuKind}
                      onCancel={() => {
                        setMenuKind(null);
                        setMenuDayId(null);
                      }}
                      onAddPlace={(placeId) => {
                        const p = trip.places.find((pl) => pl.id === placeId);
                        if (p) addStop(day.id, p.name, "12:00", undefined, p.id);
                        setMenuKind(null);
                        setMenuDayId(null);
                      }}
                      onAddInline={(name, time, kind) => {
                        if (!name.trim()) return;
                        addStop(day.id, name.trim(), time || "12:00", kind);
                        setMenuKind(null);
                        setMenuDayId(null);
                      }}
                      onFlight={() => {
                        setMenuKind(null);
                        setMenuDayId(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className={ADD_ROW_BTN}
                      onClick={() => {
                        setMenuDayId(day.id);
                        setMenuKind(null);
                      }}
                    >
                      + Add item
                    </button>
                  )}

                  {/* 轻量菜单（spec #17） */}
                  {menuOpen && !menuKind && (
                    <div className="flex flex-wrap items-center gap-1.5 px-1 py-2">
                      {(
                        [
                          { k: "place", label: "Place" },
                          { k: "activity", label: "Activity" },
                          { k: "meal", label: "Meal" },
                          { k: "flight", label: "Flight" },
                          { k: "custom", label: "Custom" },
                        ] as Array<{ k: AddKind; label: string }>
                      ).map((o) => (
                        <button
                          key={o.k}
                          type="button"
                          className="cursor-pointer rounded-full border border-[#e3e8e7] bg-white px-3 py-1 text-[0.75rem] font-semibold text-ut-text-2 transition-colors hover:border-ut-accent hover:text-ut-ink"
                          onClick={() => setMenuKind(o.k)}
                        >
                          {o.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="ml-1 cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
                        onClick={() => setMenuDayId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* 永久捕获行："15:00 Grand Palace" → 时间 + 条目；命中已存地点自动 placeId 联动 */}
                  <CaptureLine
                    placeholder="Write something...  e.g. 15:00 Grand Palace"
                    onSubmit={(text) => {
                      const parsed = parseQuickCapture(text);
                      const name = parsed.title.trim();
                      if (!name && !parsed.time) return;
                      const place = trip.places.find((pl) => pl.name.toLowerCase() === name.toLowerCase());
                      addStop(
                        day.id,
                        name || place?.name || "Untitled",
                        parsed.time ?? "12:00",
                        place ? undefined : "custom",
                        place?.id,
                      );
                    }}
                  />
                </Panel>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 单条 stop：拖动 + inline 时间/备注编辑 + hover 删除 */
function StopRow({
  trip,
  stop,
  index,
  dayId,
  dispatch,
  dragFrom,
  setDragFrom,
}: {
  trip: Trip;
  stop: RouteStop;
  index: number;
  dayId: string;
  dispatch: (action: WorkspaceAction) => void;
  dragFrom: { dayId: string; index: number } | null;
  setDragFrom: (v: { dayId: string; index: number } | null) => void;
}) {
  const name = stopName(trip, stop);
  return (
    <li
      draggable
      onDragStart={() => setDragFrom({ dayId, index })}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (dragFrom && dragFrom.dayId === dayId && dragFrom.index !== index) {
          dispatch({ type: "MOVE_STOP", tripId: trip.id, dayId, from: dragFrom.index, to: index });
        }
        setDragFrom(null);
      }}
      onDragEnd={() => setDragFrom(null)}
      className={`group flex items-center gap-x-3 border-b border-[#f2f5f4] py-1.5 last:border-b-0 ${
        dragFrom?.dayId === dayId && dragFrom.index === index ? "opacity-40" : ""
      }`}
    >
      <span aria-hidden="true" className="cursor-grab select-none text-[0.6875rem] text-[#c2ccc9]">
        ⠿
      </span>
      <input
        type="time"
        value={stop.time}
        onChange={(e) =>
          dispatch({ type: "SET_STOP_TIME", tripId: trip.id, dayId, stopId: stop.id, time: e.target.value })
        }
        className="h-7 w-[5.6rem] shrink-0 rounded-md border border-transparent bg-[#f6f8f7] px-1.5 text-[0.75rem] font-medium tabular-nums text-ut-text-2 transition-colors hover:border-[#dfe5e4] focus:border-ut-accent/60 focus:outline-none"
        aria-label={`Time for ${name}`}
      />
      <span aria-hidden="true" className="w-5 shrink-0 text-center text-[0.8rem]">
        {stop.placeId ? "📍" : STOP_ICON[stop.kind ?? "custom"] ?? "📍"}
      </span>
      <div className="min-w-0 flex-1">
        <InlineText
          value={stop.placeId ? name : stop.name}
          className="text-[0.875rem] text-ut-text"
          placeholder="Item name"
          onCommit={(next) => {
            if (!next || stop.placeId) return; // placeId 引用的条目名称跟随 Place，不允许就地改名
            dispatch({ type: "PATCH_STOP", tripId: trip.id, dayId, stopId: stop.id, patch: { name: next } } as never);
          }}
        />
      </div>
      <HoverActions>
        <HoverDelete
          label={name}
          onConfirm={() => dispatch({ type: "REMOVE_STOP", tripId: trip.id, dayId, stopId: stop.id })}
        />
      </HoverActions>
    </li>
  );
}

/** Day 1 的航班条目（inline 编辑航班号/时刻，删除走 hover） */
function FlightRow({
  trip,
  dispatch,
  flight,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  flight: FlightInfo;
}) {
  return (
    <div className="group flex items-center gap-x-3 border-b border-[#f2f5f4] py-1.5">
      <span aria-hidden="true" className="w-[5.6rem] shrink-0 px-1.5 text-[0.75rem] font-medium tabular-nums text-ut-text-2">
        {flight.time ?? ""}
      </span>
      <span aria-hidden="true" className="w-5 shrink-0 text-center text-[0.8rem]">✈</span>
      <p className="min-w-0 flex-1 text-[0.875rem] text-ut-text">
        {flight.airline} {flight.flightNumber}
        <span className="ml-2 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ut-muted">
          {flight.departAirport} → {flight.arriveAirport}
        </span>
      </p>
      <HoverActions>
        <HoverDelete
          label={`${flight.airline} ${flight.flightNumber}`}
          onConfirm={() => dispatch({ type: "SET_FLIGHT", tripId: trip.id, flight: undefined })}
        />
      </HoverActions>
    </div>
  );
}

/** Add item 行：Place → picker；其余 → inline [Time][Name] */
function AddItemRow({
  trip,
  kind,
  onAddPlace,
  onAddInline,
  onCancel,
}: {
  trip: Trip;
  kind: AddKind;
  onAddPlace: (placeId: string) => void;
  onAddInline: (name: string, time: string, kind?: "activity" | "meal" | "custom") => void;
  onFlight: () => void;
  onCancel: () => void;
}) {
  const [placeId, setPlaceId] = useState("");
  const [time, setTime] = useState("12:00");
  const [name, setName] = useState("");

  if (kind === "flight") {
    // Flight 选择只是提示：航班在 Trip 层登记（SET_FLIGHT 面板由 Overview/头部管理）
    return (
      <div className="flex flex-wrap items-center gap-3 px-1 py-2">
        <p className="text-[0.8125rem] text-ut-text-2">
          Flights are managed at the trip level — use the header flight editor.
        </p>
        <button
          type="button"
          className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
          onClick={onCancel}
        >
          Close
        </button>
      </div>
    );
  }

  const input =
    "h-8 w-full rounded-md border border-ut-accent/60 bg-white px-2 text-[0.8125rem] text-ut-text placeholder:text-[#9aa5a8] focus:outline-none";

  if (kind === "place") {
    if (trip.places.length === 0) {
      return (
        <div className="flex flex-wrap items-center gap-3 px-1 py-2">
          <p className="text-[0.8125rem] text-ut-text-2">
            No places yet — save a place first, or add a custom item.
          </p>
          <button
            type="button"
            className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
            onClick={onCancel}
          >
            Close
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2 px-1 py-2">
        <select
          autoFocus
          className={`${input} max-w-xs cursor-pointer`}
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          aria-label="Pick a place"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && placeId) onAddPlace(placeId);
          }}
        >
          <option value="">My places…</option>
          {trip.places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!placeId}
          className="cursor-pointer rounded-full bg-ut-accent px-3.5 py-1.5 text-[0.75rem] font-semibold text-white transition-colors hover:bg-ut-accent-strong disabled:opacity-40"
          onClick={() => placeId && onAddPlace(placeId)}
        >
          Add
        </button>
        <button
          type="button"
          className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  }

  // activity / meal / custom → inline 行
  const k = kind as "activity" | "meal" | "custom";
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 py-2">
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="h-8 w-[5.6rem] shrink-0 rounded-md border border-ut-accent/60 bg-white px-1.5 text-[0.8125rem] tabular-nums text-ut-text focus:outline-none"
        aria-label="Time"
      />
      <input
        autoFocus
        className={`${input} min-w-48 flex-1`}
        placeholder={kind === "meal" ? "e.g. Dinner at Sukhumvit…" : "Item name…"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAddInline(name, time, k);
          }
          if (e.key === "Escape") onCancel();
        }}
        aria-label="Item name"
      />
      <button
        type="button"
        className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent hover:text-ut-accent-strong"
        onClick={() => onAddInline(name, time, k)}
      >
        Save
      </button>
      <button
        type="button"
        className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}

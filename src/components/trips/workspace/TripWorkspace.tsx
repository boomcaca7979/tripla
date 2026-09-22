"use client";

/**
 * TripWorkspace — Level 2：Trip 工作区（App Shell 右侧内容）。
 *
 * 第四轮：
 *  - 面包屑 "Trips / Tokyo"（始终知道自己在后台的哪个层级）；
 *  - Trip 可 Edit（目的地/日期）—— CRUD 完整：New / Open / Edit / Delete；
 *  - [ + Add ] 统一操作入口，六项：Place / Hotel / Expense / Route stop /
 *    Checklist item / Traveler；
 *  - 工具导航保持 sticky 分段栏。
 */

import { useState } from "react";
import DestinationField, { toChoice, type DestinationChoice } from "./DestinationField";
import type { ActivityItem, Trip, WorkspaceAction, WorkspaceState } from "./types";
import { formatTripDatesLong, nightsBetween, tripStage } from "./logic";
import TabOverview from "./TabOverview";
import TabPlaces from "./TabPlaces";
import TabRoute from "./TabRoute";
import TabStay from "./TabStay";
import TabExpenses from "./TabExpenses";
import TabPeople from "./TabPeople";
import TabChecklist from "./TabChecklist";
import { BTN_GHOST, BTN_PRIMARY, INPUT, MONO_META, T_META, T_SECTION, T_TRIP } from "./ui";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "itinerary", label: "Itinerary" },
  { key: "places", label: "Places" },
  { key: "stay", label: "Stay" },
  { key: "expenses", label: "Expenses" },
  { key: "people", label: "People" },
  { key: "checklist", label: "Checklist" },
] as const;

const STATUS_LABEL: Record<Trip["status"], string> = {
  current: "Current trip",
  upcoming: "Upcoming",
  past: "Completed",
};

const ADD_ITEMS = [
  { tab: "places", label: "Place" },
  { tab: "stay", label: "Hotel" },
  { tab: "expenses", label: "Expense" },
  { tab: "itinerary", label: "Itinerary stop" },
  { tab: "checklist", label: "Checklist item" },
  { tab: "people", label: "Traveler" },
] as const;

export default function TripWorkspace({
  trip,
  dispatch,
  activity,
  transactions,
  merchantRules,
  onBack,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  activity: ActivityItem[];
  transactions: WorkspaceState["transactions"];
  merchantRules: WorkspaceState["merchantRules"];
  onBack: () => void;
}) {
  const [tab, setTab] = useState<string>("overview");
  const [addNonce, setAddNonce] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const stage = tripStage(
    trip,
    transactions.filter((t) => t.tripId === trip.id && t.status === "confirmed").length,
  );
  const nights = nightsBetween(trip.startDate, trip.endDate);

  const goAdd = (targetTab: string) => {
    setAddOpen(false);
    setTab(targetTab);
    setAddNonce((n) => n + 1);
  };

  return (
    <div>
      {/* ── 面包屑 + Header ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ut-muted transition-colors hover:text-ut-ink"
      >
        ← Trips
      </button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className={`text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ut-muted`}>
            {STATUS_LABEL[trip.status]}
            {trip.country ? ` · ${trip.country}` : ""}
          </p>
          <h1 className={`mt-1.5 flex items-center gap-3 ${T_TRIP}`}>
            {trip.destinationImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trip.destinationImage}
                alt=""
                className="shrink-0 rounded-lg object-cover"
                style={{ width: 52, height: 36 }}
              />
            ) : null}
            {trip.destination}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <p className="text-body text-ut-text-2">{formatTripDatesLong(trip.startDate, trip.endDate)}</p>
            <p className={T_META}>
              {trip.travelers.length} {trip.travelers.length === 1 ? "traveler" : "travelers"} · {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ${
                stage === "Ready"
                  ? "bg-[#e0f3ea] text-[#0b6b47]"
                  : stage === "In progress"
                    ? "bg-[#fdf3e3] text-[#8a5a12]"
                    : "bg-[#f0f2f1] text-ut-muted"
              }`}
            >
              {stage}
            </span>
          </div>
        </div>

        {/* 操作区：Edit + Add */}
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => setEditOpen((v) => !v)}
            aria-expanded={editOpen}
          >
            Edit
          </button>
          <div className="relative">
            <button
              type="button"
              className={addOpen ? BTN_GHOST : BTN_PRIMARY}
              onClick={() => setAddOpen((v) => !v)}
              aria-expanded={addOpen}
            >
              {addOpen ? "Close" : "+ Add"}
            </button>
            {addOpen && (
              <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-ut-md border border-[#e3e8e7] bg-white shadow-ut-2">
                <p className="border-b border-[#eef1f0] px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[#8a969a]">
                  Add to {trip.destination}
                </p>
                {ADD_ITEMS.map((item) => (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => goAdd(item.tab)}
                    className="block w-full cursor-pointer border-b border-[#eef1f0] px-4 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-ut-text transition-colors last:border-b-0 hover:bg-[#eef3f0] hover:text-ut-ink"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit trip（内联表单） */}
      {editOpen && (
        <div className="mt-5">
          <EditTripForm
            trip={trip}
            dispatch={dispatch}
            onDone={() => setEditOpen(false)}
          />
        </div>
      )}

      {/* ── 工具导航（sticky 分段栏） ───────────────────────────── */}
      <nav
        aria-label="Trip tools"
        className="sticky top-16 z-20 -mx-4 mt-7 border-y border-[#e8ecec] bg-[#f4f6f5]/95 px-4 backdrop-blur md:-mx-6 md:px-6"
      >
        <ul className="flex gap-x-1 overflow-x-auto py-2.5">
          {TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={`inline-flex h-10 cursor-pointer items-center rounded-ut-sm px-4 text-[0.6875rem] font-medium uppercase tracking-[0.12em] transition-colors ${
                  tab === t.key
                    ? "bg-[#e0f3ea] text-[#0b6b47]"
                    : "text-ut-text-2 hover:bg-[#eef3f0] hover:text-ut-ink"
                }`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Tab 内容 ────────────────────────────────────────────── */}
      <div className="pt-9">
        {tab === "overview" && (
          <TabOverview
            trip={trip}
            transactions={transactions}
            activity={activity}
            onNavigate={setTab}
            onQuickAdd={goAdd}
          />
        )}
        {tab === "places" && <TabPlaces trip={trip} dispatch={dispatch} addNonce={addNonce} />}
        {tab === "itinerary" && <TabRoute trip={trip} dispatch={dispatch} addNonce={addNonce} />}
        {tab === "stay" && <TabStay trip={trip} dispatch={dispatch} addNonce={addNonce} />}
        {tab === "expenses" && (
          <TabExpenses trip={trip} transactions={transactions} merchantRules={merchantRules} dispatch={dispatch} addNonce={addNonce} />
        )}
        {tab === "people" && (
          <TabPeople trip={trip} transactions={transactions} dispatch={dispatch} addNonce={addNonce} />
        )}
        {tab === "checklist" && <TabChecklist trip={trip} dispatch={dispatch} addNonce={addNonce} />}
      </div>
    </div>
  );
}

// ── Edit Trip（内联，简短） ──────────────────────────────────────────

function EditTripForm({
  trip,
  dispatch,
  onDone,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  onDone: () => void;
}) {
  const [dest, setDest] = useState<DestinationChoice | null>(
    toChoice(trip.destinationId ?? "") ?? null,
  );
  const [tripName, setTripName] = useState(trip.name ?? "");
  const [currency, setCurrency] = useState(trip.currency);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);

  const submit = () => {
    if (!dest || !startDate || !endDate) return;
    dispatch({
      type: "EDIT_TRIP",
      tripId: trip.id,
      destination: dest.name,
      destinationId: dest.id,
      name: tripName.trim() || undefined,
      currency,
      startDate,
      endDate,
    });
    onDone();
  };

  return (
    <div className="rounded-ut-md border border-[#e3e8e7] bg-[#f6f8f7] p-5">
      <p className={`mb-4 ${T_SECTION}`}>Edit trip</p>
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>Trip name (optional)</span>
          <input
            className={INPUT}
            value={tripName}
            placeholder="e.g. Golden Week"
            onChange={(e) => setTripName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>Currency</span>
          <select className={INPUT} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="¥">¥</option>
            <option value="$">$</option>
            <option value="€">€</option>
            <option value="£">£</option>
          </select>
        </label>
        <div className="block">
          <span className={`mb-1.5 block ${T_META}`}>Destination</span>
          <DestinationField value={dest} onChange={setDest} />
        </div>
        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>From</span>
          <input className={INPUT} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>To</span>
          <input className={INPUT} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={submit}
            disabled={!dest}
            style={dest ? undefined : { opacity: 0.5, cursor: "not-allowed" }}
          >
            Save
          </button>
          <button type="button" className={BTN_GHOST} onClick={onDone}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

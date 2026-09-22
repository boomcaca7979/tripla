"use client";

/**
 * TabOverview — Travel Canvas（Workspace-driven 重构，spec #22/#24）。
 *
 * 布局（spec #24，Stippl × Notion）：
 *   ┌──────────────────────────┬───────────────┐
 *   │ Itinerary（主内容，两天） │ Next actions  │
 *   ├──────────────────────────┼───────────────┤
 *   │ Places                   │ Stay          │
 *   ├──────────────────────────┼───────────────┤
 *   │ Expenses                 │ People        │
 *   ├──────────────────────────┴───────────────┤
 *   │ Checklist（全宽）                         │
 *   └──────────────────────────────────────────┘
 * 每个模块 = 真实内容（地点名/时间轴/最近账目/待办），不是统计卡。
 */

import type { ActivityItem, Trip, WorkspaceState } from "./types";
import {
  EXPENSE_CATEGORY_LABELS,
  displayAmount,
  displayCurrency,
  money,
  settlementForTravelers,
  txnsForTrip,
} from "./expenses/engine";
import { dayDate, nextStepsFor, stopName } from "./logic";
import { MONO_META, Panel, T_CARD, T_META, T_SECTION } from "./ui";

export default function TabOverview({
  trip,
  transactions,
  activity,
  onNavigate,
  onQuickAdd,
}: {
  trip: Trip;
  transactions: WorkspaceState["transactions"];
  activity: ActivityItem[];
  onNavigate: (tab: string) => void;
  onQuickAdd: (tab: string) => void;
}) {
  const txns = txnsForTrip(transactions, trip.id);
  const steps = nextStepsFor(trip, txns.length);
  const spentEntry = txns.reduce(
    (acc, t) => {
      const cur = displayCurrency(t);
      const entry = acc.find((x) => x.currency === cur);
      if (entry) entry.amount += displayAmount(t);
      else acc.push({ currency: cur, amount: displayAmount(t) });
      return acc;
    },
    [] as Array<{ currency: string; amount: number }>,
  ).sort((a, b) => b.amount - a.amount)[0];
  const spent = spentEntry?.amount ?? 0;
  const spentCurrency = spentEntry?.currency ?? trip.currency;
  const settlement = settlementForTravelers(trip.travelers, txns);
  const checklistLeft = trip.checklist.filter((c) => !c.done);
  const bookedHotel = trip.hotels.find((h) => h.booked);
  // 旅行记忆（spec #41）：完全由数据计算，无营销文案
  const byCategory = new Map<string, number>();
  for (const t of txns) {
    if (!t.category) continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + displayAmount(t));
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  const transfers = settlement.transfers;

  return (
    <div className="space-y-10">
      <p className={T_META}>
        {[trip.country, `${trip.travelers.length} ${trip.travelers.length === 1 ? "traveler" : "travelers"}`, trip.status === "past" ? "Completed" : undefined]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {/* ── Canvas 双栏 ─────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* 左列 */}
        <div className="space-y-4">
          <CanvasBlock
            title="Itinerary"
            count={trip.routeDays.length > 0 ? `${trip.routeDays.length} days` : undefined}
            onOpen={() => onNavigate("itinerary")}
            onAdd={() => onQuickAdd("itinerary")}
            addLabel="+ Add item"
          >
            {trip.routeDays.length === 0 ? (
              <EmptyLine text="No days planned yet." />
            ) : (
              <div className="space-y-4">
                {trip.routeDays.slice(0, 2).map((day, i) => {
                  const iso = dayDate(trip.startDate, i);
                  const label = iso
                    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        timeZone: "UTC",
                      })
                    : day.title;
                  return (
                    <div key={day.id}>
                      <p className={`mb-1.5 ${MONO_META}`}>{label}</p>
                      {day.stops.length === 0 ? (
                        <p className={T_META}>Nothing scheduled.</p>
                      ) : (
                        <ul className="space-y-1">
                          {day.stops.slice(0, 5).map((s) => (
                            <li key={s.id} className="flex items-baseline gap-3">
                              <span className="w-10 shrink-0 text-[0.75rem] font-medium tabular-nums text-ut-muted">
                                {s.time}
                              </span>
                              <span className="min-w-0 truncate text-[0.875rem] text-ut-text">
                                {stopName(trip, s)}
                              </span>
                            </li>
                          ))}
                          {day.stops.length > 5 && (
                            <li className="pl-[3.4rem] text-[0.75rem] text-[#9aa5a8]">
                              +{day.stops.length - 5} more
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })}
                {trip.routeDays.length > 2 && (
                  <p className={T_META}>+{trip.routeDays.length - 2} more days</p>
                )}
              </div>
            )}
          </CanvasBlock>

          <CanvasBlock
            title="Places"
            count={`${trip.places.length} saved`}
            onOpen={() => onNavigate("places")}
            onAdd={() => onQuickAdd("places")}
            addLabel="+ Add place"
          >
            {trip.places.length === 0 ? (
              <EmptyLine text="No places yet." />
            ) : (
              <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {trip.places.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[0.875rem] text-ut-text">{p.name}</span>
                    <span className={`shrink-0 ${MONO_META}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CanvasBlock>

          <CanvasBlock
            title="Expenses"
            count={`${money(spent, spentCurrency)} spent`}
            onOpen={() => onNavigate("expenses")}
            onAdd={() => onQuickAdd("expenses")}
            addLabel="+ Add expense"
          >
            {txns.length === 0 ? (
              <EmptyLine text={trip.budgetPlanned > 0 ? "No expenses yet." : "No budget set yet."} />
            ) : (
              <div>
                <ul className="space-y-1.5">
                  {[...txns].reverse().slice(0, 3).map((t) => (
                    <li key={t.id} className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-[0.875rem] text-ut-text">{t.merchant}</span>
                      <span className="shrink-0 text-[0.8125rem] font-medium tabular-nums text-ut-text-2">
                        {money(displayAmount(t), displayCurrency(t))}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-2.5 ${T_META}`}>
                  {txns.length} {txns.length === 1 ? "purchase" : "purchases"}
                  {topCategory && (
                    <>
                      {" · "}
                      {
                        EXPENSE_CATEGORY_LABELS[
                          topCategory[0] as keyof typeof EXPENSE_CATEGORY_LABELS
                        ]
                      }{" "}
                      was your biggest category.
                    </>
                  )}
                </p>
              </div>
            )}
          </CanvasBlock>
        </div>

        {/* 右列 */}
        <div className="space-y-4">
          <CanvasBlock title="Next actions" count={undefined} onOpen={() => onNavigate("overview")} onAdd={undefined} addLabel={undefined}>
            {steps.length === 0 ? (
              <p className={T_META}>Everything is in place — all that&rsquo;s left is to go.</p>
            ) : (
              <ul className="space-y-0.5">
                {steps.slice(0, 5).map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate(s.tab)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-ut-sm px-1.5 py-2 text-left transition-colors hover:bg-[#f6f8f7]"
                    >
                      <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border border-ut-accent/70" />
                      <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ut-text">{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CanvasBlock>

          <CanvasBlock
            title="Stay"
            count={bookedHotel ? "Booked" : trip.hotels.length > 0 ? "Comparing" : undefined}
            onOpen={() => onNavigate("stay")}
            onAdd={() => onQuickAdd("stay")}
            addLabel="+ Add hotel"
          >
            {bookedHotel ? (
              <div>
                <p className="text-[0.875rem] font-semibold text-ut-ink">{bookedHotel.name}</p>
                <p className={`mt-0.5 ${MONO_META}`}>
                  Booked{bookedHotel.nights ? ` · ${bookedHotel.nights} nights` : ""}
                </p>
              </div>
            ) : trip.hotels.length > 0 ? (
              <ul className="space-y-1.5">
                {trip.hotels.slice(0, 3).map((h) => (
                  <li key={h.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[0.875rem] text-ut-text">{h.name}</span>
                    <span className={`shrink-0 ${MONO_META}`}>{h.preferred ? "Preferred" : "Considering"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine text="No stay yet." />
            )}
          </CanvasBlock>

          <CanvasBlock
            title="People"
            count={`${trip.travelers.length} going`}
            onOpen={() => onNavigate("people")}
            onAdd={() => onQuickAdd("people")}
            addLabel="+ Add traveler"
          >
            <p className="text-[0.875rem] text-ut-text">
              {trip.travelers.map((t) => t.name).join(" · ") || "Nobody yet."}
            </p>
            {transfers.length > 0 && (
              <p className={`mt-1.5 ${T_META}`}>
                {transfers[0].fromName} owes {transfers[0].toName} {money(transfers[0].amount, trip.currency)}
                {transfers.length > 1 && ` · ${transfers.length} transfers total`}
              </p>
            )}
          </CanvasBlock>
        </div>
      </div>

      {/* ── Checklist 全宽 ──────────────────────────────────────── */}
      <CanvasBlock
        title="Checklist"
        count={trip.checklist.length === 0 ? undefined : `${checklistLeft.length} open`}
        onOpen={() => onNavigate("checklist")}
        onAdd={() => onQuickAdd("checklist")}
        addLabel="+ Add task"
      >
        {trip.checklist.length === 0 ? (
          <EmptyLine text="No tasks yet." />
        ) : checklistLeft.length === 0 ? (
          <p className={T_META}>All done — ready to go.</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {checklistLeft.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-baseline gap-2">
                <span aria-hidden="true" className="text-[0.8rem] text-ut-muted">□</span>
                <span className="min-w-0 truncate text-[0.875rem] text-ut-text">{c.label}</span>
              </li>
            ))}
          </ul>
        )}
      </CanvasBlock>

      {/* ── Recent activity ─────────────────────────────────────── */}
      {activity.length > 0 && (
        <section>
          <p className={`mb-3 ${T_SECTION}`}>Recent activity</p>
          <Panel className="divide-y divide-[#eef1f0]">
            {activity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-baseline gap-4 px-5 py-3.5">
                <span className="min-w-0 flex-1 truncate text-body-sm text-ut-text-2">{a.text}</span>
                <span className="shrink-0 text-[0.6875rem] font-medium tracking-[0.03em] text-[#8a969a]">{a.at}</span>
              </div>
            ))}
          </Panel>
        </section>
      )}
    </div>
  );
}

/** Canvas 模块块：标题行 + 内容 + hover 尾部快捷添加 */
function CanvasBlock({
  title,
  count,
  onOpen,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  count?: string;
  onOpen: () => void;
  addLabel?: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Panel className="group/block p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <button type="button" onClick={onOpen} className="cursor-pointer text-left">
          <p className={T_CARD}>{title}</p>
        </button>
        <div className="flex items-center gap-3">
          {count && <p className={T_META}>{count}</p>}
          {addLabel && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent opacity-0 transition-opacity hover:text-ut-accent-strong group-hover/block:opacity-100"
            >
              {addLabel}
            </button>
          )}
        </div>
      </div>
      {children}
    </Panel>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className={T_META}>{text}</p>;
}

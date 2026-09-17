"use client";

import { useMemo, useState } from "react";
import { useMyTrip } from "./MyTripContext";
import type { TravelPlanInput, TravelInterest, Itinerary } from "@/types/itinerary";

/**
 * MyTripPanel — 清单面板主体（桌面 sticky sidebar 与移动 Bottom Sheet 共用）。
 *
 * 预算诚信（硬规则）：
 *   · 页面加载 / 无任何条目 → "No estimate yet"。绝不做 daily budget × days 自动估算。
 *   · total = 仅由用户显式选择、且带真实价格的条目累加；
 *     无真实价格的条目（当前酒店/景点/美食均无）显示 "Price unavailable"，不计入 total。
 *   · 城市每日预算（dailyBudget）只作为 AI 规划输入参考，绝不渲染成 trip total。
 * AI Plan：真实调用 /api/itinerary（Groq llama-3.3-70b），输入包含
 * My Trip 全部条目（tripItems，含每条的价格状态）；无出发地（in-city 规划）→ origin 不传。
 */

export interface MyTripPanelProps {
  airport: {
    iata: string;
    icao: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
  };
  travelStyle: "relaxed" | "active" | "cultural" | "foodie" | "adventure";
  interests: TravelInterest[];
}

type PlanState =
  | { phase: "idle" }
  | { phase: "generating" }
  | { phase: "done"; plan: Itinerary; fallback: boolean }
  | { phase: "error"; message: string };

export default function MyTripPanel({ airport, travelStyle, interests }: MyTripPanelProps) {
  const { city, items, days, setDays, remove, clear, hydrated, dailyBudget } = useMyTrip();
  const [plan, setPlan] = useState<PlanState>({ phase: "idle" });

  const counts = useMemo(
    () => ({
      attraction: items.filter((i) => i.type === "attraction").length,
      hotel: items.filter((i) => i.type === "hotel").length,
      food: items.filter((i) => i.type === "food").length,
      experience: items.filter((i) => i.type === "experience").length,
      flight: items.filter((i) => i.type === "flight").length,
    }),
    [items],
  );

  // ── 预算：只累计带真实价格的条目（当前数据源均无真实价格 → 合计保持为 0/不显示）
  const priced = useMemo(
    () => items.filter((i) => typeof i.price?.amount === "number" && i.price.amount > 0),
    [items],
  );
  const unpricedCount = items.length - priced.length;
  const knownTotal = priced.reduce((sum, i) => sum + (i.price?.amount ?? 0), 0);
  const totalCurrency = priced[0]?.price?.currency ?? "CNY";

  async function generatePlan() {
    if (items.length === 0) return;
    setPlan({ phase: "generating" });
    try {
      const today = new Date();
      const dep = today.toISOString().slice(0, 10);
      const ret = new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10);
      const input: TravelPlanInput = {
        destination: airport,
        departureDate: dep,
        returnDate: ret,
        travelStyle,
        budgetLevel: dailyBudget.amount <= 80 ? "budget" : dailyBudget.amount <= 200 ? "mid-range" : "luxury",
        interests,
        groupSize: 1,
        tripItems: items.map((i) => ({
          name: i.name,
          kind:
            i.type === "attraction"
              ? "attraction"
              : i.type === "hotel"
                ? "hotel"
                : i.type === "experience"
                  ? "experience"
                  : "food",
          price: i.price ?? null,
        })),
      };
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, weather: [], exchangeRate: null }),
      });
      if (!res.ok) {
        setPlan({ phase: "error", message: `Planner API returned ${res.status}` });
        return;
      }
      const json = (await res.json()) as Itinerary & { generatedBy?: string };
      if (!json?.days?.length) {
        setPlan({ phase: "error", message: "Planner returned an empty itinerary" });
        return;
      }
      setPlan({
        phase: "done",
        plan: json,
        fallback: json.generatedBy === "fallback-template",
      });
    } catch (err) {
      setPlan({ phase: "error", message: err instanceof Error ? err.message : "Failed to generate plan" });
    }
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="border-b border-ut-border px-5 pb-4 pt-5">
        <p className="ut-ref-eyebrow text-[0.625rem]">
          My Trip
        </p>
        <h3 className="mt-1.5 font-display text-[22px] leading-tight text-ut-ink">{city}</h3>
        <p className="mt-2 text-label text-ut-text-2">
          {hydrated ? items.length : 0} {hydrated && items.length === 1 ? "item" : "items"}
          {" · "}
          {counts.attraction} {counts.attraction === 1 ? "place" : "places"} · {counts.hotel}{" "}
          {counts.hotel === 1 ? "hotel" : "hotels"} · {counts.food} food
          {counts.experience > 0 && ` · ${counts.experience} ${counts.experience === 1 ? "experience" : "experiences"}`}
          {counts.flight > 0 && ` · ${counts.flight} ${counts.flight === 1 ? "flight" : "flights"}`}
        </p>
      </div>

      {/* days */}
      <div className="border-b border-ut-border px-5 py-4">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
          Trip length
        </p>
        <div className="mt-2 flex gap-1.5">
          {[1, 2, 3, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              aria-pressed={days === d}
              className={`min-h-[36px] rounded-[4px] px-3 text-label transition-colors ${
                days === d
                  ? "bg-ut-accent font-medium text-white"
                  : "border border-ut-border bg-ut-bg text-ut-text-2 hover:bg-ut-surface-hover"
              }`}
            >
              {d} {d === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
      </div>

      {/* items */}
      <div className="border-b border-ut-border px-5 py-4">
        {items.length === 0 ? (
          <p className="text-label leading-relaxed text-ut-muted">
            {hydrated
              ? "Nothing saved yet — add attractions, hotels and food with the + buttons as you browse."
              : "Loading your saved items…"}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const typeLabel =
                item.type === "attraction"
                  ? "Attraction"
                  : item.type === "hotel"
                    ? "Hotel"
                    : item.type === "experience"
                      ? "Experience"
                      : "Food";
              return (
                <li key={item.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-label leading-snug text-ut-text">
                      <span aria-hidden="true" className="mr-1.5 text-ut-accent">✓</span>
                      {item.name}
                    </span>
                    <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.12em] text-ut-muted">
                      {typeLabel} ·{" "}
                      {item.price
                        ? `${item.price.currency} ${item.price.amount.toLocaleString()}`
                        : "Price unavailable"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.id)}
                    className="shrink-0 rounded-ut-sm px-1.5 text-label text-ut-muted transition-colors hover:text-ut-text"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="mt-3 text-label text-ut-muted underline underline-offset-4 transition-colors hover:text-ut-text"
          >
            Clear all
          </button>
        )}
      </div>

      {/* estimate — 只基于用户已选条目的真实价格（无自动城市估算） */}
      <div className="border-b border-ut-border px-5 py-4">
        {items.length === 0 ? (
          <>
            <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
              Estimated
            </p>
            <p className="mt-1 font-display text-[18px] font-bold text-ut-ink">
              No estimate yet
            </p>
            <p className="mt-1 text-micro leading-relaxed text-ut-muted">
              Add attractions, hotels, food or flights below — the total uses real prices
              from your selections only. Nothing is auto-estimated.
            </p>
          </>
        ) : priced.length === 0 ? (
          <>
            <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
              Estimated
            </p>
            <p className="mt-1 font-display text-[18px] font-bold text-ut-ink">
              No priced items yet
            </p>
            <p className="mt-1 text-micro leading-relaxed text-ut-muted">
              All {items.length} selected {items.length === 1 ? "item has" : "items have"} no
              live price, so nothing enters the total. Nothing is estimated on your behalf.
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-text-2">
              {unpricedCount > 0 ? "Known total" : "Estimated total"}
            </p>
            <p className="mt-1 font-display text-[22px] font-bold text-ut-accent">
              {totalCurrency} {knownTotal.toLocaleString()}
            </p>
            <p className="mt-1 text-micro leading-relaxed text-ut-muted">
              {unpricedCount > 0
                ? `${unpricedCount} selected ${unpricedCount === 1 ? "item has" : "items have"} no live price — check live prices on ${unpricedCount === 1 ? "its" : "their"} listing${unpricedCount === 1 ? "" : "s"}.`
                : "Based on selected items with available prices."}
            </p>
          </>
        )}
      </div>

      {/* AI plan */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={generatePlan}
          disabled={items.length === 0 || plan.phase === "generating"}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[4px] bg-ut-accent px-5 py-3 text-body font-medium text-white transition-opacity hover:bg-ut-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {plan.phase === "generating" ? "Planning your trip…" : "AI Plan My Trip"}
        </button>
        {items.length === 0 && (
          <p className="mt-2 text-micro text-ut-muted">
            Add at least one place to generate a plan.
          </p>
        )}

        {plan.phase === "error" && (
          <p role="alert" className="mt-3 text-label text-ut-verdict-challenging">
            {plan.message} — please try again.
          </p>
        )}

        {plan.phase === "done" && (
          <div className="mt-4 space-y-4">
            {/* 旅行计划结果排版（非聊天 UI）：YOUR PLAN 区头 + DAY 01 绿色编号 */}
            <div className="flex items-baseline justify-between gap-2 border-b border-ut-border pb-2">
              <p className="font-display text-[15px] font-bold uppercase tracking-[0.14em] text-ut-ink">
                Your {city} plan
              </p>
              <p className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                {plan.plan.days.length} {plan.plan.days.length === 1 ? "day" : "days"}
              </p>
            </div>
            {plan.fallback && (
              <p role="alert" className="rounded-[4px] bg-ut-surface p-3 text-micro leading-relaxed text-ut-text-2">
                The AI planner key is not configured on this deployment — what you see below is
                the site&apos;s generic fallback template, not a real AI plan.
              </p>
            )}
            {plan.plan.summary && (
              <p className="text-label leading-relaxed text-ut-text-2">{plan.plan.summary}</p>
            )}
            {/* Confirmed（真实价格）与 AI suggestion 严格分开 */}
            <div className="rounded-[4px] bg-ut-surface p-3">
              <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-text-2">
                Confirmed / selected costs
              </p>
              {priced.length > 0 ? (
                <>
                  <ul className="mt-2 space-y-1">
                    {priced.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3 text-label text-ut-text">
                        <span className="min-w-0 truncate">{i.name}</span>
                        <span className="shrink-0 font-medium">
                          {i.price?.currency} {(i.price?.amount ?? 0).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 border-t border-ut-border pt-2 text-label font-bold text-ut-ink">
                    Known subtotal · {totalCurrency} {knownTotal.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="mt-1.5 text-label text-ut-text-2">
                  None — no selected item has a live price yet.
                </p>
              )}
              {unpricedCount > 0 && (
                <p className="mt-2 text-micro leading-relaxed text-ut-muted">
                  Unavailable (no live price): {unpricedCount} selected{" "}
                  {unpricedCount === 1 ? "item" : "items"}. Any daily-cost figures in the plan
                  below are the AI&apos;s suggestion, not confirmed amounts.
                </p>
              )}
            </div>
            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {plan.plan.days.map((day) => (
                <div key={day.dayNumber}>
                  <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-accent">
                    Day {String(day.dayNumber).padStart(2, "0")}
                    <span className="ml-2 text-ut-muted">{day.date}</span>
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {day.activities.map((a) => (
                      <li key={a.id} className="text-label leading-snug text-ut-text">
                        <span className="mr-1.5 capitalize text-ut-muted">{a.timeOfDay}</span>
                        {a.name}
                      </li>
                    ))}
                  </ul>
                  {day.meals?.dinner && (
                    <p className="mt-1 text-micro text-ut-muted">Dinner: {day.meals.dinner}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-micro leading-relaxed text-ut-muted">
              Generated around your saved places. Cost figures from the planner are AI
              suggestions only — the only confirmed amounts are the priced selections listed
              above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

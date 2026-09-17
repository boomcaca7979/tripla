"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useHomeState } from "./HomeEnvironment";
import {
  BUDGET_NOTE,
  SEASON_SIGNAL_BASIS,
  aggregateBestMonths,
  budgetLabel,
  filterPlaces,
  medianBudgetUsd,
  monthClimateLabel,
  monthName,
  monthOf,
  readoutForSet,
  seasonSignalFor,
  stayRange,
  weatherPhraseFor,
  type HomePlace,
} from "@/lib/home-discovery";

/**
 * BeforeYouGo — "旅行前需要知道"（重构自原 GuidesStage 的文章列表）。
 *
 * 首页不是网站目录：这一块回答"决定去一个地方之前需要知道什么"，六个固定问题：
 *   Best time / Typical budget / Weather / Crowds / Ideal stay / What to know
 *
 * 内容来源（无编造）：
 *   · 已选目的地 → 该城市的真实字段（canonical best-month 窗口、月法线、日预算、
 *     recommendedDays、highlights）。
 *   · 未选目的地 → 当前筛选集合的**真实聚合**（best-month 计数、USD 中位数、
 *     停留天数区间、集群读数），并明确标注是集合口径。
 *
 * Crowds 行如实标注依据：它是气候适宜度派生信号，不是游客量统计。
 */

interface Row {
  label: string;
  value: string;
  note?: string;
}

function RowBlock({ row }: { row: Row }) {
  return (
    <div className="border-t border-ut-border pt-4">
      <h3 className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
        {row.label}
      </h3>
      <p className="mt-2 text-body-sm leading-snug text-ut-text">{row.value}</p>
      {row.note && <p className="mt-1.5 text-label leading-snug text-ut-muted">{row.note}</p>}
    </div>
  );
}

function CityRows({ place, month, monthIsSelected }: {
  place: HomePlace;
  month: number;
  monthIsSelected: boolean;
}) {
  const m = monthOf(place, month);
  const monthLabel = monthIsSelected ? monthName(month) : `${monthName(month)} (current month)`;
  return (
    <>
      <RowBlock
        row={{
          label: "Best time",
          value: place.bestMonthsLabel || "No favourable month in the dataset",
          note: "Canonical best-month window · NASA POWER 1991–2020",
        }}
      />
      <RowBlock
        row={{
          label: "Typical budget",
          value:
            place.budgetCurrency === "USD"
              ? budgetLabel(place)
              : `${budgetLabel(place)} (${place.budgetCurrency} ${Math.round(place.budgetPerDay)}/day)`,
          note: BUDGET_NOTE,
        }}
      />
      <RowBlock
        row={{
          label: `Weather · ${monthLabel}`,
          value: weatherPhraseFor(m) ?? "No climate reading for this month",
          note: monthClimateLabel(m) ?? undefined,
        }}
      />
      <RowBlock
        row={{
          label: "Crowds",
          value: seasonSignalFor(m) ?? "No season signal for this month",
          note: SEASON_SIGNAL_BASIS,
        }}
      />
      <RowBlock
        row={{
          label: "Ideal stay",
          value: `${place.recommendedDays} days`,
          note: "Recommended length for the highlights listed",
        }}
      />
      <RowBlock
        row={{
          label: "What to know",
          value: place.highlights.length > 0
            ? place.highlights.join(" · ")
            : "Highlights not listed for this destination",
          note: place.iata ? `Main gateway: ${place.airportName} (${place.iata})` : undefined,
        }}
      />
    </>
  );
}

function SetRows({ places, month, monthIsSelected }: {
  places: HomePlace[];
  month: number;
  monthIsSelected: boolean;
}) {
  const readout = useMemo(() => readoutForSet(places, month), [places, month]);
  const bestMonths = aggregateBestMonths(places);
  const medianBudget = medianBudgetUsd(places);
  const stays = stayRange(places);
  const scope = `${places.length} destination${places.length === 1 ? "" : "s"} matching your current filters`;
  const monthLabel = monthIsSelected ? monthName(month) : `${monthName(month)} (current month)`;

  return (
    <>
      <RowBlock
        row={{
          label: "Best time",
          value: bestMonths ?? "No best-month window in this selection",
          note: `Most frequent best months across the ${scope}`,
        }}
      />
      <RowBlock
        row={{
          label: "Typical budget",
          value: medianBudget === null
            ? "No budget data in this selection"
            : `≈ $${Math.round(medianBudget)}/day median`,
          note: `${BUDGET_NOTE} · median across the ${scope}`,
        }}
      />
      <RowBlock
        row={{
          label: `Weather · ${monthLabel}`,
          value: readout.weather ?? "Pick a month to read the climate window",
          note: "Most common climate character in this selection",
        }}
      />
      <RowBlock
        row={{
          label: "Crowds",
          value: readout.season ?? "Pick a month to read the season signal",
          note: SEASON_SIGNAL_BASIS,
        }}
      />
      <RowBlock
        row={{
          label: "Ideal stay",
          value: stays ?? "No stay length in this selection",
          note: `Recommended length across the ${scope}`,
        }}
      />
      <RowBlock
        row={{
          label: "What to know",
          value: "Preview a destination above — its highlights and gateway land here.",
          note: "Select any place in the atlas to switch this block to that city.",
        }}
      />
    </>
  );
}

export default function BeforeYouGo() {
  const { places, destination, month, currentMonth, mood, budget } = useHomeState();

  const filters = useMemo(() => ({ mood, month, budget }), [mood, month, budget]);
  const matched = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const selected = useMemo(
    () => (destination ? places.find((p) => p.slug === destination.id) ?? null : null),
    [destination, places],
  );

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
          {selected
            ? `Following your selection · ${selected.city}, ${selected.country}`
            : "Reading your current filters · nothing selected yet"}
        </p>
        {selected && (
          <Link
            href={`/destinations/${selected.slug}`}
            className="text-body-sm font-medium text-ut-accent underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Full {selected.city} guide →
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {selected ? (
          <CityRows place={selected} month={month ?? currentMonth} monthIsSelected={month !== null} />
        ) : (
          <SetRows places={matched} month={month ?? currentMonth} monthIsSelected={month !== null} />
        )}
      </div>
    </div>
  );
}

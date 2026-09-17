"use client";

import Link from "next/link";
import {
  BUDGET_NOTE,
  SEASON_SIGNAL_BASIS,
  budgetLabel,
  monthClimateLabel,
  monthName,
  monthOf,
  seasonSignalFor,
  vibesForPlace,
  weatherPhraseFor,
  type HomePlace,
} from "@/lib/home-discovery";

/**
 * DestinationPreview — 点击发现层对象后的快速判断面板（对应需求：目的地 Preview）。
 *
 * 只读真实字段：City / Country / Region、Best time（canonical best-month 窗口）、
 * Weather（canonical 月法线）、Typical budget（当地货币 + 参考汇率折算）、
 * Travel style / mood（真实 interests → mood 映射）、Ideal stay（recommendedDays）、
 * 主机场信息（机场代码只作为信息出现，从不作为输入要求）。
 *
 * 未选择任何目的地时展示中性提示——首页初始状态不绑定任何默认城市。
 */

function Readout({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-t border-ut-border pt-3">
      <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">{label}</p>
      <p className="mt-1.5 text-body-sm leading-snug text-ut-text">{value}</p>
      {note && <p className="mt-1 text-label leading-snug text-ut-muted">{note}</p>}
    </div>
  );
}

export default function DestinationPreview({
  place,
  month,
  monthIsSelected,
  onClear,
}: {
  place: HomePlace | null;
  /** 用于气候读数的月份（未筛选时为当前月）。 */
  month: number;
  /** 该月份是用户主动筛选的，还是当前月上下文。 */
  monthIsSelected: boolean;
  onClear: () => void;
}) {
  if (!place) {
    return (
      <div className="mt-8 rounded-ut-lg border border-dashed border-ut-border-strong bg-ut-surface px-5 py-6">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
          Destination preview
        </p>
        <p className="mt-2 max-w-[62ch] text-body-sm leading-snug text-ut-text-2">
          Nothing is selected yet — hit <span className="text-ut-ink">Preview</span> on any
          place below to see its country, best months, climate, typical daily budget and
          travel style before you commit to reading more.
        </p>
      </div>
    );
  }

  const m = monthOf(place, month);
  const climate = monthClimateLabel(m);
  const weather = weatherPhraseFor(m);
  const signal = seasonSignalFor(m);
  const vibes = vibesForPlace(place);
  const monthLabel = monthIsSelected ? monthName(month) : `${monthName(month)} (current month)`;

  return (
    <div className="mt-8 rounded-ut-lg border border-ut-border-strong bg-ut-surface-elevated px-5 py-6 backdrop-blur-xl sm:px-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
            Destination preview
          </p>
          <h3 className="mt-2 font-display text-h1 text-ut-ink">
            {place.city}
          </h3>
          <p className="mt-1.5 text-body-sm text-ut-text-2">
            {place.country} · {place.region} · {place.iata ? `${place.airportName} (${place.iata})` : place.airportName}
          </p>
          <p className="mt-3 max-w-[52ch] text-body-lg leading-snug text-ut-text">
            {place.phrase}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/destinations/${place.slug}`}
            className="inline-flex min-h-[44px] items-center rounded-ut-sm bg-ut-accent px-5 py-2.5 text-body-sm font-medium text-ut-on-accent transition-[background-color,transform] duration-[var(--ut-dur-fast)] ease-ut-out hover:-translate-y-px hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Explore destination →
          </Link>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-[44px] items-center rounded-ut-sm border border-ut-border-strong px-5 py-2.5 text-body-sm font-medium text-ut-text transition-[border-color,color] duration-[var(--ut-dur-fast)] ease-ut-out hover:border-ut-accent-line hover:text-ut-accent focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Readout
          label="Best time"
          value={place.bestMonthsLabel || "No favourable month in the dataset"}
          note="Canonical best-month window (NASA POWER 1991–2020)"
        />
        <Readout
          label={`Weather · ${monthLabel}`}
          value={[weather, signal].filter(Boolean).join(" · ") || "No climate reading for this month"}
          note={climate ?? undefined}
        />
        <Readout
          label="Typical budget"
          value={
            place.budgetCurrency === "USD"
              ? budgetLabel(place)
              : `${budgetLabel(place)} · ${place.budgetCurrency} ${Math.round(place.budgetPerDay)}/day`
          }
          note={BUDGET_NOTE}
        />
        <Readout
          label="Travel style"
          value={place.travelStyle.charAt(0).toUpperCase() + place.travelStyle.slice(1)}
          note={vibes.length > 0 ? `Also reads as: ${vibes.join(" · ")}` : undefined}
        />
        <Readout
          label="Ideal stay"
          value={`${place.recommendedDays} days`}
          note="Recommended length for the highlights listed"
        />
        <Readout
          label="What to know"
          value={
            place.highlights.length > 0
              ? place.highlights.slice(0, 3).join(" · ")
              : "Highlights not listed for this destination"
          }
          note={SEASON_SIGNAL_BASIS}
        />
      </div>
    </div>
  );
}

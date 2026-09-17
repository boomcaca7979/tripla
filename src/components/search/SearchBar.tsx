"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AirportAutocomplete, { type CityIndexEntry } from "./AirportAutocomplete";
import DateRangePicker from "./DateRangePicker";
import { useTravelStore } from "@/store/travel";
import { useTranslation } from "@/lib/i18n";
import { DESTINATIONS } from "@/data/destinations";
import type { Airport } from "@/types/flight";
import type {
  TravelPlanInput,
  TravelStyle,
  BudgetLevel,
  TravelInterest,
} from "@/types/itinerary";

// ── Constants ─────────────────────────────────────────────────────────

const TRAVEL_STYLES: { value: TravelStyle; labelKey: string }[] = [
  { value: "relaxed", labelKey: "search.relaxed" },
  { value: "active", labelKey: "search.active" },
  { value: "cultural", labelKey: "search.cultural" },
  { value: "foodie", labelKey: "search.foodie" },
  { value: "adventure", labelKey: "search.adventure" },
];

const BUDGET_LEVELS: { value: BudgetLevel; labelKey: string }[] = [
  { value: "budget", labelKey: "search.budgetLevel" },
  { value: "mid-range", labelKey: "search.midRange" },
  { value: "luxury", labelKey: "search.luxury" },
];

const ALL_INTERESTS: { value: TravelInterest; labelKey: string }[] = [
  { value: "museums", labelKey: "search.museums" },
  { value: "nature", labelKey: "search.nature" },
  { value: "food", labelKey: "search.food" },
  { value: "shopping", labelKey: "search.shopping" },
  { value: "nightlife", labelKey: "search.nightlife" },
  { value: "history", labelKey: "search.history" },
  { value: "sports", labelKey: "search.sports" },
  { value: "beaches", labelKey: "search.beaches" },
];

const LABEL_CLASS =
  "mb-1.5 block text-[11px] font-mono uppercase tracking-[0.14em] text-ut-muted";

const INPUT_CLASS =
  "w-full rounded-ut-md border border-ut-border bg-ut-surface px-3 py-2.5 text-body-sm text-ut-text placeholder:text-ut-subtle transition-colors hover:border-ut-border-strong focus:border-ut-accent-line focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ut-accent-rgb),0.25)]";

// ── Props ─────────────────────────────────────────────────────────────

/** 首页专用文案覆盖；不传时沿用 i18n 既有文案（内页行为不变）。 */
export interface SearchBarCopy {
  fromPlaceholder?: string;
  toPlaceholder?: string;
  /** Budget 档位标签覆盖（首页要求带 $/day 区间）。 */
  budgetLabels?: Partial<Record<BudgetLevel, string>>;
  /** Budget 口径说明（如 "Typical daily spend, excluding long-haul airfare."）。 */
  budgetNote?: string;
  errorOriginDest?: string;
  errorDates?: string;
}

interface SearchBarProps {
  /** Optional external callback — when provided, replaces router.push. */
  onSearch?: (input: TravelPlanInput) => void;
  /** 本地城市索引（城市名搜索；机场代码只出现在候选项里）。 */
  cityIndex?: CityIndexEntry[];
  copy?: SearchBarCopy;
}

// ── Component ─────────────────────────────────────────────────────────

export default function SearchBar({ onSearch, cityIndex = [], copy }: SearchBarProps) {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const searchParams = useTravelStore((s) => s.searchParams);
  const { t } = useTranslation();

  // copy 的字段先落成局部常量：既让 useCallback 依赖稳定（字符串/对象引用明确），
  // 也让下面渲染处的可读性更好。
  const errOriginDest = copy?.errorOriginDest;
  const errDates = copy?.errorDates;
  const budgetLabels = copy?.budgetLabels;
  const budgetNote = copy?.budgetNote;
  const fromPlaceholder = copy?.fromPlaceholder;
  const toPlaceholder = copy?.toPlaceholder;

  // ── State ────────────────────────────────────────────────────────────
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("relaxed");
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("mid-range");
  const [interests, setInterests] = useState<TravelInterest[]>([]);
  const [groupSize, setGroupSize] = useState(1);
  // error 存"错误码"而非文本：文案在渲染处按当前语言/首页覆盖解析，
  // 使 handleSubmit 不依赖任何外部文案变量。
  const [error, setError] = useState<"originDest" | "dates" | null>(null);

  // ── Sync from store (template auto-fill) ────────────────────────────
  useEffect(() => {
    if (!searchParams) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 模板/行程卡片通过 store 注入搜索参数（外部 store → 本地 state 同步）
    if (searchParams.destination) setDestination(searchParams.destination);
    if (searchParams.travelStyle) setTravelStyle(searchParams.travelStyle);
    if (searchParams.budgetLevel) setBudgetLevel(searchParams.budgetLevel);
    if (searchParams.interests && searchParams.interests.length > 0)
      setInterests(searchParams.interests);
  }, [searchParams]);

  // ── Deep-link prefill from URL query params ─────────────────────────
  // 支持 /?to=City&travelStyle=cultural&interests=food,history
  //        &departureDate=YYYY-MM-DD&returnDate=YYYY-MM-DD#hero-search
  // 用 window.location 而非 useSearchParams，避免静态渲染需要 Suspense 边界。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    const style = params.get("travelStyle");
    const interestsParam = params.get("interests");
    const dep = params.get("departureDate");
    const ret = params.get("returnDate");
    if (!to && !style && !interestsParam && !dep && !ret) return;

    if (to) {
      const dest = DESTINATIONS.find(
        (d) => d.city.toLowerCase() === to.toLowerCase(),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 从 URL 深链接预填规划器（外部系统 → state，SSR 安全）
      if (dest) setDestination(dest.airport);
    }
    if (style && TRAVEL_STYLES.some((s) => s.value === style)) {
      setTravelStyle(style as TravelStyle);
    }
    if (interestsParam) {
      const list = interestsParam
        .split(",")
        .map((i) => i.trim())
        .filter((i): i is TravelInterest =>
          ALL_INTERESTS.some((a) => a.value === i),
        );
      if (list.length > 0) setInterests(list);
    }
    if (dep) setDepartureDate(dep);
    if (ret) setReturnDate(ret);
    // 仅在首次挂载时读取一次 URL。
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────

  const swapAirports = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
  }, [origin, destination]);

  const toggleInterest = useCallback((interest: TravelInterest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  const handleDateChange = useCallback((start: string, end: string) => {
    setDepartureDate(start);
    setReturnDate(end);
  }, []);

  const handleSubmit = useCallback(() => {
    // ── Validate ─────────────────────────────────────────────────────
    if (!origin || !destination) {
      setError("originDest");
      return;
    }
    if (!departureDate || !returnDate) {
      setError("dates");
      return;
    }

    setError(null);

    const input: TravelPlanInput = {
      origin,
      destination,
      departureDate,
      returnDate,
      travelStyle,
      budgetLevel,
      interests,
      groupSize,
    };

    setSearchParams(input);

    if (onSearch) {
      onSearch(input);
      return;
    }

    // ── Navigate to plan page ────────────────────────────────────────
    const params = new URLSearchParams({
      origin: JSON.stringify(origin),
      destination: JSON.stringify(destination),
      departureDate,
      returnDate,
      travelStyle,
      budgetLevel,
      interests: interests.join(","),
      groupSize: String(groupSize),
    });

    router.push(`/plan?${params.toString()}`);
  }, [
    origin,
    destination,
    departureDate,
    returnDate,
    travelStyle,
    budgetLevel,
    interests,
    groupSize,
    setSearchParams,
    onSearch,
    router,
  ]);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="rounded-ut-lg border border-ut-border bg-ut-surface-elevated p-6 shadow-ut-2 backdrop-blur-xl sm:p-8">
      {/* ── Row 1: From + To ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <AirportAutocomplete
            label={t("search.from")}
            placeholder={fromPlaceholder ?? t("search.fromPlaceholder")}
            value={origin}
            onChange={setOrigin}
            cityIndex={cityIndex}
            labelClassName={LABEL_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>

        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={swapAirports}
          className="self-center rounded-full border border-ut-border bg-ut-surface p-2.5 text-ut-muted transition-colors hover:border-ut-border-strong hover:text-ut-text focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ut-accent-rgb),0.3)] sm:mb-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 2l4 4-4 4" />
            <path d="M3 12h11" />
            <path d="M7 18l-4-4 4-4" />
            <path d="M21 12H10" />
          </svg>
        </button>

        <div className="flex-1">
          <AirportAutocomplete
            label={t("search.to")}
            placeholder={toPlaceholder ?? t("search.toPlaceholder")}
            value={destination}
            onChange={setDestination}
            cityIndex={cityIndex}
            labelClassName={LABEL_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>
      </div>

      {/* ── Row 2: Start + End + Travelers ────────────────────────── */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <DateRangePicker
            startDate={departureDate}
            endDate={returnDate}
            onChange={handleDateChange}
            labelClassName={LABEL_CLASS}
            inputClassName={INPUT_CLASS}
            arrowClassName="text-ut-subtle"
          />
        </div>

        <div className="w-full sm:w-28">
          <label
            htmlFor="search-group-size"
            className={LABEL_CLASS}
          >
            {t("search.travelers")}
          </label>
          <input
            id="search-group-size"
            type="number"
            min={1}
            max={20}
            value={groupSize}
            onChange={(e) =>
              setGroupSize(
                Math.max(1, Math.min(20, Number(e.target.value) || 1)),
              )
            }
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* ── Row 3: Travel Style + Budget ──────────────────────────── */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="search-travel-style"
            className={LABEL_CLASS}
          >
            {t("search.travelStyle")}
          </label>
          <select
            id="search-travel-style"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
            className={INPUT_CLASS}
          >
            {TRAVEL_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="search-budget-level"
            className={LABEL_CLASS}
          >
            {t("search.budget")}
          </label>
          <select
            id="search-budget-level"
            value={budgetLevel}
            onChange={(e) => setBudgetLevel(e.target.value as BudgetLevel)}
            className={INPUT_CLASS}
          >
            {BUDGET_LEVELS.map((b) => (
              <option key={b.value} value={b.value}>
                {budgetLabels?.[b.value] ?? t(b.labelKey)}
              </option>
            ))}
          </select>
          {budgetNote && (
            <p className="mt-1.5 text-label leading-snug text-ut-subtle">
              {budgetNote}
            </p>
          )}
        </div>
      </div>

      {/* ── Row 4: Interests as pills ─────────────────────────────── */}
      <div className="mt-5">
        <label className={LABEL_CLASS}>{t("search.interests")}</label>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map((interest) => {
            const checked = interests.includes(interest.value);
            return (
              <button
                key={interest.value}
                type="button"
                onClick={() => toggleInterest(interest.value)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all",
                  checked
                    ? "border-ut-accent-line bg-ut-accent-soft text-ut-accent"
                    : "border-ut-border bg-ut-surface text-ut-text-2 hover:border-ut-border-strong hover:text-ut-text",
                ].join(" ")}
              >
                {checked && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {t(interest.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error message ───────────────────────────────────────────── */}
      {error && (
        <p className="mt-3 text-sm text-red-500" role="alert">
          {error === "dates"
            ? errDates ?? t("search.errorDates")
            : errOriginDest ?? t("search.errorOriginDest")}
        </p>
      )}

      {/* ── Submit button ───────────────────────────────────────────── */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-ut-sm bg-ut-accent px-10 py-3.5 text-base font-semibold text-ut-inverse shadow-ut-1 transition-all hover:bg-ut-accent-strong hover:shadow-ut-2 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ut-accent-rgb),0.55)] focus:ring-offset-2 focus:ring-offset-transparent"
        >
          {t("search.planMyTrip")}
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

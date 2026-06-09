"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AirportAutocomplete from "./AirportAutocomplete";
import DateRangePicker from "./DateRangePicker";
import { useTravelStore } from "@/store/travel";
import { useTranslation } from "@/lib/i18n";
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
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

// ── Props ─────────────────────────────────────────────────────────────

interface SearchBarProps {
  /** Optional external callback — when provided, replaces router.push. */
  onSearch?: (input: TravelPlanInput) => void;
}

// ── Component ─────────────────────────────────────────────────────────

export default function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter();
  const setSearchParams = useTravelStore((s) => s.setSearchParams);
  const searchParams = useTravelStore((s) => s.searchParams);
  const { t } = useTranslation();

  // ── State ────────────────────────────────────────────────────────────
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("relaxed");
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("mid-range");
  const [interests, setInterests] = useState<TravelInterest[]>([]);
  const [groupSize, setGroupSize] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // ── Sync from store (template auto-fill) ────────────────────────────
  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.destination) setDestination(searchParams.destination);
    if (searchParams.travelStyle) setTravelStyle(searchParams.travelStyle);
    if (searchParams.budgetLevel) setBudgetLevel(searchParams.budgetLevel);
    if (searchParams.interests && searchParams.interests.length > 0)
      setInterests(searchParams.interests);
  }, [searchParams]);

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
      setError(t("search.errorOriginDest"));
      return;
    }
    if (!departureDate || !returnDate) {
      setError(t("search.errorDates"));
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
    <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-8">
      {/* ── Row 1: From + To ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <AirportAutocomplete
            label={t("search.from")}
            placeholder={t("search.fromPlaceholder")}
            value={origin}
            onChange={setOrigin}
            labelClassName={LABEL_CLASS}
            inputClassName={INPUT_CLASS}
          />
        </div>

        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={swapAirports}
          className="self-center rounded-full border border-gray-200 bg-gray-50 p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:mb-0.5"
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
            placeholder={t("search.toPlaceholder")}
            value={destination}
            onChange={setDestination}
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
            arrowClassName="text-gray-400"
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
                {t(b.labelKey)}
              </option>
            ))}
          </select>
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
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
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
          {error}
        </p>
      )}

      {/* ── Submit button ───────────────────────────────────────────── */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

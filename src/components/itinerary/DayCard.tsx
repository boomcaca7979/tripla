"use client";

import { useMemo } from "react";
import type { ItineraryDay, Activity } from "@/types/itinerary";
import { buildHotelSearchUrl } from "@/lib/affiliate";

// ── WMO helper ───────────────────────────────────────────────────────

interface WeatherInfo {
  emoji: string;
  label: string;
}

function getWeatherInfo(code: number): WeatherInfo | null {
  if (code === 0) return { emoji: "☀️", label: "Clear" };
  if (code <= 2) return { emoji: "⛅", label: "Partly Cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "Rain" };
  if (code >= 71 && code <= 77) return { emoji: "❄️", label: "Snow" };
  if (code >= 80 && code <= 82) return { emoji: "🌦️", label: "Rain Showers" };
  if (code >= 85 && code <= 86) return { emoji: "❄️", label: "Snow Showers" };
  if (code >= 95 && code <= 99) return { emoji: "⛈️", label: "Thunderstorm" };
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return m && d ? `${MONTHS[m - 1] ?? ""} ${d}` : dateStr;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── Sub-component: Activity card ─────────────────────────────────────

function ActivityItem({
  activity,
  currency,
}: {
  activity: Activity;
  currency: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="font-medium text-gray-900">{activity.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
            {formatDuration(activity.duration)}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {activity.estimatedCost} {currency}
          </span>
        </div>
      </div>
      <p className="text-gray-600">{activity.description}</p>
      {activity.tip && (
        <p className="mt-1 text-xs italic text-gray-500">💡 {activity.tip}</p>
      )}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────

interface DayCardProps {
  day: ItineraryDay;
  currency: string;
  exchangeRate: number | null;
  expanded?: boolean;
  onToggle?: () => void;
  /** Destination city name for hotel affiliate link. */
  destinationCity?: string;
  /** Check-out date (YYYY-MM-DD) for hotel affiliate link. */
  nextDate?: string;
}

// ── Component ────────────────────────────────────────────────────────

export default function DayCard({
  day,
  currency,
  exchangeRate,
  expanded = false,
  onToggle,
  destinationCity,
  nextDate,
}: DayCardProps) {
  const weather = day.weather
    ? getWeatherInfo(day.weather.weatherCode)
    : null;

  // Group activities by time-of-day
  const groups = useMemo(() => {
    const morning = day.activities.filter((a) => a.timeOfDay === "morning");
    const afternoon = day.activities.filter((a) => a.timeOfDay === "afternoon");
    const evening = day.activities.filter(
      (a) => a.timeOfDay === "evening" || a.timeOfDay === "night",
    );
    return { morning, afternoon, evening };
  }, [day.activities]);

  const hasMeals =
    day.meals.breakfast || day.meals.lunch || day.meals.dinner;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm">
      {/* ── Header (always visible) ──────────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            Day {day.dayNumber}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(day.date)}
          </span>
          {weather && (
            <span className="text-base" title={weather.label}>
              {weather.emoji}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">
            {day.estimatedDailyCost} {currency}
          </span>
          {destinationCity && (
            <a
              href={buildHotelSearchUrl({
                city: destinationCity,
                checkIn: day.date,
                checkOut: nextDate ?? day.date,
              })}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Book Hotel
            </a>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* ── Collapsible body ───────────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[2000px]" : "max-h-0"
        }`}
      >
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <div className="space-y-4">
            {/* Morning */}
            {groups.morning.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                  ☀ Morning
                </h4>
                <div className="space-y-2">
                  {groups.morning.map((a) => (
                    <ActivityItem
                      key={a.id}
                      activity={a}
                      currency={currency}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Afternoon */}
            {groups.afternoon.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-700">
                  🌤 Afternoon
                </h4>
                <div className="space-y-2">
                  {groups.afternoon.map((a) => (
                    <ActivityItem
                      key={a.id}
                      activity={a}
                      currency={currency}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Evening / Night */}
            {groups.evening.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  🌙 Evening
                </h4>
                <div className="space-y-2">
                  {groups.evening.map((a) => (
                    <ActivityItem
                      key={a.id}
                      activity={a}
                      currency={currency}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Meals */}
            {hasMeals && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  🍽 Meals
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="text-xs text-gray-500">Breakfast</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-800">
                      {day.meals.breakfast || "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="text-xs text-gray-500">Lunch</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-800">
                      {day.meals.lunch || "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="text-xs text-gray-500">Dinner</div>
                    <div className="mt-0.5 text-xs font-medium text-gray-800">
                      {day.meals.dinner || "—"}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

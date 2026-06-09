"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import type { WeatherForecastResponse, WeatherScore } from "@/types/weather";
import type { AppError } from "@/types/common";
import { useTravelStore } from "@/store/travel";
import { celsiusToFahrenheit } from "@/lib/utils";
import WeatherScoreComponent from "./WeatherScore";
import WeatherDayCard from "./WeatherDayCard";
import Skeleton from "@/components/ui/Skeleton";

// ── Props ────────────────────────────────────────────────────────────

interface WeatherPanelProps {
  forecast: WeatherForecastResponse | null;
  scores: WeatherScore[];
  overallScore: WeatherScore | null;
  loading: boolean;
  error: AppError | null;
  onRetry?: () => void;
}

// ── Component ────────────────────────────────────────────────────────

export default function WeatherPanel({
  forecast,
  scores,
  overallScore,
  loading,
  error,
  onRetry,
}: WeatherPanelProps) {
  // Hooks must be called before any conditional returns
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const temperatureUnit = useTravelStore((s) => s.temperatureUnit);

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="text" width={120} height={18} />
        <div className="flex justify-center">
          <Skeleton variant="circle" width={96} height={96} />
        </div>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rect" height={80} />
        ))}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Weather data is temporarily unavailable.
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // ── No data ──────────────────────────────────────────────────────
  if (!forecast || scores.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
        Weather forecast will appear here.
      </div>
    );
  }

  // ── Build chart data ──────────────────────────────────────────────
  const chartData = forecast?.daily.map((day) => {
    const [, mm, dd] = day.date.split("-").map(Number);
    return {
      date: `${String(mm).padStart(2, "0")}/${String(dd).padStart(2, "0")}`,
      high: temperatureUnit === "F" ? Math.round(celsiusToFahrenheit(day.temperatureMax)) : Math.round(day.temperatureMax),
      low: temperatureUnit === "F" ? Math.round(celsiusToFahrenheit(day.temperatureMin)) : Math.round(day.temperatureMin),
    };
  });
  const tempUnitLabel = temperatureUnit === "F" ? "°F" : "°C";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">
        Weather — {forecast.location}
      </h3>

      {/* Overall score */}
      {overallScore && (
        <div className="flex justify-center">
          <WeatherScoreComponent score={overallScore} size="lg" />
        </div>
      )}

      {/* Daily cards — horizontal scroll */}
      <div className="flex overflow-x-auto gap-4 pb-2">
        {forecast.daily.map((day, i) => {
          const dayScore = scores[i];
          if (!dayScore) return null;

          return (
            <div key={day.date} className="min-w-[160px] flex-shrink-0">
              <WeatherDayCard
                day={day}
                score={dayScore}
                isSelected={selectedDay === i}
                onClick={() =>
                  setSelectedDay((prev) => (prev === i ? null : i))
                }
              />
            </div>
          );
        })}
      </div>

      {/* Temperature trend chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <h4 className="mb-2 text-xs font-semibold text-gray-600">Temperature Trend</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" unit={tempUnitLabel} />
              <Tooltip
                formatter={(value, name) => [`${value}${tempUnitLabel}`, name === "high" ? "High" : "Low"]}
              />
              <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="high" />
              <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="low" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

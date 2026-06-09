"use client";

import type { WeatherDay, WeatherScore as WeatherScoreType } from "@/types/weather";
import { useTravelStore } from "@/store/travel";
import { formatTemperature } from "@/lib/utils";
import WeatherScoreComponent from "./WeatherScore";

// ── WMO code → emoji + label mapping ────────────────────────────────

interface WeatherInfo {
  emoji: string;
  label: string;
}

function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0) return { emoji: "☀️", label: "Clear" };
  if (code <= 2) return { emoji: "⛅", label: "Partly Cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "Rain" };
  if (code >= 71 && code <= 77) return { emoji: "❄️", label: "Snow" };
  if (code >= 80 && code <= 82) return { emoji: "🌦️", label: "Rain Showers" };
  if (code >= 85 && code <= 86) return { emoji: "❄️", label: "Snow Showers" };
  if (code === 95) return { emoji: "⛈️", label: "Thunderstorm" };
  if (code >= 96) return { emoji: "🌩️", label: "T-Storm / Hail" };
  return { emoji: "❓", label: "Unknown" };
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Props ────────────────────────────────────────────────────────────

interface WeatherDayCardProps {
  day: WeatherDay;
  score: WeatherScoreType;
  isSelected?: boolean;
  onClick?: () => void;
}

// ── Component ────────────────────────────────────────────────────────

export default function WeatherDayCard({
  day,
  score,
  isSelected = false,
  onClick,
}: WeatherDayCardProps) {
  const temperatureUnit = useTravelStore((s) => s.temperatureUnit);
  const weather = getWeatherInfo(day.weatherCode);
  const [, mm, dd] = day.date.split("-").map(Number);
  const monthLabel = MONTHS[(mm ?? 1) - 1];
  const dayLabel = String(dd ?? 1);

  // Precipitation bar: scale 0-20mm to 0-100%.
  const precipPercent = Math.min((day.precipitationSum / 20) * 100, 100);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        "cursor-pointer rounded-xl border p-3 transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
      ].join(" ")}
    >
      {/* ── Date + weather icon row ────────────────────────────────── */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">{monthLabel} {dayLabel}</div>
        </div>
        <span className="text-xl" aria-label={weather.label} title={weather.label}>
          {weather.emoji}
        </span>
      </div>

      {/* ── Weather label ──────────────────────────────────────────── */}
      <div className="mb-2 text-xs font-medium text-gray-500">{weather.label}</div>

      {/* ── Temperatures ───────────────────────────────────────────── */}
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">
          {formatTemperature(day.temperatureMax, temperatureUnit)}
        </span>
        <span className="text-gray-400">
          {formatTemperature(day.temperatureMin, temperatureUnit)}
        </span>
      </div>

      {/* ── Precipitation bar ──────────────────────────────────────── */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Precip</span>
          <span>{day.precipitationSum.toFixed(1)}mm</span>
        </div>
        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-400 transition-all"
            style={{ width: `${precipPercent}%` }}
          />
        </div>
      </div>

      {/* ── Wind speed ─────────────────────────────────────────────── */}
      <div className="text-xs text-gray-500">
        💨 {day.windSpeedMax} km/h
      </div>

      {/* ── Score badge ────────────────────────────────────────────── */}
      <WeatherScoreComponent score={score} size="sm" />
    </div>
  );
}

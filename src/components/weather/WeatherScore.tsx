"use client";

import type { WeatherScore as WeatherScoreType } from "@/types/weather";

// ── Constants ────────────────────────────────────────────────────────

const LABEL_COLORS: Record<WeatherScoreType["label"], string> = {
  Excellent: "stroke-emerald-500",
  Good: "stroke-cyan-500",
  Fair: "stroke-amber-500",
  Poor: "stroke-red-500",
};

const LABEL_BG_COLORS: Record<WeatherScoreType["label"], string> = {
  Excellent: "text-emerald-700",
  Good: "text-cyan-700",
  Fair: "text-amber-700",
  Poor: "text-red-700",
};

const TRACK_COLOR = "stroke-gray-200";
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 251.33

// ── Props ────────────────────────────────────────────────────────────

interface WeatherScoreProps {
  score: WeatherScoreType;
  size?: "sm" | "lg";
}

// ── Sub-component: breakdown row ────────────────────────────────────

function BreakdownRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.round(value)}%` }}
          />
        </div>
        <span className="w-7 text-right text-xs font-medium text-gray-700">
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────

export default function WeatherScore({
  score,
  size = "sm",
}: WeatherScoreProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(score.overall, 100) / 100);
  const rounded = Math.round(score.overall);

  return (
    <div className={`inline-flex flex-col items-center ${size === "lg" ? "gap-3" : "gap-1"}`}>
      {/* ── Circular gauge ──────────────────────────────────────────── */}
      <div className={`relative ${size === "lg" ? "h-24 w-24" : "h-16 w-16"}`}>
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            className={TRACK_COLOR}
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            className={LABEL_COLORS[score.label]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold leading-none ${
              size === "lg" ? "text-xl" : "text-sm"
            } ${LABEL_BG_COLORS[score.label]}`}
          >
            {rounded}
          </span>
        </div>
      </div>

      {/* ── Label ──────────────────────────────────────────────────── */}
      <span
        className={`font-medium ${size === "lg" ? "text-sm" : "text-xs"} ${
          LABEL_BG_COLORS[score.label]
        }`}
      >
        {score.label}
      </span>

      {/* ── Breakdown (lg only) ────────────────────────────────────── */}
      {size === "lg" && (
        <div className="w-full space-y-1.5">
          <BreakdownRow label="Temperature" value={score.breakdown.temperature} />
          <BreakdownRow label="Precipitation" value={score.breakdown.precipitation} />
          <BreakdownRow label="Wind" value={score.breakdown.wind} />
          <BreakdownRow label="Sunshine" value={score.breakdown.sunshine} />
        </div>
      )}
    </div>
  );
}

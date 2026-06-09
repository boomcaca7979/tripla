"use client";

import FlightStatusBadge from "./FlightStatusBadge";
import type { FlightLeg } from "@/types/flight";

// ── Helpers ──────────────────────────────────────────────────────────

/** Extract "HH:mm" from an ISO datetime string. */
function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

/** Convert total minutes to "Xh Ym" format. */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/** Return delay in minutes when actual differs from scheduled, or null. */
function calcDelay(scheduled: string, actual: string | null): number | null {
  if (!actual) return null;
  const diff = new Date(actual).getTime() - new Date(scheduled).getTime();
  if (diff <= 0) return null; // on time or early
  return Math.round(diff / 60_000);
}

// ── Props ────────────────────────────────────────────────────────────

interface FlightCardProps {
  flight: FlightLeg;
  selected?: boolean;
  onSelect?: () => void;
}

// ── Component ────────────────────────────────────────────────────────

export default function FlightCard({
  flight,
  selected = false,
  onSelect,
}: FlightCardProps) {
  const depDelay = calcDelay(
    flight.departure.scheduledTime,
    flight.departure.actualTime,
  );
  const arrDelay = calcDelay(
    flight.arrival.scheduledTime,
    flight.arrival.actualTime,
  );
  const hasDelay = depDelay !== null || arrDelay !== null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={[
        "cursor-pointer rounded-xl border p-4 transition-all",
        selected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
      ].join(" ")}
    >
      {/* ── Top row: airline + status ──────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {flight.airline.iata}
            {flight.flightNumber}
          </span>
          <span className="text-sm text-gray-500">{flight.airline.name}</span>
        </div>
        <FlightStatusBadge status={flight.status} />
      </div>

      {/* ── Middle row: departure → arrival ────────────────────────── */}
      <div className="flex items-center justify-between">
        {/* Departure */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(flight.departure.scheduledTime)}
          </div>
          <div className="text-sm text-gray-500">
            {flight.departure.airport.city} ({flight.departure.airport.iata})
          </div>
          {flight.departure.terminal && (
            <div className="text-xs text-gray-400">
              Terminal {flight.departure.terminal}
            </div>
          )}
        </div>

        {/* Duration line */}
        <div className="mx-3 flex-1">
          <div className="text-center text-xs text-gray-400">
            {formatDuration(flight.duration)}
          </div>
          <div className="relative my-1">
            <div className="border-t border-gray-300" />
            <svg
              className="absolute -right-1 -top-1 h-2.5 w-2.5 text-gray-400"
              viewBox="0 0 10 10"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10 5 L0 0 L0 10 Z" />
            </svg>
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatTime(flight.arrival.scheduledTime)}
          </div>
          <div className="text-sm text-gray-500">
            {flight.arrival.airport.city} ({flight.arrival.airport.iata})
          </div>
          {flight.arrival.terminal && (
            <div className="text-xs text-gray-400">
              Terminal {flight.arrival.terminal}
            </div>
          )}
        </div>
      </div>

      {/* ── Delay warning ──────────────────────────────────────────── */}
      {hasDelay && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {depDelay !== null && <span>Departure +{depDelay}m</span>}
          {depDelay !== null && arrDelay !== null && <span aria-hidden="true">·</span>}
          {arrDelay !== null && <span>Arrival +{arrDelay}m</span>}
        </div>
      )}
    </div>
  );
}

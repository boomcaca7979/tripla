"use client";

import { useState } from "react";
import FlightCard from "./FlightCard";
import Skeleton from "@/components/ui/Skeleton";
import type { FlightLeg } from "@/types/flight";
import type { AppError } from "@/types/common";

// ── Props ────────────────────────────────────────────────────────────

interface FlightListProps {
  flights: FlightLeg[];
  loading: boolean;
  error: AppError | null;
  onRetry?: () => void;
}

// ── Skeleton helper ──────────────────────────────────────────────────

function FlightCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Airline row */}
      <div className="mb-3 flex items-center justify-between">
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton variant="text" width={80} height={22} className="rounded-full" />
      </div>

      {/* Times row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <Skeleton variant="text" width={48} height={20} />
          <Skeleton variant="text" width={70} height={14} />
        </div>
        <div className="mx-3 flex-1">
          <Skeleton variant="text" width="60%" height={10} className="mx-auto" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton variant="text" width={48} height={20} />
          <Skeleton variant="text" width={70} height={14} />
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────

export default function FlightList({
  flights,
  loading,
  error,
  onRetry,
}: FlightListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading flights">
        {[0, 1, 2].map((i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <p className="text-sm font-medium text-red-800">{error.message}</p>
        {error.code && (
          <p className="text-xs text-red-600">Code: {error.code}</p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No flights found</p>
        <p className="text-xs text-gray-400">
          Try adjusting your search criteria or selecting a different date.
        </p>
      </div>
    );
  }

  // ── Flights list ──────────────────────────────────────────────────
  return (
    <div className="space-y-3" role="list" aria-label="Flight results">
      {flights.map((flight, i) => (
        <div key={`${flight.flightNumber}-${flight.departure.scheduledTime}`} role="listitem">
          <FlightCard
            flight={flight}
            selected={selectedIndex === i}
            onSelect={() =>
              setSelectedIndex((prev) => (prev === i ? null : i))
            }
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import DayCard from "./DayCard";
import ItineraryBuilder from "./ItineraryBuilder";
import PDFDownloadButton from "@/components/pdf/PDFDownloadButton";
import ShareButton from "@/components/ShareButton";
import {
  buildFlightSearchUrl,
  buildHotelSearchUrl,
} from "@/lib/affiliate";
import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

// ── Types ────────────────────────────────────────────────────────────

export interface GenerationStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatDateRange(start: string, end: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return `${fmt(start)} — ${fmt(end)}`;
}

const STEP_STATUS_ICONS: Record<
  GenerationStep["status"],
  { icon: string; className: string }
> = {
  pending: {
    icon: "○",
    className: "text-gray-300",
  },
  running: {
    icon: "◌",
    className: "text-blue-500",
  },
  done: {
    icon: "✓",
    className: "text-green-600",
  },
  error: {
    icon: "✗",
    className: "text-red-600",
  },
};

// ── Sub-component: Stepper ───────────────────────────────────────────

function GenerationStepper({ steps }: { steps: GenerationStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const meta = STEP_STATUS_ICONS[step.status];
        const isLast = i === steps.length - 1;
        return (
          <div key={step.label} className="flex items-start gap-3">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 items-center justify-center text-sm font-bold ${meta.className}`}
                aria-label={step.status}
              >
                {meta.icon}
              </span>
              {!isLast && (
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
              )}
            </div>
            {/* Label */}
            <div className="flex items-center pb-6 pt-0.5">
              <span
                className={`text-sm ${
                  step.status === "done"
                    ? "text-gray-500 line-through"
                    : step.status === "error"
                      ? "font-medium text-red-600"
                      : "text-gray-800"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────

interface ItineraryTimelineProps {
  itinerary: Itinerary | null;
  loading: boolean;
  progress: GenerationStep[];
  flights?: FlightLeg[];
}

// ── Component ────────────────────────────────────────────────────────

export default function ItineraryTimeline({
  itinerary,
  loading,
  progress,
  flights,
}: ItineraryTimelineProps) {
  const [activeTab, setActiveTab] = useState<"itinerary" | "packing">(
    "itinerary",
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // ── Packing-list localStorage ─────────────────────────────────────
  const storageKey = useMemo(
    () => (itinerary ? `packing_${itinerary.id}` : null),
    [itinerary],
  );

  const [packedSet, setPackedSet] = useState<Set<string>>(() => {
    if (!storageKey) return new Set();
    try {
      const raw = localStorage.getItem(storageKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(Array.from(packedSet)),
    );
  }, [packedSet, storageKey]);

  const togglePacked = useCallback(
    (item: string) => {
      setPackedSet((prev) => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
      });
    },
    [],
  );

  const allPacked = itinerary?.packingList ?? [];

  const toggleExpanded = useCallback(
    (dayNumber: number) => {
      setExpandedDay((prev) => (prev === dayNumber ? null : dayNumber));
    },
    [],
  );

  // Expand first day by default only on fresh data
  useEffect(() => {
    if (itinerary && itinerary.days.length > 0 && expandedDay === null) {
      setExpandedDay(itinerary.days[0].dayNumber);
    }
  }, [itinerary?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── Loading stepper ─────────────────────────────────────────────
  if (loading || (!itinerary && progress.length > 0)) {
    return (
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Generating your itinerary…
        </h3>
        <GenerationStepper steps={progress} />
      </div>
    );
  }

  // ── No data ─────────────────────────────────────────────────────
  if (!itinerary) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Submit a search to generate your itinerary.
        </p>
      </div>
    );
  }

  // ── Tabs ────────────────────────────────────────────────────────
  const tabs: { key: "itinerary" | "packing"; label: string }[] = [
    { key: "itinerary", label: "Itinerary" },
    { key: "packing", label: "Packing List" },
  ];


  return (
    <div className="space-y-4">
      {/* ── Header info ─────────────────────────────────────────── */}
      {/* Demo Data badge hidden — will re-enable when real API is connected */}

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            {itinerary.input.destination.city},{" "}
            {itinerary.input.destination.country}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <ItineraryBuilder itinerary={itinerary} />
            <PDFDownloadButton itinerary={itinerary} flights={flights} />
            <ShareButton itinerary={itinerary} flights={flights} />
            <a
              href={buildFlightSearchUrl({
                originIata: itinerary.input.origin.iata,
                destinationIata: itinerary.input.destination.iata,
                departDate: itinerary.input.departureDate,
                returnDate: itinerary.input.returnDate,
              })}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              Find Flights
            </a>
            <a
              href={buildHotelSearchUrl({
                city: itinerary.input.destination.city,
                checkIn: itinerary.input.departureDate,
                checkOut: itinerary.input.returnDate,
              })}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              Book Hotels
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {formatDateRange(
            itinerary.input.departureDate,
            itinerary.input.returnDate,
          )}
        </p>
        <p className="mt-1 text-sm text-gray-700">{itinerary.summary}</p>
        <p className="mt-2 text-sm font-semibold text-gray-800">
          Total: {itinerary.totalEstimatedCost} {itinerary.currency}
        </p>
      </div>

      {/* ── Important notes banner ──────────────────────────────── */}
      {itinerary.importantNotes.length > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          <div className="mb-1 flex items-center gap-1.5 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Important Notes
          </div>
          <ul className="list-inside list-disc space-y-0.5 text-xs">
            {itinerary.importantNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Itinerary tab ───────────────────────────────────────── */}
      {activeTab === "itinerary" && (
        <div className="space-y-2">
          {itinerary.days.map((day, i) => (
            <DayCard
              key={day.date}
              day={day}
              currency={itinerary.currency}
              exchangeRate={null}
              expanded={expandedDay === day.dayNumber}
              onToggle={() => toggleExpanded(day.dayNumber)}
              destinationCity={itinerary.input.destination.city}
              nextDate={itinerary.days[i + 1]?.date ?? itinerary.input.returnDate}
            />
          ))}
        </div>
      )}

      {/* ── Packing list tab ────────────────────────────────────── */}
      {activeTab === "packing" && (
        <div className="space-y-2">
          {allPacked.length === 0 ? (
            <p className="text-sm text-gray-500">No packing suggestions.</p>
          ) : (
            allPacked.map((item) => {
              const checked = packedSet.has(item);
              return (
                <label
                  key={item}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePacked(item)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span
                    className={
                      checked ? "line-through" : ""
                    }
                  >
                    {item}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import type { FlightStatus } from "@/types/flight";

// ── Color map ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<FlightStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  active: "bg-blue-100 text-blue-800",
  landed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  incident: "bg-orange-100 text-orange-800",
  diverted: "bg-yellow-100 text-yellow-800",
  unknown: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<FlightStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  landed: "Landed",
  cancelled: "Cancelled",
  incident: "Incident",
  diverted: "Diverted",
  unknown: "Unknown",
};

// ── Props ────────────────────────────────────────────────────────────

interface FlightStatusBadgeProps {
  status: FlightStatus;
}

// ── Component ────────────────────────────────────────────────────────

export default function FlightStatusBadge({ status }: FlightStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

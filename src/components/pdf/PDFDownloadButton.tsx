"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TripPDF from "./TripPDF";
import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";
import { getStoredUser } from "@/lib/auth";

// ── Props ───────────────────────────────────────────────────────────

interface PDFDownloadButtonProps {
  itinerary: Itinerary;
  flights?: FlightLeg[];
}

// ── Component ───────────────────────────────────────────────────────

export default function PDFDownloadButton({
  itinerary,
  flights,
}: PDFDownloadButtonProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(!!getStoredUser());
  }, []);

  const fileName = `tripla-itinerary-${itinerary.input.destination.city}-${itinerary.input.departureDate}.pdf`;

  // Not yet mounted (SSR guard for localStorage)
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white opacity-50"
      >
        Export PDF
      </button>
    );
  }

  // Not logged in — disabled with tooltip
  if (!loggedIn) {
    return (
      <span title="Log in to export PDF">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg bg-gray-300 px-3 py-1.5 text-sm font-medium text-gray-500"
        >
          Export PDF
        </button>
      </span>
    );
  }

  // Logged in — allow export (Pro check placeholder: logged in = allowed for now)
  return (
    <PDFDownloadLink
      document={<TripPDF itinerary={itinerary} flights={flights} />}
      fileName={fileName}
      className={[
        "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "bg-blue-600 text-white hover:bg-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      ].join(" ")}
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Export PDF")}
    </PDFDownloadLink>
  );
}

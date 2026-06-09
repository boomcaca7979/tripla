"use client";

import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
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
  const [loading, setLoading] = useState(false);
  const [loggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!getStoredUser();
  });

  const fileName = `tripla-itinerary-${itinerary.input.destination.city}-${itinerary.input.departureDate}.pdf`;

  const handleExport = useCallback(async () => {
    if (!loggedIn) {
      alert("Log in to export PDF");
      return;
    }

    setLoading(true);
    try {
      const blob = await pdf(
        <TripPDF itinerary={itinerary} flights={flights} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [itinerary, flights, fileName, loggedIn]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={[
        "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        loggedIn
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "cursor-not-allowed bg-gray-300 text-gray-500",
        loading ? "opacity-50" : "",
      ].join(" ")}
    >
      {loading ? "Preparing PDF…" : "Export PDF"}
    </button>
  );
}

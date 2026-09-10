"use client";

import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import TripPDF from "./TripPDF";
import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

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

  const fileName = `tripla-itinerary-${itinerary.input.destination.city}-${itinerary.input.departureDate}.pdf`;

  const handleExport = useCallback(async () => {
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
  }, [itinerary, flights, fileName]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      aria-disabled={loading}
      className={[
        "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "bg-blue-600 text-white hover:bg-blue-700",
        loading ? "opacity-50" : "",
      ].join(" ")}
    >
      {loading ? "Preparing PDF…" : "Export PDF"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/travel";
import type { Itinerary } from "@/types/itinerary";

interface ItineraryBuilderProps {
  itinerary: Itinerary;
}

export default function ItineraryBuilder({ itinerary }: ItineraryBuilderProps) {
  const saveItinerary = useTravelStore((s) => s.saveItinerary);
  const savedItineraries = useTravelStore((s) => s.savedItineraries);
  const alreadySaved = savedItineraries.some((it) => it.id === itinerary.id);
  const [saved, setSaved] = useState(alreadySaved);

  const handleSave = () => {
    if (saved) return;
    saveItinerary(itinerary);
    setSaved(true);
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saved}
      className={[
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        saved
          ? "cursor-not-allowed bg-green-100 text-green-700"
          : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      ].join(" ")}
    >
      {saved ? "Saved ✓" : "Save Itinerary"}
    </button>
  );
}

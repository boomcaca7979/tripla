"use client";

import { useState, useCallback } from "react";
import { createShareableLink } from "@/lib/share";
import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

// ── Props ────────────────────────────────────────────────────────────

interface ShareButtonProps {
  itinerary: Itinerary;
  flights?: FlightLeg[];
}

// ── Component ────────────────────────────────────────────────────────

export default function ShareButton({ itinerary, flights }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const link = createShareableLink(itinerary, flights);

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [itinerary, flights]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        copied
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
      ].join(" ")}
    >
      {copied ? (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Link copied!
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

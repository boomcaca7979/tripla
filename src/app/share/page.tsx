import type { Metadata } from "next";
import SharePageClient from "./SharePageClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shared Itinerary",
  description: "View a shared travel itinerary powered by tripla AI.",
};

export default function SharePage() {
  return (
    <Suspense>
      <SharePageClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import SharePageClient from "./SharePageClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shared itinerary",
  description: "View a travel itinerary shared with you from tripla.",
  // 载荷驱动页：无 ?data= 时只是 "Invalid Share Link" 空态，
  // 且变体无限 → 不收录、不跟随。
  alternates: { canonical: "/share" },
  robots: { index: false, follow: false },
};

export default function SharePage() {
  return (
    <Suspense>
      <SharePageClient />
    </Suspense>
  );
}

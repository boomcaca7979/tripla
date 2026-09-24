"use client";

import { useEffect } from "react";
import { trackEvent, referrerSourcePage } from "@/lib/analytics";

/**
 * DestinationViewTracker — 目的地详情页的 `destination_view` 事件岛。
 *
 * 由 server 页面（destinations/[slug]/page.tsx）以城市/国家 props 挂载；
 * 挂载即上报一次（导航到另一目的地时 props 变化会再次上报）。
 * source_page = 同站 referrer 的 pathname（direct / external 亦可）。
 */
export default function DestinationViewTracker({
  destination,
  country,
}: {
  destination: string;
  country: string;
}) {
  useEffect(() => {
    trackEvent({
      name: "destination_view",
      destination,
      country,
      source_page: referrerSourcePage(),
    });
  }, [destination, country]);

  return null;
}

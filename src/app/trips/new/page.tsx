import type { Metadata } from "next";
import { Suspense } from "react";
import TripsNewHandoff from "@/components/trips/TripsNewHandoff";

/**
 * /trips/new — 首页 SearchBar「Plan My Trip」的正式承接路由。
 *
 * 只读 query（destination slug + 可选 ISO 日期）并预填工作台 New Trip 表单；
 * 创建走现有 workspace reducer / 持久化流程。工具页（薄内容）→ noindex。
 */

export const metadata: Metadata = {
  title: "New trip",
  robots: { index: false, follow: true },
};

function NewTripLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-ut-surface-hover" />
    </div>
  );
}

export default function TripsNewPage() {
  return (
    <Suspense fallback={<NewTripLoading />}>
      <TripsNewHandoff />
    </Suspense>
  );
}

import { Suspense } from "react";
import PlanPageClient from "./PlanPageClient";

// ── Loading fallback ─────────────────────────────────────────────────

function PlanLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-8">
          <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
        <aside className="space-y-6 lg:w-80">
          <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        </aside>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────

export default function PlanPage() {
  return (
    <Suspense fallback={<PlanLoading />}>
      <PlanPageClient />
    </Suspense>
  );
}

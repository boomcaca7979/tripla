"use client";

import Link from "next/link";

// ── Feature data ─────────────────────────────────────────────────────

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { name: "AI Itinerary", free: "Up to 3 days", pro: "Unlimited days" },
  { name: "Basic Flights", free: true, pro: true },
  { name: "Weather", free: true, pro: true },
  { name: "Currency", free: true, pro: true },
  { name: "PDF Export", free: false, pro: true },
  { name: "Priority AI", free: false, pro: true },
  { name: "Multi-City Trips", free: false, pro: true },
];

// ── Component ────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="mx-auto h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="mx-auto h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm text-gray-700">{value}</span>;
  return value ? <CheckIcon /> : <CrossIcon />;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Pricing
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
          Start free, upgrade anytime
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto -mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Free</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
              <span className="text-sm text-gray-500">/forever</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              AI itinerary up to 3 days, basic flights, weather, currency
            </p>
            <Link
              href="/"
              className="mt-6 block w-full rounded-xl border border-blue-600 py-2.5 text-center text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Get Started
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white">
              Recommended
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Pro</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">$9.9</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Unlimited AI days, PDF export, priority AI, multi-city trips
            </p>
            <button
              disabled
              className="mt-6 block w-full cursor-not-allowed rounded-xl bg-gray-300 py-2.5 text-center text-sm font-semibold text-gray-500"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700">Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr
                  key={feature.name}
                  className={i < FEATURES.length - 1 ? "border-b border-gray-50" : ""}
                >
                  <td className="px-6 py-4 text-sm text-gray-700">{feature.name}</td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={feature.free} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={feature.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

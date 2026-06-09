"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

// ── Feature data ─────────────────────────────────────────────────────

interface PlanFeature {
  nameKey: string;
  free: boolean | string;
  freeKey?: string;
  pro: boolean | string;
  proKey?: string;
}

const FEATURES: PlanFeature[] = [
  { nameKey: "pricing.aiItinerary", free: "key", freeKey: "pricing.upTo3Days", pro: "key", proKey: "pricing.unlimitedDays" },
  { nameKey: "pricing.basicFlights", free: true, pro: true },
  { nameKey: "pricing.weather", free: true, pro: true },
  { nameKey: "pricing.currency", free: true, pro: true },
  { nameKey: "pricing.pdfExport", free: false, pro: true },
  { nameKey: "pricing.priorityAI", free: false, pro: true },
  { nameKey: "pricing.multiCityTrips", free: false, pro: true },
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

function CellValue({ value, valueKey, t }: { value: boolean | string; valueKey?: string; t: (key: string) => string }) {
  if (value === "key" && valueKey) return <span className="text-sm text-gray-700">{t(valueKey)}</span>;
  if (typeof value === "string") return <span className="text-sm text-gray-700">{value}</span>;
  return value ? <CheckIcon /> : <CrossIcon />;
}

export default function PricingClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {t("pricing.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto -mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">{t("pricing.free")}</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
              <span className="text-sm text-gray-500">{t("pricing.forever")}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t("pricing.freeDesc")}
            </p>
            <Link
              href="/"
              className="mt-6 block w-full rounded-xl border border-blue-600 py-2.5 text-center text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              {t("pricing.getStarted")}
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white">
              {t("pricing.recommended")}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">{t("pricing.pro")}</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">$9.9</span>
              <span className="text-sm text-gray-500">{t("pricing.month")}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t("pricing.proDesc")}
            </p>
            <button
              disabled
              className="mt-6 block w-full cursor-not-allowed rounded-xl bg-gray-300 py-2.5 text-center text-sm font-semibold text-gray-500"
            >
              {t("pricing.comingSoon")}
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">{t("pricing.feature")}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{t("pricing.free")}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700">{t("pricing.pro")}</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr
                  key={feature.nameKey}
                  className={i < FEATURES.length - 1 ? "border-b border-gray-50" : ""}
                >
                  <td className="px-6 py-4 text-sm text-gray-700">{t(feature.nameKey)}</td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={feature.free} valueKey={feature.freeKey} t={t} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={feature.pro} valueKey={feature.proKey} t={t} />
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

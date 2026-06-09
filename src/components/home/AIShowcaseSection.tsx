"use client";

import { useTranslation } from "@/lib/i18n";

// ── Component ────────────────────────────────────────────────────────

const AI_FEATURES = [
  {
    titleKey: "aiShowcase.smartItinerary",
    descriptionKey: "aiShowcase.smartItineraryDesc",
    iconColor: "from-purple-500 to-violet-600",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    titleKey: "aiShowcase.realTimeData",
    descriptionKey: "aiShowcase.realTimeDataDesc",
    iconColor: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4z" />
      </svg>
    ),
  },
  {
    titleKey: "aiShowcase.flexiblePlanning",
    descriptionKey: "aiShowcase.flexiblePlanningDesc",
    iconColor: "from-emerald-500 to-teal-600",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21.5 2v6h-6" />
        <path d="M2.5 22v-6h6" />
        <path d="M21.34 15.57a10 10 0 0 1-17.17 2.35" />
        <path d="M2.66 8.43a10 10 0 0 1 17.17-2.35" />
      </svg>
    ),
  },
];

export default function AIShowcaseSection() {
  const { t } = useTranslation();

  const handleCTA = () => {
    document
      .getElementById("hero-search")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("aiShowcase.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-gray-500">
          {t("aiShowcase.subtitle")}
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {AI_FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feature.iconColor} p-3.5 text-white shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t(feature.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleCTA}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t("aiShowcase.startPlanning")}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

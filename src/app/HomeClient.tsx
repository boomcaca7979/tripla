"use client";

import SearchBar from "@/components/search/SearchBar";
import ItineraryPreviewSection from "@/components/home/ItineraryPreviewSection";
import AIShowcaseSection from "@/components/home/AIShowcaseSection";
import { useTranslation } from "@/lib/i18n";

// ── Component ────────────────────────────────────────────────────────

export default function HomeClient() {
  const { t } = useTranslation();
  return (
    <>
      {/* ════════════ Hero ════════════ */}
      <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 pt-16">
        {/* Floating glowing orbs */}
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl animate-float-medium"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl animate-float-fast"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-cyan-200/10 blur-3xl animate-float-medium"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/4 top-1/2 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl animate-float-slow"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center">
          {/* Title area */}
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("hero.title1")}
            <br />
            {t("hero.title2")}
          </h1>
          <p className="mt-4 text-2xl font-light italic tracking-wide text-white/90 sm:text-3xl">
            {t("hero.tagline")}
          </p>
          <p className="mt-4 max-w-xl text-sm text-white/60 sm:text-base">
            {t("hero.description")}
          </p>

          {/* SearchBar island */}
          <div id="hero-search" className="mt-10 w-full max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ════════════ AI Showcase ════════════ */}
      <AIShowcaseSection />

      {/* ════════════ Itinerary Preview ════════════ */}
      <ItineraryPreviewSection />
    </>
  );
}

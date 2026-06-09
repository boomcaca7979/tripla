"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTravelStore } from "@/store/travel";
import { useHydration } from "@/hooks/useHydration";

// ── Navigation items ─────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Guides", href: "/guides" },
  { label: "Trips", href: "/trips" },
  { label: "Pricing", href: "/pricing" },
];

// ── Component ────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const hydrated = useHydration();

  const temperatureUnit = useTravelStore((s) => s.temperatureUnit);
  const toggleTemperatureUnit = useTravelStore((s) => s.toggleTemperatureUnit);
  const preferredCurrency = useTravelStore((s) => s.preferredCurrency);
  const setPreferredCurrency = useTravelStore((s) => s.setPreferredCurrency);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleComingSoon = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (item.comingSoon) {
      e.preventDefault();
      alert("Coming soon");
    }
  }, []);

  const isActive = useCallback(
    (item: NavItem) => {
      if (item.comingSoon) return false;
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    },
    [pathname],
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* ── Left: Logo ──────────────────────────────────────────── */}
        <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="tripla"
            width={120}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* ── Center: Navigation ──────────────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleComingSoon(e, item)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Link
            href="/#hero-search"
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
            aria-label="Search"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>

          {/* Language switch (placeholder) */}
          <button
            type="button"
            onClick={() => alert("Coming soon")}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
            aria-label="Switch language"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>

          {/* Temperature & Currency */}
          {hydrated && (
            <>
              <button
                type="button"
                onClick={toggleTemperatureUnit}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Switch to ${temperatureUnit === "C" ? "Fahrenheit" : "Celsius"}`}
              >
                °{temperatureUnit}
              </button>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Preferred currency"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="JPY">JPY ¥</option>
                <option value="GBP">GBP £</option>
                <option value="CNY">CNY ¥</option>
              </select>
            </>
          )}

          {/* Login */}
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex"
          >
            Log in
          </Link>

          {/* Register */}
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign up
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    handleComingSoon(e, item);
                    setMobileOpen(false);
                  }}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

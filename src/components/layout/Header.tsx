"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTravelStore } from "@/store/travel";
import { useHydration } from "@/hooks/useHydration";
import { getStoredUser, signOut } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// ── Navigation items ─────────────────────────────────────────────────

interface NavItem {
  labelKey: string;
  href: string;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.destinations", href: "/destinations" },
  { labelKey: "nav.guides", href: "/guides" },
  { labelKey: "nav.trips", href: "/trips" },
  { labelKey: "nav.pricing", href: "/pricing" },
];

// ── Component ────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const hydrated = useHydration();
  const { t } = useTranslation();

  const temperatureUnit = useTravelStore((s) => s.temperatureUnit);
  const toggleTemperatureUnit = useTravelStore((s) => s.toggleTemperatureUnit);
  const preferredCurrency = useTravelStore((s) => s.preferredCurrency);
  const setPreferredCurrency = useTravelStore((s) => s.setPreferredCurrency);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());

    // 监听 localStorage 变化，实现跨标签页状态同步
    const handleStorage = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  const handleComingSoon = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (item.comingSoon) {
      e.preventDefault();
      alert(t("nav.comingSoon"));
    }
  }, [t]);

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
                key={item.labelKey}
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
                {t(item.labelKey)}
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

          {/* Language switch */}
          <LanguageSwitcher />

          {/* Temperature & Currency — desktop only */}
          {hydrated && (
            <>
              <button
                type="button"
                onClick={toggleTemperatureUnit}
                className="hidden rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:inline-flex"
                aria-label={`Switch to ${temperatureUnit === "C" ? "Fahrenheit" : "Celsius"}`}
              >
                °{temperatureUnit}
              </button>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="hidden rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:inline-flex"
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

          {/* Auth — desktop only (mobile gets the buttons in the sheet) */}
          {hydrated && currentUser ? (
            <div className="hidden items-center gap-2 lg:inline-flex">
              <span className="text-sm text-gray-600">{currentUser.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 lg:inline-flex"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:inline-flex"
              >
                {t("nav.signup")}
              </Link>
            </>
          )}

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
                  key={item.labelKey}
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
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Temperature & Currency inside the mobile sheet */}
          {hydrated && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={toggleTemperatureUnit}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                aria-label={`Switch to ${temperatureUnit === "C" ? "Fahrenheit" : "Celsius"}`}
              >
                °{temperatureUnit}
              </button>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Preferred currency"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="JPY">JPY ¥</option>
                <option value="GBP">GBP £</option>
                <option value="CNY">CNY ¥</option>
              </select>
            </div>
          )}

          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            {currentUser ? (
              <>
                <span className="flex-1 self-center truncate py-2 text-center text-sm text-gray-600">{currentUser.email}</span>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

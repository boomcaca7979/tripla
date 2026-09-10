"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTravelStore } from "@/store/travel";
import { useHydration } from "@/hooks/useHydration";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TriplaLogo from "@/components/ui/TriplaLogo";

// ── Navigation ───────────────────────────────────────────────────────
// 仅链接现有路由；Explore / Experiences 槽位等对应路由在 Phase 5 落地后再加入。

interface NavItem {
  labelKey: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.destinations", href: "/destinations" },
  { labelKey: "nav.guides", href: "/guides" },
  { labelKey: "nav.routes", href: "/trips" },
  { labelKey: "nav.regions", href: "/regions" },
  { labelKey: "nav.bestTime", href: "/best-time-to-visit" },
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // 滚动后导航轻微实体化（rAF 节流， passive listener）
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Drawer：打开时锁定滚动 + 聚焦关闭按钮；Escape 关闭并归还焦点
  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  // Home 上 Header 属于环境：顶部与天空同墨色、透明；滚动后沉入 envDeep 表面。
  // 非 Home 页保持既有纸面 chrome 行为。
  const isHome = pathname === "/";

  const navLinkClass = (active: boolean) => [
    "relative px-3 py-1.5 text-body-sm font-medium transition-colors",
    "duration-[var(--ut-dur-fast)] ease-ut-out",
    active ? "text-ut-accent" : "text-ut-text-2 hover:text-ut-text",
  ];

  // 中心展开的 accent 下划线（hover / active）
  const underlineSpan = (active: boolean) => (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-x-3 bottom-0 h-[1.5px] origin-center bg-ut-accent",
        "transition-transform duration-[var(--ut-dur-med)] ease-ut-out",
        active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
      ].join(" ")}
    />
  );

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "border-b transition-[background-color,border-color,box-shadow,color] duration-[var(--ut-dur-med)] ease-ut-out",
        isHome ? "backdrop-blur-0" : "backdrop-blur-sm",
        scrolled
          ? "border-[rgba(var(--ut-accent-rgb,180,95,77),0.16)] bg-[rgba(var(--ut-env-deep-rgb,250,249,246),0.82)] shadow-ut-1 backdrop-blur-md"
          : isHome
            ? "border-transparent bg-transparent"
            : "border-transparent bg-ut-bg/55",
        isHome && !scrolled ? "ut-header-on-env" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[var(--ut-container-max)] items-center justify-between px-4 md:px-6">
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link
          href="/"
          className="rounded-ut-sm transition-opacity duration-[var(--ut-dur-fast)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ut-accent"
          aria-label="tripla — home"
        >
          <TriplaLogo />

        </Link>

        {/* ── Desktop nav ──────────────────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={`group/nav ${navLinkClass(active).join(" ")}`}>
                {t(item.labelKey)}
                {underlineSpan(active)}
              </Link>
            );
          })}
        </nav>

        {/* ── Right actions ────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Link
            href="/#hero-search"
            className="rounded-ut-sm p-2 text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
            aria-label="Search destinations"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>

          <LanguageSwitcher />

          {hydrated && (
            <>
              <button
                type="button"
                onClick={toggleTemperatureUnit}
                className="hidden rounded-ut-sm border border-ut-border px-2 py-1 font-mono text-label text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:border-ut-border-strong hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent sm:inline-flex min-h-[28px] items-center"
                aria-label={`Switch to ${temperatureUnit === "C" ? "Fahrenheit" : "Celsius"}`}
              >
                °{temperatureUnit}
              </button>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="hidden rounded-ut-sm border border-ut-border px-2 py-1 font-mono text-label text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:border-ut-border-strong focus-visible:outline-2 focus-visible:outline-ut-accent sm:inline-flex min-h-[28px]"
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

          {/* Mobile drawer toggle */}
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-ut-sm p-2 text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent lg:hidden"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer（全屏，Escape 关闭，焦点管理） ──────────── */}
      {drawerOpen && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[60] flex flex-col bg-ut-bg lg:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-ut-border px-4 md:px-6">
            <TriplaLogo />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => { setDrawerOpen(false); toggleButtonRef.current?.focus(); }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-ut-sm p-2 text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto p-4 md:p-6" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex min-h-[48px] items-center rounded-ut-md px-4 text-body-lg font-medium transition-colors",
                    "duration-[var(--ut-dur-fast)] ease-ut-out focus-visible:outline-2 focus-visible:outline-ut-accent",
                    active ? "bg-ut-accent-soft text-ut-accent" : "text-ut-text hover:bg-ut-surface-hover",
                  ].join(" ")}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}

            {/* 偏好设置（保持既有公开功能） */}
            {hydrated && (
              <div className="mt-4 flex items-center gap-3 border-t border-ut-border pt-4">
                <button
                  type="button"
                  onClick={toggleTemperatureUnit}
                  className="min-h-[44px] flex-1 rounded-ut-md border border-ut-border text-center font-mono text-body-sm text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:border-ut-border-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
                  aria-label={`Switch to ${temperatureUnit === "C" ? "Fahrenheit" : "Celsius"}`}
                >
                  °{temperatureUnit}
                </button>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="min-h-[44px] flex-1 rounded-ut-md border border-ut-border px-3 font-mono text-body-sm text-ut-text-2 focus-visible:outline-2 focus-visible:outline-ut-accent"
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
          </nav>
        </div>
      )}
    </header>
  );
}

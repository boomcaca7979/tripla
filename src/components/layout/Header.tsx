"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTravelStore } from "@/store/travel";
import { useHydration } from "@/hooks/useHydration";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TriplaLogo from "@/components/ui/TriplaLogo";
import AccountLink, { AccountDrawerLinks } from "@/components/layout/AccountLink";
import {
  ENV_DARK_TOKENS, HEADER_FULL_STATE_CLASS, HEADER_SCROLLED_STATE_CLASS,
} from "@/lib/env-tokens";

// ── Navigation ───────────────────────────────────────────────────────
// 只链接真实存在的路由。
//
// `Account`（href 仍是 /trips）是用户的个人旅行工作台入口：Trips / Saved /
// Inbox / Expenses / Profile / Settings 都在这一层之下。导航语义是"个人中心"，
// 但 URL 保持 /trips —— 不为改称谓迁移 route，也不重做 SEO。

interface NavItem {
  labelKey: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.destinations", href: "/guides" },
  { labelKey: "nav.atlas", href: "/destinations" },
  { labelKey: "nav.account", href: "/trips" },
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

  // Home 上 Header 恒为"完整状态"（沉入 envDeep 表面），不再有透明初始态；
  // 非 Home 页保持既有纸面 chrome 行为（未滚动浅底 / 滚动后实体化）。
  // 注意：isHome 必须在下面的滚动 effect 之前声明（该 effect 的依赖里用到它）。
  const isHome = pathname === "/";

  /**
   * 深色"世界"页：首页 + Trips Hub。
   *
   * /trips 的页面背景来自 .ut-world（#0c0f16），而 Header 默认是纸面浅底，
   * 于是浅色 Header 直接压在近黑页面上形成一道明显接缝。这里让它复用首页
   * 已经确认的同一套 Header 外观（HEADER_FULL_STATE_CLASS + ENV_DARK_TOKENS），
   * 不新增样式、不改变 Header 设计。
   *
   * 注意与 isHome 的区别：isHome 还控制 LanguageSwitcher 是否渲染（首页恒英文），
   * 而 /trips 需要保留语言切换器 —— 因此两者分开判断。
   */
  const isDarkWorld = isHome || pathname === "/trips";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // 滚动后导航轻微实体化（rAF 节流， passive listener）。
  //
  // 深色世界页例外：首页与 /trips 的导航栏**整个生命周期**都使用"完整状态"
  // （见下方 isDarkWorld 分支），不存在"透明简化态 → 滚动后实体化"的切换，
  // 因此这两类页面不需要这个监听。
  // 其余路由保持原行为（未滚动 = 纸面浅底，滚动 = 实体化）。
  useEffect(() => {
    if (isDarkWorld) return;
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
  }, [isDarkWorld]);

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
        // 首页 / Trips Hub：从首帧起就使用"完整导航栏"状态，且不随滚动改变
        // （HEADER_FULL_STATE_CLASS = 与滚动后完全同一套外观，不存在第二套样式）
        isDarkWorld
          ? HEADER_FULL_STATE_CLASS
          : scrolled
            ? HEADER_SCROLLED_STATE_CLASS
            : "border-transparent bg-ut-bg/55 backdrop-blur-sm",
      ].join(" ")}
      // 深色世界页的 Header 渲染在 HomeEnvironment 包裹层之外，拿不到运行时注入
      // :root 的 token；这里在首帧（SSR HTML）就带上同一份深色墨色族，
      // 避免 hydration 前后换色。（/trips 同样适用）
      style={isDarkWorld ? (ENV_DARK_TOKENS as React.CSSProperties) : undefined}
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

          {/* 语言切换器只在非首页渲染：首页 UI 恒为英文（面向国际用户），
              若在首页展示"中文"选项会与英文界面混排。其余路由行为不变。 */}
          {!isHome && <LanguageSwitcher />}

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

          {/* 认证入口：未登录 = Sign in + Create account；已登录 = 账号芯片
              （Account → /trips / Sign out）。放在移动端菜单按钮之前，
              不改变 Header 既有布局与视觉结构。 */}
          <AccountLink />

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
      {/*
        ⚠️ 尺寸必须用**视口单位**，不能用 `inset-0`。
        Header 带 backdrop-blur（backdrop-filter），按规范它会成为 fixed 后代的
        **包含块** —— 于是 `inset-0` 解析成 header 自己的盒子（只有 64px 高），
        抽屉被压成 64px；内部 <nav> 又带 overflow-y-auto，直接把 5 个导航项
        裁成 0 高 → 打开菜单后什么都看不到、也点不到。
        改用 `left-0 top-0 w-full h-[100dvh]`：vw/vh/dvh 恒以视口为参照，
        不受包含块影响；`top-0 left-0` 落在 header padding box 原点，
        即视口原点。结论：抽屉恢复为真正的全屏覆盖层。
      */}
      {drawerOpen && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed left-0 top-0 z-[60] flex h-[100dvh] w-full flex-col bg-ut-bg lg:hidden"
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

            {/* 认证入口（与桌面端同一 auth 来源，两种状态共用一份渲染逻辑） */}
            <AccountDrawerLinks onNavigate={() => setDrawerOpen(false)} />

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

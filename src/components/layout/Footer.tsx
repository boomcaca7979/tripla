"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import Eyebrow from "@/components/ui/Eyebrow";

// ── Footer navigation groups ─────────────────────────────────────────
// 仅链接现有路由（新 URL 在后续 Phase 落地后再加入）。全部为可爬取 <Link>。

interface FooterLink {
  labelKey: string;
  href: string;
}

const GROUPS: { titleKey: string; links: FooterLink[] }[] = [
  {
    titleKey: "footer.discover",
    links: [
      { labelKey: "nav.destinations", href: "/guides" },
      { labelKey: "nav.atlas", href: "/destinations" },
      { labelKey: "footer.travelStyles", href: "/travel-styles" },
    ],
  },
  {
    titleKey: "footer.travel",
    links: [
      { labelKey: "nav.account", href: "/trips" },
      { labelKey: "footer.budget", href: "/travel-budget" },
    ],
  },
  {
    titleKey: "footer.tools",
    links: [
      // /share 需要 ?data= 载荷，无载荷时是 "Invalid Share Link" 空态；
      // 它由 Trip 内的分享按钮进入，不作为站点级入口，故此处不再链接。
      { labelKey: "footer.plan", href: "/plan" },
    ],
  },
  {
    titleKey: "footer.about",
    links: [
      { labelKey: "nav.home", href: "/" },
      { labelKey: "footer.privacy", href: "/privacy" },
      { labelKey: "footer.terms", href: "/terms" },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 border-t border-[rgba(var(--ut-accent-rgb,180,95,77),0.14)]"
      style={{ background: "var(--ut-footer-bg, var(--ut-surface))" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-block font-display text-h3 text-ut-ink transition-opacity duration-[var(--ut-dur-fast)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              tripla
            </Link>
            <p className="mt-3 max-w-[26ch] text-body-sm text-ut-muted">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Link groups */}
          {GROUPS.map((group) => (
            <nav key={group.titleKey} aria-label={t(group.titleKey)}>
              <Eyebrow className="mb-3">{t(group.titleKey)}</Eyebrow>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block rounded-ut-sm text-body-sm text-ut-text-2 underline-offset-2 transition-colors duration-[var(--ut-dur-fast)] ease-ut-out hover:text-ut-accent hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Affiliate disclosure */}
        <p className="mt-10 border-t border-ut-border pt-6 text-label leading-relaxed text-ut-muted">
          {t("footer.affiliates")}
        </p>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label text-ut-subtle">
            &copy; {year} tripla. {t("footer.rights")}
          </p>
          <p className="text-label text-ut-subtle">
            {t("footer.poweredBy")}{" "}
            <a
              href="https://aviationstack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Aviationstack
            </a>
            ,{" "}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Open-Meteo
            </a>
            ,{" "}
            <a
              href="https://groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ut-accent"
            >
              Groq
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

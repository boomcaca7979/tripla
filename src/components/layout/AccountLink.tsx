"use client";

/**
 * Auth entry for the site Header.
 *
 * Two variants, one auth source (Supabase Auth — the same session read by
 * /login, /register and the /trips workspace through `useSession()`; there is
 * no second auth system and localStorage is never treated as identity):
 *
 *   · `AccountLink`        desktop right-actions — compact "Sign in" +
 *                          "Create account" when signed out; an account chip
 *                          that opens a small menu (Account → /trips, Sign out)
 *                          when signed in.
 *   · `AccountDrawerLinks` mobile drawer — the same two states as full-width
 *                          rows, so small viewports always have a visible entry.
 *
 * Scope discipline: no large account block, no Header redesign, no Profile /
 * Settings surface here. `/trips` is the personal travel workspace and keeps
 * its URL; only the navigation label reads "Account".
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useSession } from "@/lib/use-session";

// ── Desktop ──────────────────────────────────────────────────────────

const SIGN_IN_CLASS =
  "rounded-ut-sm px-2.5 py-1 text-[0.8125rem] font-medium text-ut-text-2 " +
  "transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover " +
  "hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent";

const CREATE_ACCOUNT_CLASS =
  "inline-flex min-h-[32px] items-center rounded-ut-sm border border-ut-border-strong " +
  "px-3 text-[0.8125rem] font-semibold text-ut-text transition-colors " +
  "duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover " +
  "focus-visible:outline-2 focus-visible:outline-ut-accent";

export default function AccountLink() {
  const { email, ready, busy, signOut } = useSession();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  // Reserve the same footprint while the session resolves (no layout shift).
  if (!ready) return <span className="hidden w-[11.5rem] md:inline-block" aria-hidden="true" />;

  if (!email) {
    return (
      <div className="hidden items-center gap-1.5 md:flex">
        <Link href="/login" className={SIGN_IN_CLASS}>
          {t("nav.signIn")}
        </Link>
        <Link href="/register" className={CREATE_ACCOUNT_CLASS}>
          {t("nav.createAccount")}
        </Link>
      </div>
    );
  }

  const short = email.length > 22 ? `${email.slice(0, 20)}…` : email;

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label={t("nav.account")}
        className="flex max-w-[13rem] items-center gap-1.5 rounded-ut-sm px-2 py-1 text-[0.8125rem] font-medium text-ut-text-2 transition-colors duration-[var(--ut-dur-fast)] hover:bg-ut-surface-hover hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
      >
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ut-accent text-[0.625rem] font-bold text-white"
        >
          {email.slice(0, 1).toUpperCase()}
        </span>
        <span className="truncate">{short}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-ut-md border border-ut-border bg-ut-surface py-1 shadow-[var(--ut-shadow-md,0_8px_24px_rgba(0,0,0,0.12))]">
          <p className="truncate px-3 py-1.5 text-[0.6875rem] text-ut-muted" title={email}>
            {email}
          </p>
          <Link
            href="/trips"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-[0.8125rem] font-medium text-ut-text transition-colors hover:bg-ut-surface-hover"
          >
            {t("nav.account")}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              setMenuOpen(false);
            }}
            disabled={busy}
            className="w-full cursor-pointer px-3 py-2 text-left text-[0.8125rem] font-medium text-ut-text transition-colors hover:bg-ut-surface-hover disabled:opacity-60"
          >
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Mobile drawer ────────────────────────────────────────────────────

const DRAWER_ROW_CLASS =
  "flex min-h-[48px] items-center rounded-ut-md px-4 text-body-lg font-medium " +
  "text-ut-text transition-colors duration-[var(--ut-dur-fast)] ease-ut-out " +
  "hover:bg-ut-surface-hover focus-visible:outline-2 focus-visible:outline-ut-accent";

/** Presentational so the drawer's own nav <Link>s decide layout; this only
 *  supplies the auth rows. Renders nothing until the session is resolved. */
export function AccountDrawerLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { email, ready, busy, signOut } = useSession();
  const { t } = useTranslation();

  if (!ready) return null;

  if (!email) {
    return (
      <div className="mt-4 flex flex-col gap-1 border-t border-ut-border pt-4">
        <Link href="/login" onClick={onNavigate} className={DRAWER_ROW_CLASS}>
          {t("nav.signIn")}
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          className={`${DRAWER_ROW_CLASS} bg-ut-accent-soft text-ut-accent`}
        >
          {t("nav.createAccount")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-1 border-t border-ut-border pt-4">
      <p className="truncate px-4 text-label text-ut-muted" title={email}>
        {email}
      </p>
      <Link href="/trips" onClick={onNavigate} className={DRAWER_ROW_CLASS}>
        {t("nav.account")}
      </Link>
      <button type="button" onClick={signOut} disabled={busy} className={`${DRAWER_ROW_CLASS} text-left disabled:opacity-60`}>
        {t("nav.signOut")}
      </button>
    </div>
  );
}

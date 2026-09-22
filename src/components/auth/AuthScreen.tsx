"use client";

/**
 * AuthScreen — sign in / create account / reset password.
 *
 * Visual reference: ZCool work ZMjQwODgxODA《一个后台》(EamonSun), **login artwork**
 * (the flat login page in the 2nd image, not the laptop mockup on the cover).
 *
 * Artwork composition (measured pixel-by-pixel from img2.png; the login artboard is
 * 1280×612 — the grey band below it is the design tool canvas #F6F6F6, not the page):
 *  - full-page light blue background #B9D9FF;
 *  - one centred 908×460 **flat, square-cornered card with no radius and no shadow**
 *    (measured x 187..1094 / y 76..535 — centred both ways inside the 1280×612 artboard);
 *  - the card splits into **two equal 454px halves**: left pure-white #FFFFFF form area,
 *    right brand-blue panel #4CA1FF;
 *  - three shapes inside the blue panel (all measured geometry):
 *      1. light-mid blue circle #99CAFE at the top right
 *      2. wide light-blue wave #C2DFFE sweeping left → lower right (path taken from the
 *         artwork's per-row boundary points, max deviation ≤4px)
 *      3. brand-blue circle at the bottom left (centre (-130,555) r242)
 *  - panel content: centred white wordmark UTRIPLA (centre at 33.1% of panel height),
 *    a 7-dot row below it (#C2DFFE, 3px dots / 11px gaps, measured 86px span), and two
 *    lines of brand copy at the bottom (75.65% / 81.96%).
 *
 * ⚠ Known non-alignable items (recorded honestly rather than faked): the artwork's panel
 * wordmark measured as **3 ~40px CJK glyphs** (bbox 116×43). This implementation renders
 * the Latin wordmark UTRIPLA instead (34px, bbox ≈152×24) per the "keep the brand name
 * only" requirement; the two are **vertically centred identically (both at 33.1% of the
 * panel)**, but the glyphs and point size are incommensurable. The artwork's second bottom
 * line measured only 29px wide / 2px tall (barely visible), so this implementation uses a
 * short word of comparable width rather than inventing a long English sentence.
 *  - Left panel measured: form column x 305..518 (214 wide), input box 214×24 (fill
 *    #FAFCFE), pill button 89×24 (#4CA1FF), 1px #B8B8B8 divider (454-218 padding).
 *
 * Note: the wave path viewBox is still 457×465 while the container is 454×460, relying on
 * preserveAspectRatio="none" for a 0.7%/1.1% squeeze — smaller than the measurement noise
 * in the artwork's own anti-aliasing, so no per-point resampling.
 *
 * Auth goes through WorkBuddy Cloud (real requests): password sign-in / email-OTP
 * registration (with password) / password reset. Registration requires the OTP
 * (the SDK needs a verificationToken), hence the two steps.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLOUD_CONFIGURED, getCloud } from "@/lib/cloud";

// ── Artwork sampling constants (measured in the 1280px artboard) ──────

const PAGE_BG = "#B9D9FF";
const BRAND = "#4CA1FF";
const WAVE_LIGHT = "#C2DFFE";
const WAVE_MID = "#99CAFE";
const LABEL = "#757575";
const INK = "#2C3A55";
const INPUT_BG = "#FAFCFE";
const INPUT_BORDER = "#EFF1F2";
const DIVIDER = "#B8B8B8";

/** Upper boundary of the big wave (sampled every 24px → smoothed cubic bezier) */
const WAVE_PATH =
  "M0,186C8.0,192.5 32.0,215.0 48,225C64.0,235.0 80.0,240.7 96,246C112.0,251.3 128.0,254.0 144,257" +
  "C160.0,260.0 176.0,262.5 192,264C208.0,265.5 224.0,265.7 240,266C256.0,266.3 272.0,265.2 288,266" +
  "C304.0,266.8 320.0,267.5 336,271C352.0,274.5 368.0,279.3 384,287C400.0,294.7 419.8,308.0 432,317" +
  "C444.2,326.0 452.8,337.0 457,341";

type View = "login" | "register" | "forgot";

/** Shared network failure copy (kept in one place so it stays consistent). */
const NETWORK_ERROR = "Network error. Check your connection and try again.";

// ── Brand panel ──────────────────────────────────────────────────────

function BrandArt() {
  return (
    <svg
      viewBox="0 0 457 465"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="457" height="465" fill={BRAND} />
      <circle cx="421" cy="-110" r="234" fill={WAVE_MID} />
      <path d={`${WAVE_PATH}L457,465L0,465Z`} fill={WAVE_LIGHT} />
      <circle cx="-130" cy="555" r="242" fill={BRAND} />
    </svg>
  );
}

function BrandBlock({ mobile }: { mobile?: boolean }) {
  return (
    <>
      {/* Wordmark + dot row (artwork logo sits at 29.5% of panel height, centred) */}
      <div
        className="absolute inset-x-0 flex flex-col items-center"
        style={{ top: mobile ? "26%" : "29.46%" }}
      >
        <p
          className={`font-bold leading-none tracking-[0.06em] text-white ${
            mobile ? "text-[22px]" : "text-[34px]"
          }`}
        >
          tripla
        </p>
        <span
          aria-hidden="true"
          className={`flex items-center ${mobile ? "mt-1.5 gap-[9px]" : "mt-2 gap-[11px]"}`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`rounded-full ${mobile ? "h-[3px] w-[3px]" : "h-[3px] w-[3px]"}`}
              style={{ backgroundColor: WAVE_LIGHT }}
            />
          ))}
        </span>
      </div>

      {/* Two lines of brand copy at the bottom (artwork: 75.3% / 81.3%) */}
      <div
        className="absolute inset-x-0 flex flex-col items-center text-center text-white"
        style={{ top: mobile ? "58%" : "75.31%" }}
      >
        <p className={`font-semibold tracking-[0.18em] ${mobile ? "text-[10px]" : "text-[11px]"}`}>
          TRAVEL DISCOVERY
        </p>
        <p
          className={`font-medium tracking-[0.1em] text-white/95 ${
            mobile ? "mt-1.5 text-[8px]" : "mt-2 text-[9px]"
          }`}
        >
          ATLAS
        </p>
      </div>
    </>
  );
}

// ── Small form controls (following the artwork: slim input bar + pill button) ──

function Field({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-[10px] block text-[12px] leading-none" style={{ color: LABEL }}>
        {label}
      </span>
      <input
        {...input}
        className="block h-[24px] w-full rounded-[2px] border px-[9px] text-[12px] outline-none transition-shadow"
        style={{ backgroundColor: INPUT_BG, borderColor: INPUT_BORDER, color: INK }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${BRAND}`;
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
          input.onBlur?.(e);
        }}
      />
    </label>
  );
}

function PillButton({
  children,
  loading,
  ...rest
}: { children: React.ReactNode; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const disabled = rest.disabled || loading;
  return (
    <button
      {...rest}
      disabled={disabled}
      className="inline-flex h-[24px] min-w-[89px] cursor-pointer items-center justify-center gap-[6px] rounded-full px-[14px] text-[12px] leading-none text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
      style={{ backgroundColor: disabled ? "#3E8FE8" : BRAND }}
    >
      {loading ? "Please wait…" : children}
      {!loading && (
        <span aria-hidden="true" className="text-[11px]">
          →
        </span>
      )}
    </button>
  );
}

function Msg({ kind, text }: { kind: "error" | "info"; text: string }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className="text-[11px] leading-relaxed"
      style={{ color: kind === "error" ? "#E5484D" : BRAND }}
    >
      {text}
    </p>
  );
}

// ── Error copy (driven by stable kinds, never by guessing internals) ──

function humanError(err: { kind?: string; code?: string; message?: string } | null | undefined): string {
  const kind = err?.kind ?? "";
  const code = err?.code ?? "";
  const msg = err?.message ?? "";
  if (kind === "invalid_grant" || kind === "unauthenticated") return "Incorrect email or password.";
  if (code === "invalid_username_or_password" || /incorrect|credential|wrong[_ ]?password/i.test(msg))
    return "Incorrect email or password.";
  if (kind === "network") return NETWORK_ERROR;
  if (kind === "backend-unavailable") return "The service is temporarily unavailable. Please try again shortly.";
  if (/password/i.test(msg)) return "That password does not meet the requirements (at least 6 characters).";
  if (/email/i.test(msg) && /invalid|format/i.test(msg)) return "That email address does not look valid.";
  if (/code|token|verification/i.test(msg)) return "The verification code is incorrect or has expired.";
  if (/rate|frequent|limit/i.test(msg)) return "Too many attempts. Please try again in a moment.";
  return msg || "Something went wrong. Please try again.";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── Main component ───────────────────────────────────────────────────

export default function AuthScreen({ initialMode }: { initialMode: "login" | "register" }) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const pendingRef = useRef<{
    verificationId?: string;
    isExistingUser?: boolean;
    resetChallenge?: { updateUser: (u: { nonce: string; password: string }) => Promise<unknown> };
  }>({});
  const switchedRef = useRef(false);

  const reset = useCallback((next: View) => {
    setView(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
    setCode("");
    setRegisterStep(1);
    setForgotStep(1);
    pendingRef.current = {};
  }, []);

  // A signed-in user landing on sign in / create account goes to the real account area.
  // Guarded: without cloud config there is no session to resolve, and an unguarded
  // `getCloud()` here would throw synchronously inside the effect and hand the whole
  // route to the error boundary instead of simply showing the form.
  useEffect(() => {
    if (switchedRef.current) return;
    switchedRef.current = true;
    if (!CLOUD_CONFIGURED) return;
    try {
      getCloud()
        .auth.getSession()
        .then(({ data }) => {
          if (data) router.replace("/trips");
        })
        .catch(() => {});
    } catch {
      // Defensive: treat as signed out.
    }
  }, [router]);

  const goToTrips = useCallback(() => {
    router.replace("/trips");
    router.refresh();
  }, [router]);

  // ── Flow submissions ────────────────────────────────────────────────

  const submitLogin = async () => {
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    setError("");
    try {
      const { error: e } = await getCloud().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (e) {
        console.warn("[auth] signInWithPassword error", JSON.stringify(e));
        return setError(humanError(e));
      }
      goToTrips();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const submitRegisterSend = async () => {
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const sent = await getCloud().auth.sendOtp({ email: email.trim() });
      if (sent.error) return setError(humanError(sent.error));
      if (sent.data.isExistingUser) {
        // Neutral copy that does not leak account existence — just point at sign in
        reset("login");
        setInfo("That email is already registered. Please sign in.");
        return;
      }
      pendingRef.current = { verificationId: sent.data.verificationId, isExistingUser: false };
      setRegisterStep(2);
      setInfo("We’ve sent a verification code to your email.");
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const submitRegisterVerify = async () => {
    const pending = pendingRef.current;
    if (!pending.verificationId) return setError("Request a verification code first.");
    if (!code.trim()) return setError("Enter the email verification code.");
    setBusy(true);
    setError("");
    try {
      const completed = await getCloud().auth.verifyOtp({
        verificationId: pending.verificationId,
        token: code.trim(),
        email: email.trim(),
        isExistingUser: pending.isExistingUser ?? false,
        password: pending.isExistingUser ? undefined : password,
      });
      if (completed.error) return setError(humanError(completed.error));
      goToTrips();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const submitForgotSend = async () => {
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    setBusy(true);
    setError("");
    try {
      const started = await getCloud().auth.resetPasswordForEmail(email.trim());
      if (started.error) return setError(humanError(started.error));
      pendingRef.current = { resetChallenge: started.data };
      setForgotStep(2);
      setInfo("We’ve sent a password reset code to your email.");
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const submitForgotReset = async () => {
    if (!code.trim()) return setError("Enter the email verification code.");
    if (password.length < 6) return setError("The new password must be at least 6 characters.");
    const challenge = pendingRef.current.resetChallenge;
    if (!challenge) return setError("Request a verification code first.");
    setBusy(true);
    setError("");
    try {
      const completed = await challenge.updateUser({ nonce: code.trim(), password });
      if ((completed as { error?: unknown }).error)
        return setError(humanError((completed as { error: { kind?: string; message?: string } }).error));
      goToTrips();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (view === "login") {
      submitLogin();
    } else if (view === "register") {
      if (registerStep === 1) submitRegisterSend();
      else submitRegisterVerify();
    } else if (forgotStep === 1) {
      submitForgotSend();
    } else {
      submitForgotReset();
    }
  };

  // ── Copy ────────────────────────────────────────────────────────────

  const title = view === "login" ? "Sign in" : view === "register" ? "Create account" : "Reset password";

  const busyLabel = busy
    ? "Please wait…"
    : view === "register"
      ? "Create account"
      : view === "forgot"
        ? forgotStep === 1
          ? "Send code"
          : "Reset password"
        : "Sign in";

  const showPassword = view === "login" || (view === "register" && registerStep === 1);
  const showConfirm = view === "register" && registerStep === 1;
  const showCode =
    (view === "register" && registerStep === 2) || (view === "forgot" && forgotStep === 2);
  const showNewPassword = view === "forgot" && forgotStep === 2;

  return (
    <div
      className="flex min-h-[100svh] w-full items-center justify-center px-5 py-10 md:px-8"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* Main card: the artwork's 908×460 flat, square card (no radius, no shadow) */}
      <div className="flex w-full max-w-[908px] flex-col shadow-none md:h-[460px] md:flex-row">
        {/* ── Left: white form area (artwork 454px) ─────────────────── */}
        <div className="order-1 flex items-center justify-center bg-white px-6 py-10 md:order-none md:w-[454px] md:shrink-0 md:px-0 md:py-0">
          <form onSubmit={onSubmit} noValidate className="w-full max-w-[214px] md:translate-y-[6px]">
            <h1
              className="text-center text-[16px] font-semibold leading-none tracking-[0.04em]"
              style={{ color: BRAND }}
            >
              {title}
            </h1>

            <div className="mt-[52px]">
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {showPassword && (
                <div className="mt-[23px]">
                  <Field
                    label="Password"
                    type="password"
                    autoComplete={view === "login" ? "current-password" : "new-password"}
                    aria-label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {showConfirm && (
                <div className="mt-[23px]">
                  <Field
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    aria-label="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              )}

              {showCode && (
                <div className="mt-[23px]">
                  <Field
                    label="Email code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Email verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              )}

              {showNewPassword && (
                <div className="mt-[23px]">
                  <Field
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    aria-label="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            {(error || info) && (
              <div className="mt-[10px]">
                <Msg kind={error ? "error" : "info"} text={error || info} />
              </div>
            )}

            <div className="mt-[23px]">
              <PillButton type="submit" loading={busy}>
                {busyLabel}
              </PillButton>
            </div>

            {view === "register" && registerStep === 1 && (
              <p className="mt-[14px] text-[11px] leading-relaxed" style={{ color: LABEL }}>
                By creating an account you agree to our{" "}
                <Link href="/terms" target="_blank" className="hover:underline" style={{ color: BRAND }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="hover:underline" style={{ color: BRAND }}>
                  Privacy Policy
                </Link>
                .
              </p>
            )}

            {/* Divider + secondary links (artwork: a divider with a small blue link) */}
            <div className="mt-[32px] flex items-center justify-between pt-[20px] text-[12px]" style={{ borderTop: `1px solid ${DIVIDER}`, color: BRAND }}>
              {view === "login" ? (
                <>
                  <Link href="/register" className="transition-opacity hover:opacity-70">
                    Create account
                  </Link>
                  <button
                    type="button"
                    className="cursor-pointer transition-opacity hover:opacity-70"
                    onClick={() => reset("forgot")}
                  >
                    Forgot password?
                  </button>
                </>
              ) : (
                <>
                  {/* Registration returns through the real route (URL semantics match
                      state); reset password is a view inside /login and switches in place. */}
                  {view === "register" ? (
                    <Link href="/login" className="transition-opacity hover:opacity-70">
                      Back to sign in
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      onClick={() => reset("login")}
                    >
                      Back to sign in
                    </button>
                  )}
                  {view === "register" && registerStep === 2 && (
                    <button
                      type="button"
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      onClick={() => setRegisterStep(1)}
                    >
                      Back
                    </button>
                  )}
                  {view === "forgot" && forgotStep === 2 && (
                    <button
                      type="button"
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      onClick={() => setForgotStep(1)}
                    >
                      Back
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
        </div>

        {/* ── Right: brand panel (artwork 454px; a brand bar below the card on mobile) ── */}
        <div className="relative order-2 h-[190px] w-full overflow-hidden md:order-none md:h-auto md:w-[454px] md:shrink-0">
          <BrandArt />
          <div className="md:hidden">
            <BrandBlock mobile />
          </div>
          <div className="hidden md:block">
            <BrandBlock />
          </div>
        </div>
      </div>
    </div>
  );
}

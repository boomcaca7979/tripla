"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthField from "./AuthField";
import PasswordField from "./PasswordField";
import GoogleIcon from "./GoogleIcon";
import { LoginSchema, type LoginInput } from "@/lib/validators/auth";
import { signIn } from "@/lib/auth";

// ── Field error map ───────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

// ── Component ─────────────────────────────────────────────────────────

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = LoginSchema.safeParse({ email, password, remember });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setAuthError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      window.location.href = "/";
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    // eslint-disable-next-line no-console
    console.log("Google auth");
  };

  return (
    <div className="flex flex-col gap-7">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Sign in to continue planning your trips
        </p>
      </header>

      {/* ── Form ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
        aria-label="Sign in form"
      >
        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {authError && (
          <p className="text-sm text-red-600">{authError}</p>
        )}

        {/* ── Remember + forgot ──────────────────────────── */}
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-gray-500 transition-colors hover:text-blue-600"
          >
            Forgot password?
          </Link>
        </div>

        {/* ── Submit button ──────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            "Log In"
          )}
        </button>
      </form>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="relative flex items-center" aria-hidden="true">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="px-3 text-xs uppercase tracking-wider text-gray-400">
          or
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* ── Google button ────────────────────────────────── */}
      <button
        type="button"
        onClick={handleGoogle}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
      >
        <GoogleIcon className="h-5 w-5" />
        Log in with Google
      </button>

      {/* ── Footer link ──────────────────────────────────── */}
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

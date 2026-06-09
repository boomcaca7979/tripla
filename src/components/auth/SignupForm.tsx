"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthField from "./AuthField";
import PasswordField from "./PasswordField";
import PasswordStrength from "./PasswordStrength";
import GoogleIcon from "./GoogleIcon";
import { SignupSchema, type SignupInput } from "@/lib/validators/auth";
import { signUp } from "@/lib/auth";

// ── Field error map ───────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof SignupInput, string>>;

// ── Component ─────────────────────────────────────────────────────────

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = SignupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SignupInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setAuthError("");
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      setSignupSuccess(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Sign up failed");
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
          Start your journey
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Create an account to save and share your itineraries
        </p>
      </header>

      {signupSuccess ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-600">
            Account created! Please check your email to confirm, then{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              log in
            </Link>
            .
          </p>
        </div>
      ) : (
      <>
      {/* ── Form ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
        aria-label="Sign up form"
      >
        <AuthField
          label="Full Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

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

        <div>
          <PasswordField
            label="Password"
            name="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordStrength value={password} />
        </div>

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        {authError && (
          <p className="text-sm text-red-600">{authError}</p>
        )}

        {/* ── Submit button ──────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
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
            "Sign Up"
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </Link>
          .
        </p>
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
        Sign up with Google
      </button>

      {/* ── Footer link ──────────────────────────────────── */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Log In
        </Link>
      </p>
      </>
      )}
    </div>
  );
}

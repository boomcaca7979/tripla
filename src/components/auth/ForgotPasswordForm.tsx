"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthField from "./AuthField";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — email send logic will be wired up later
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Check your email
          </h1>
          <p className="text-sm text-gray-500 sm:text-base">
            If an account exists for <span className="font-medium text-gray-700">{email}</span>, you will receive a password reset link shortly.
          </p>
        </header>
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
        aria-label="Forgot password form"
      >
        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          Send Reset Link
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}

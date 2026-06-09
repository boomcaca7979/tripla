"use client";

import { useId, type InputHTMLAttributes, forwardRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────

interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────
//
// Pill-shaped, large rounded text field used across the auth screens.
// Focus ring is a subtle blue (matching tripla's primary accent).

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  (
    { label, error, suffix, className = "", id: externalId, ...rest },
    ref,
  ) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-800"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={[
              "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400",
              "transition-all duration-150",
              "focus:outline-none focus:ring-4",
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-100",
              suffix ? "pr-11" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1 text-xs text-red-600"
          >
            <svg
              className="h-3 w-3 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";
export default AuthField;

"use client";

import { useId, useState, forwardRef } from "react";
import AuthField from "./AuthField";

// ── Component ─────────────────────────────────────────────────────────
//
// Password input with a show/hide toggle (eye / eye-off icon) and the
// same large-pill styling as AuthField. Forwarded ref so parents can
// call .focus() or read the value via the underlying <input>.

const PasswordField = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "prefix"> & {
    label: string;
    error?: string;
  }
>(({ label, error, className = "", ...rest }, ref) => {
  const [show, setShow] = useState(false);
  const autoId = useId();

  return (
    <AuthField
      ref={ref}
      id={autoId}
      type={show ? "text" : "password"}
      label={label}
      error={error}
      className={className}
      autoComplete={rest.autoComplete ?? "current-password"}
      suffix={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus:text-gray-700"
        >
          {show ? (
            // Eye-off
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      }
      {...rest}
    />
  );
});

PasswordField.displayName = "PasswordField";
export default PasswordField;

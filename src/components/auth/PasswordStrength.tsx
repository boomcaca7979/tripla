"use client";

import { evaluatePasswordStrength } from "@/lib/validators/auth";

// ── Component ─────────────────────────────────────────────────────────
//
// Four-segment strength meter (red → amber → green) shown beneath the
// password field on /signup. Score and label are derived from length
// and the variety of character classes used.

interface PasswordStrengthProps {
  value: string;
}

const SEGMENT_COLORS = {
  empty: "bg-gray-200",
  weak: "bg-red-500",
  medium: "bg-amber-400",
  strong: "bg-emerald-500",
} as const;

const LABEL_TEXT = {
  empty: "",
  weak: "Too weak",
  medium: "Could be stronger",
  strong: "Strong password",
} as const;

const LABEL_COLOR = {
  empty: "text-gray-400",
  weak: "text-red-600",
  medium: "text-amber-600",
  strong: "text-emerald-600",
} as const;

export default function PasswordStrength({ value }: PasswordStrengthProps) {
  const { score, label } = evaluatePasswordStrength(value);
  const filledColor = SEGMENT_COLORS[label];

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-colors duration-200",
              i < score ? filledColor : "bg-gray-200",
            ].join(" ")}
          />
        ))}
      </div>
      <p
        className={[
          "text-xs",
          LABEL_COLOR[label],
          // Reserve a constant line-height to avoid layout jump.
          "min-h-[1rem]",
        ].join(" ")}
      >
        {LABEL_TEXT[label] || "Use 8+ characters with letters and numbers."}
      </p>
    </div>
  );
}

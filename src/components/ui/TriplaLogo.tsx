"use client";

import { useId } from "react";

interface TriplaLogoProps {
  variant?: "icon" | "horizontal";
  className?: string;
  iconClassName?: string;
}

export default function TriplaLogo({
  variant = "horizontal",
  className,
  iconClassName,
}: TriplaLogoProps) {
  const id = useId();
  const grad = `${id}g`;

  return (
    <span
      className={["flex items-center gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        viewBox="0 0 32 32"
        className={iconClassName ?? "h-8 w-8"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={grad}
            x1="2"
            y1="4"
            x2="28"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Speech bubble (behind airplane) */}
        <rect
          x="2"
          y="15"
          width="16"
          height="11"
          rx="3"
          fill={`url(#${grad})`}
          opacity="0.25"
        />
        <path
          d="M7 26L5 30L9 26Z"
          fill={`url(#${grad})`}
          opacity="0.25"
        />

        {/* Paper airplane – upper wing (lighter) */}
        <path d="M26 4L4 14L12 16L26 4Z" fill="#38bdf8" />

        {/* Paper airplane – lower wing (gradient) */}
        <path d="M26 4L12 16L9 28L26 4Z" fill={`url(#${grad})`} />

        {/* Orange accent dot */}
        <circle cx="5" cy="30" r="1.5" fill="#f97316" />
      </svg>

      {variant === "horizontal" && (
        <span className="text-lg font-bold tracking-tight text-gray-900">
          tripla
        </span>
      )}
    </span>
  );
}

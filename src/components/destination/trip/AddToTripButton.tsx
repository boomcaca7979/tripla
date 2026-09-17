"use client";

import { useMyTrip } from "./MyTripContext";
import type { TripItemPrice } from "@/lib/trip-list";

/**
 * AddToTripButton — 景点 / 酒店 / 美食 / 可预订体验统一加入清单按钮。
 * 点击即加入，再次点击取消（✓ Added 态），实时同步右侧 My Trip。
 * price 仅在 provider 返回真实价格时传入（如 Viator fromPrice）；
 * 无真实价格绝不传值 → 清单中显示 Price unavailable，不计入预算。
 */
export default function AddToTripButton({
  type,
  name,
  affiliateUrl,
  price,
  variant = "primary",
}: {
  type: "attraction" | "hotel" | "food" | "experience" | "flight";
  name: string;
  affiliateUrl?: string;
  /** provider 真实价格；无则缺省。 */
  price?: TripItemPrice;
  /** primary = 描边大按钮；compact = 行内小按钮（酒店档位/美食行）。 */
  variant?: "primary" | "compact";
}) {
  const { has, toggle, city, hydrated } = useMyTrip();
  const added = hydrated && has(type, name);

  const base =
    variant === "primary"
      ? "inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border px-5 py-2.5 text-body font-medium transition-colors duration-[var(--ut-dur-fast)] focus-visible:outline-2 focus-visible:outline-ut-accent"
      : "inline-flex min-h-[34px] items-center gap-1.5 rounded-ut-sm border px-3 py-1.5 text-label transition-colors duration-[var(--ut-dur-fast)] focus-visible:outline-2 focus-visible:outline-ut-accent";

  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={() => toggle({ type, name, city, affiliateUrl, price })}
      className={`${base} ${
        added
          ? "border-ut-accent bg-ut-accent text-white"
          : "border-ut-border-strong text-ut-text hover:bg-ut-surface-hover"
      }`}
    >
      {added ? (
        <>
          <span aria-hidden="true">✓</span> Added
        </>
      ) : (
        <>
          <span aria-hidden="true">+</span> Add to My Trip
        </>
      )}
    </button>
  );
}

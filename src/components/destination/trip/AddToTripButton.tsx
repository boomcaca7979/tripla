"use client";

import { useState, type CSSProperties } from "react";
import { useMyTrip } from "./MyTripContext";
import type { TripItemPrice } from "@/lib/trip-list";
import { resolvePageMode, savePageItem } from "@/lib/travel-workspace";

/**
 * AddToTripButton — 景点 / 酒店 / 美食 / 可预订体验统一加入清单按钮。
 * 点击即加入，再次点击取消（✓ Added 态），实时同步右侧 My Trip。
 * price 仅在 provider 返回真实价格时传入（如 Viator fromPrice）；
 * 无真实价格绝不传值 → 清单中显示 Price unavailable，不计入预算。
 *
 * 另有一个**次要**副作用（蓝图 #9）：加入页面清单时把该对象收藏到 /trips 的 Saved。
 * 主动作（My Trip 切换）是纯本地的、必定成功；次要写入失败时只在此按钮上做
 * 可见标记并说明，绝不静默，也不把主动作回滚 —— 两者是不同通道，不该互相绑死。
 */

/** kind 映射：attraction→place / hotel→hotel / food→restaurant / experience→activity。 */
const KIND_MAP = {
  attraction: "place",
  hotel: "hotel",
  food: "restaurant",
  experience: "activity",
  flight: "activity",
} as const;

/** 仅屏幕阅读器可见：把同步失败讲清楚，而不改变按钮的可视布局。 */
const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

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
  const [syncFailed, setSyncFailed] = useState(false);

  // 身份在动作发生时才解析（这些按钮一页可能挂载几十个，不该各自持订阅）。
  const syncToWorkspace = async () => {
    const mode = await resolvePageMode();
    if (!mode) {
      setSyncFailed(true);
      return;
    }
    const res = await savePageItem(mode, {
      kind: KIND_MAP[type],
      title: name,
      meta: city,
      source: `Destination · ${city}`,
    });
    setSyncFailed(!res.ok);
  };

  const base =
    variant === "primary"
      ? "inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm border px-5 py-2.5 text-body font-medium transition-colors duration-[var(--ut-dur-fast)] focus-visible:outline-2 focus-visible:outline-ut-accent"
      : "inline-flex min-h-[34px] items-center gap-1.5 rounded-ut-sm border px-3 py-1.5 text-label transition-colors duration-[var(--ut-dur-fast)] focus-visible:outline-2 focus-visible:outline-ut-accent";

  return (
    <button
      type="button"
      aria-pressed={added}
      title={syncFailed ? "Saved to My Trip, but not to your account — reopen the page to retry." : undefined}
      onClick={() => {
        toggle({ type, name, city, affiliateUrl, price });
        if (!added) void syncToWorkspace();
      }}
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
      {syncFailed && (
        <span aria-hidden="true" className="text-[0.9em] leading-none">
          ⚠
        </span>
      )}
      <span style={SR_ONLY} role="status">
        {syncFailed ? "Couldn't save this to your account. It is still in My Trip." : ""}
      </span>
    </button>
  );
}

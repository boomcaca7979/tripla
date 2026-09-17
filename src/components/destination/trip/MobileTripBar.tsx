"use client";

import { useEffect, useState } from "react";
import MyTripPanel, { type MyTripPanelProps } from "./MyTripPanel";
import { useMyTrip } from "./MyTripContext";

/**
 * MobileTripBar — 390px 等移动端的常驻底部清单条 + Bottom Sheet。
 * 桌面端（lg+）不渲染。条体不遮挡内容主体（页面底部预留 padding）。
 */
export default function MobileTripBar(props: MyTripPanelProps) {
  const { items, hydrated } = useMyTrip();
  const [open, setOpen] = useState(false);
  const count = items.length;
  // 价格诚信：底部条只显示条目数与真实价格合计（无真实价 → 不显示任何金额）
  const pricedTotal = items.reduce(
    (sum, i) => sum + (typeof i.price?.amount === "number" && i.price.amount > 0 ? i.price.amount : 0),
    0,
  );
  const totalCurrency = items.find((i) => i.price)?.price?.currency ?? "CNY";
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // sheet 打开时锁 body 滚动
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (scrollY < 120) return null; // 首屏不压 Hero

  return (
    <>
      {/* 底部常驻条 */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-3 border-t border-ut-border bg-ut-surface px-4 py-3 text-left shadow-[0_-8px_24px_rgba(5,8,14,0.25)]"
        >
          <span className="text-label font-medium text-ut-text">
            My Trip · {hydrated ? count : 0} {hydrated && count === 1 ? "item" : "items"}
            {hydrated && pricedTotal > 0 && (
              <span className="ml-2 text-ut-text-2">
                known {totalCurrency} {pricedTotal.toLocaleString()}
              </span>
            )}
          </span>
          <span className="rounded-ut-sm bg-ut-accent px-3 py-1.5 text-label font-medium text-white">
            View Trip
          </span>
        </button>
      </div>

      {/* Bottom Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="My Trip">
          <button
            type="button"
            aria-label="Close trip panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[1.25rem] border-t border-ut-border bg-ut-bg pb-6 shadow-[0_-16px_48px_rgba(5,8,14,0.45)]">
            <div className="sticky top-0 flex justify-center bg-ut-bg py-2">
              <span aria-hidden="true" className="h-1.5 w-12 rounded-full bg-ut-border-strong" />
            </div>
            <MyTripPanel {...props} />
            <div className="px-5 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] w-full rounded-ut-sm border border-ut-border-strong text-body text-ut-text"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

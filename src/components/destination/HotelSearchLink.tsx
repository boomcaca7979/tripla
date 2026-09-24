"use client";

import { useEffect, useState, type ReactNode } from "react";
import AffiliateLink from "@/components/analytics/AffiliateLink";

/**
 * HotelSearchLink — HotelModule 的链接叶子（client）。
 *
 * 为什么需要它：入住窗口若只在**构建期**求值，就会被静态 HTML 永久冻结 ——
 * 部署后每一页都停在构建那天的日期，用户点到的永远是"昨天入住"。这里在挂载
 * 后按**客户端时钟**重算 checkIn/checkOut，因此无论 HTML 缓存多久，用户实际
 * 点开的链接恒为"今天起"。
 *
 * 归因安全：只对服务端已生成的 URL 覆写 checkIn / checkOut 两个查询参数，
 * 其余参数（尤其 affiliate marker）原样保留 —— 绝不重建 URL。
 *
 * hydration 安全：初始 state = 服务端 href，首帧与 SSR HTML 完全一致（无
 * mismatch）；日期只存在于 URL 中、界面上不可见，因此刷新时无闪变。
 */

/** 本地时区的 YYYY-MM-DD —— 用户视角的"今天"，而非 UTC 意义上的今天。 */
function localISODate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 把 href 的入住窗口刷新为「今天 → 今天+N 晚」。
 * 保证 checkIn >= 今天 且 checkOut > checkIn（N 至少 1）。
 */
export function refreshStayWindow(href: string, nights: number): string {
  try {
    const url = new URL(href);
    url.searchParams.set("checkIn", localISODate(0));
    url.searchParams.set("checkOut", localISODate(Math.max(1, nights)));
    return url.toString();
  } catch {
    return href;
  }
}

interface HotelSearchLinkProps {
  /** 服务端生成的链接（含 affiliate marker）。 */
  href: string;
  /** 住宿晚数（与页面 "Suggested city stay" 语义一致）。 */
  nights: number;
  /** 目的地城市（affiliate_click 事件属性）。 */
  destination?: string;
  className?: string;
  children: ReactNode;
}

export default function HotelSearchLink({
  href,
  nights,
  destination,
  className,
  children,
}: HotelSearchLinkProps) {
  const [resolvedHref, setResolvedHref] = useState(href);

  useEffect(() => {
    // 不在 effect 体内同步 setState（react-hooks/set-state-in-effect：会触发级联
    // 渲染）。推迟到微任务执行，仍是"挂载后立刻用本地时钟覆写"，且发生在首帧
    // 绘制之前 —— 行为与原来一致，链接恒为"今天起"。
    let alive = true;
    queueMicrotask(() => {
      if (alive) setResolvedHref(refreshStayWindow(href, nights));
    });
    return () => {
      alive = false;
    };
  }, [href, nights]);

  return (
    <AffiliateLink
      href={resolvedHref}
      category="hotel"
      provider="hotellook"
      destination={destination ?? ""}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={className}
    >
      {children}
    </AffiliateLink>
  );
}

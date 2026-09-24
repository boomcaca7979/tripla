"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackEvent, currentPagePath } from "@/lib/analytics";

/**
 * AffiliateLink — 所有 affiliate / booking **出站链接**的统一 tracked 原语。
 *
 * 在导航发生前同步触发 `affiliate_click`（@vercel/analytics 使用
 * sendBeacon/keepalive 发送，导航不会丢事件）。纯转发 <a> 的全部属性，
 * 不改变任何视觉与行为（target / rel / className 原样透传）。
 */
export default function AffiliateLink({
  category,
  provider,
  destination,
  identifier,
  onClick,
  children,
  ...rest
}: ComponentPropsWithoutRef<"a"> & {
  category: "flight" | "hotel" | "experience";
  provider: string;
  destination: string;
  identifier?: string;
}) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent({
          name: "affiliate_click",
          category,
          provider,
          destination,
          identifier,
          source_page: currentPagePath(),
        });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

"use client";

/**
 * analytics — Tripla 的**唯一**客户端测量封装。
 *
 * 设计约束（2026-09-24 measurement 架构）：
 *   · Provider = Vercel Web Analytics（@vercel/analytics）。cookie-less、无用户
 *     标识、随 Vercel 部署自动生效，无需 tracking ID。
 *   · Page view 由根布局的 <Analytics /> 自动记录（含 SPA client navigation，
 *     不会因 React Strict Mode / hydration 重复上报）——不要手工发 pageview。
 *   · 本文件是唯一直接调用 track() 的地方；组件只调 trackEvent()。
 *   · SSR 安全：window 不存在时静默跳过；任何 analytics 异常都被吞掉，
 *     绝不影响用户流程，也绝不产生 console error。
 *   · 隐私：只发送事件名 + 白名单属性（目的地、provider、页面路径、计数、
 *     布尔态）。禁止 email / password / token / 支付数据 / 完整 URL。
 *   · 环境：development 下 @vercel/analytics 不发送、只 console 记录，因此
 *     本地开发不会污染生产数据。
 */

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | { name: "destination_view"; destination: string; country: string; source_page: string }
  | { name: "atlas_destination_select"; destination: string; source: string }
  | { name: "destination_compare_add"; destination: string; compare_count: number }
  | { name: "destination_compare_remove"; destination: string; compare_count: number }
  | { name: "guide_destination_click"; destination: string; region: string }
  | { name: "trip_create"; authenticated: boolean; source: string }
  | { name: "trip_add_place"; destination: string; source: string }
  | { name: "trip_remove_place"; destination: string }
  | {
      name: "affiliate_click";
      category: "flight" | "hotel" | "experience";
      provider: string;
      destination: string;
      source_page: string;
      identifier?: string;
    }
  | { name: "signin_start"; method: string; source_page: string }
  | { name: "signup_start"; method: string; source_page: string }
  | { name: "signup_success"; method: string; source_page: string }
  | { name: "signin_success"; method: string; source_page: string }
  | { name: "signout"; source_page: string };

/** 当前页面路径（无 window / 读取失败时返回空串，绝不抛错）。 */
export function currentPagePath(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.location.pathname || "/";
  } catch {
    return "";
  }
}

/**
 * destination_view 的来源页解析：
 *   · 同站 referrer → 其 pathname（如 "/destinations"、"//"）
 *   · 无 referrer → "direct"
 *   · 外站 referrer → "external"
 */
export function referrerSourcePage(): string {
  if (typeof window === "undefined") return "direct";
  try {
    const ref = document.referrer;
    if (!ref) return "direct";
    const url = new URL(ref);
    if (url.origin !== window.location.origin) return "external";
    return url.pathname || "/";
  } catch {
    return "direct";
  }
}

/** 唯一的上报入口：失败静默，绝不抛错、绝不 console.error。 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const { name, ...properties } = event;
    track(name, properties);
  } catch {
    // Analytics failure must never break the user flow.
  }
}

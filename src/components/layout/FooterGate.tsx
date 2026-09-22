"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/**
 * FooterGate — 按路由决定是否渲染站点 Footer。
 *
 * 豁免：
 *  - /destinations/[slug]（Destination 城市详情页）不显示 Footer；
 *  - /login、/register（认证页）为设计稿 1:1 的整页构图，站点 Footer 属页外
 *    chrome，同样不渲染。
 * 其余所有页面行为与直接渲染 <Footer /> 完全一致。SSR 期间 usePathname 即可用，
 * 无 hydration 闪烁；Footer 组件本身未改动。
 */
const AUTH_ROUTE = /^\/(login|register)\/?$/;

export default function FooterGate() {
  const pathname = usePathname();
  if (AUTH_ROUTE.test(pathname)) return null;
  if (/^\/destinations\/[^/]+$/.test(pathname)) return null;
  return <Footer />;
}

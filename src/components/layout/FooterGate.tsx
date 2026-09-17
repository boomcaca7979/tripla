"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/**
 * FooterGate — 按路由决定是否渲染站点 Footer。
 *
 * 当前唯一豁免：/destinations/[slug]（Destination 城市详情页）不显示 Footer。
 * 其余所有页面（含 /destinations hub）行为与直接渲染 <Footer /> 完全一致。
 * SSR 期间 usePathname 即可用，无 hydration 闪烁；Footer 组件本身未改动。
 */
export default function FooterGate() {
  const pathname = usePathname();
  if (/^\/destinations\/[^/]+$/.test(pathname)) return null;
  return <Footer />;
}

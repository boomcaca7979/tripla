"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

/**
 * HeaderGate — 按路由决定是否渲染站点 Header（与 FooterGate 同一模式）。
 *
 * 豁免：/login、/register —— 认证页是设计稿 1:1 的**整页**构图（整页浅蓝底 +
 * 居中卡片），站点 Header 会给它压上一条页外 chrome 并带出页外 Logo，
 * 与设计稿不符。
 *
 * 同时承担原 PageWrapper 上 `pt-16` 的职责：Header 是 fixed 定位，
 * 需要等高的占位块把内容顶下来。非豁免路由下渲染出的占位块与原先
 * `main` 的 `pt-16` 完全等价（同为 64px、同样阻断外边距折叠），
 * 其余页面布局零变化。
 */
const AUTH_ROUTE = /^\/(login|register)\/?$/;

export default function HeaderGate() {
  const pathname = usePathname();
  if (AUTH_ROUTE.test(pathname)) return null;
  return (
    <>
      <Header />
      <div className="h-16" aria-hidden="true" />
    </>
  );
}

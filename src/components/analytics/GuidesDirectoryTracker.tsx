"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * GuidesDirectoryTracker — /guides 目录的 `guide_destination_click` 事件岛。
 *
 * /guides 的 Region → Country → City 目录是 server 渲染的普通链接（205 城），
 * 这里用**事件委托**在文档级监听点击（只匹配本页的目的地链接），region 取自
 * 目录分组的 aria-label（"{Region} destinations"）——不改动 server 目录标记，
 * 也不给 205 个链接各挂一个 client 组件。
 */
export default function GuidesDirectoryTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor =
        e.target instanceof Element
          ? e.target.closest('a[href^="/destinations/"]')
          : null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const destination = href.split("/destinations/")[1]?.replace(/\/+$/, "");
      if (!destination) return;
      const regionSection = anchor.closest('[aria-label$=" destinations"]');
      const region =
        regionSection
          ?.getAttribute("aria-label")
          ?.replace(/ destinations$/, "") ?? "";
      trackEvent({ name: "guide_destination_click", destination, region });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}

/**
 * WorkBuddy Cloud Service 客户端（全站唯一实例）。
 *
 * 两个值都来自 `workbuddy_cloud_service` 返回的 publicConfig（经 .env.local /
 * Vercel 环境变量注入）：publishableKey 设计上就是公开的（服务端按 Origin 校验），
 * endpoint 是本应用的数据面地址。两者缺一不可，缺失时在首次调用时抛出明确错误，
 * 绝不回退到 window.location 或猜测值。
 */

import { createWorkBuddyCloud } from "@tencent-ai/workbuddy-cloud-sdk";

const endpoint = process.env.NEXT_PUBLIC_WBCLOUD_ENDPOINT;
const publishableKey = process.env.NEXT_PUBLIC_WBCLOUD_PUBLISHABLE_KEY;

/**
 * 构建期常量（NEXT_PUBLIC_* 会被内联）。
 *
 * 只「读取」会话状态的界面（Header 账号位、/trips、登录页的已登录跳转探针）
 * 必须先判断它再调用 `getCloud()`：这样在未注入云配置的环境里会退化为
 * 「未登录」，而不是在 render/effect 中同步抛错——后者会被路由级错误边界
 * 捕获，把整个页面替换成错误页（生产环境曾因此白屏）。
 */
export const CLOUD_CONFIGURED = Boolean(endpoint && publishableKey);

let cached: ReturnType<typeof createWorkBuddyCloud> | null = null;

/** 客户端专用；懒初始化，全部模块（auth 等）共享同一实例。 */
export function getCloud() {
  if (!endpoint || !publishableKey) {
    throw new Error(
      "Cloud service is not configured: set NEXT_PUBLIC_WBCLOUD_ENDPOINT and NEXT_PUBLIC_WBCLOUD_PUBLISHABLE_KEY.",
    );
  }
  if (!cached) {
    cached = createWorkBuddyCloud({ endpoint, publishableKey });
  }
  return cached;
}

// 诊断用途（仅 dev 编译产物可见）：浏览器控制台可直接检查原始 SDK 响应
declare global {
  interface Window {
    __wbcloud?: ReturnType<typeof createWorkBuddyCloud>;
  }
}
if (process.env.NODE_ENV !== "production") {
  if (typeof window !== "undefined") {
    try {
      window.__wbcloud = getCloud();
    } catch {
      // env 未配置时不阻塞页面
    }
  }
}

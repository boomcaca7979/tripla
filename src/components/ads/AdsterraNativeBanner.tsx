"use client";

import { useEffect } from "react";

/**
 * AdsterraNativeBanner — 全站唯一广告载体（Native Banner，已核验发布代码）。
 *
 * 边界：
 *   · 只在该组件被放置的页面加载 invoke.js（SSR/SSG 零请求）；
 *   · 客户端路由切换时不重复注入：注入前先清掉本组件此前 append 的脚本；
 *   · 广告未填充时不占版面高度——容器自适应 Native Banner 输出，外围不加
 *     固定 min-height，避免空投时出现大空白；
 *   · 不在此处伪造任何广告结果。
 */

const INVOKE_SRC =
  "https://pl31545132.profitableratecpmnetwork.com/72ce12887718598c7ea4d03ad5c48f37/invoke.js";
const CONTAINER_ID = "container-72ce12887718598c7ea4d03ad5c48f37";

export default function AdsterraNativeBanner() {
  useEffect(() => {
    // 同一页面可能因路由切换重复挂载；invoke.js 全局只保持一份。
    const prev = document.querySelectorAll<HTMLScriptElement>(
      `script[data-adsterra-invoke="${CONTAINER_ID}"]`,
    );
    prev.forEach((s) => s.remove());

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-adsterra-invoke", CONTAINER_ID);
    script.src = INVOKE_SRC;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="my-10 overflow-hidden" data-adsterra-native>
      <div id={CONTAINER_ID} />
    </div>
  );
}

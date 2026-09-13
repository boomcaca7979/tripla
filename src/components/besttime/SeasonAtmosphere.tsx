import type { CSSProperties, ReactNode } from "react";
import { seasonTint } from "./besttime-state";
import type { Season } from "@/lib/visual-state";

/**
 * SeasonAtmosphere — Best-time 的 "Climate / Season Band" 变量层。
 *
 * CONTRACT：
 *   §10  Environment Depth = 2，Environment 类型 = **Climate / Season**。
 *        只提供氛围层变量；**没有**天空 / 月亮 / 天气控制条 / 全屏环境 / 重动画。
 *   §11  状态只改变外观与含义，绝不改变结构、顺序或内容可见性。
 *   §26/§40 全页 CTA 与交互 accent 恒为品牌 terracotta，因此本组件**绝不写**
 *        --ut-accent / --ut-accent-rgb；季节只拥有私有变量族 --ut-season-*。
 *   §31/§40 首帧确定性：色调由**真实数据**（真实最佳窗口的主导季节）派生，
 *        是纯函数 → SSR 与客户端完全一致 → 无需 client component，零 hydration 风险。
 *
 * 变量（供 server 渲染的 band 以 var() 消费）：
 *   --ut-season-rgb   季节色（低饱和自然色系，仅用于 hairline / 节点 / 极低 alpha 渐变）
 *   --ut-season-glow  氛围强度（0–1）
 */
export default function SeasonAtmosphere({
  season,
  children,
}: {
  season: Season | null;
  children: ReactNode;
}) {
  const vars = {
    "--ut-season-rgb": seasonTint(season),
    "--ut-season-glow": "0.18",
  } as CSSProperties;

  return (
    <div style={vars} data-ut-season="">
      {children}
    </div>
  );
}

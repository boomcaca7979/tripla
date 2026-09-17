import type { MonthNormal } from "@/lib/inner-state";

/**
 * PlaceDataPortrait — 无图目的地 Hero 的"数据肖像"（Destination 3.0）。
 *
 * 不是模拟照片，而是把该地一年 12 个月的真实气候数据（NASA canonical
 * normals：tempHigh/tempLow/precip/daylight）渲染成一个确定性视觉主体：
 *   · 温度带   = 高低温之间的 accent 色 area（全年轨迹剪影）
 *   · 降水柱   = 底部 12 根白色柱（雨季密度）
 *   · 日照线   = 虚线（白昼长度季节摆动）
 *   · 月份刻度 = J F M A M J J A S O N D
 *
 * 纯 SVG（~30 DOM 节点），无 JS、无动画库、无图片请求；置于 PlaceWorld 的
 * 光照滤镜层内 —— 拖动时间时和照片一样被"此刻光线"处理。每个城市的曲线
 * 形状由其真实数据唯一决定：这是它的数据肖像，不是通用渐变。
 */

const W = 1440;
const H = 810;
const MONTHS = "JFMAMJJASOND";

export default function PlaceDataPortrait({ normals }: { normals: MonthNormal[] }) {
  if (!normals || normals.length !== 12) {
    // 数据缺失时的诚实回退：保留原有 accent 渐变（与既有视觉一致）。
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.3), rgba(12, 15, 22, 1) 90%)",
        }}
      />
    );
  }

  const x = (i: number) => 70 + (i * (W - 140)) / 11;
  // 温度：-5…40°C → y 640…170（越高越暖）
  const tempY = (t: number) => 640 - ((Math.min(40, Math.max(-5, t)) + 5) / 45) * 470;
  // 日照：8…16h → y 600…300
  const dayY = (h: number) => 600 - ((Math.min(16, Math.max(8, h)) - 8) / 8) * 300;
  const maxRain = Math.max(60, ...normals.map((n) => n.precipMm));
  const rainH = (mm: number) => Math.max(4, (mm / maxRain) * 230);

  const highPts = normals.map((n, i) => `${x(i).toFixed(1)},${tempY(n.tempHighC).toFixed(1)}`);
  const lowPts = normals.map((n, i) => `${x(i).toFixed(1)},${tempY(n.tempLowC).toFixed(1)}`);
  const band = `${highPts.join(" ")} ${[...lowPts].reverse().join(" ")}`;
  const dayLine = normals.map((n, i) => `${x(i).toFixed(1)},${dayY(n.daylightHours).toFixed(1)}`).join(" ");

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      data-ut-place-portrait=""
    >
      {/* 全年温度带（低 → 高的轨迹剪影） */}
      <polygon points={band} fill="rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.26)" />
      <polyline
        points={highPts.join(" ")}
        fill="none"
        stroke="rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.7)"
        strokeWidth="2.5"
      />
      <polyline
        points={lowPts.join(" ")}
        fill="none"
        stroke="rgba(var(--ut-place-accent-rgb, 180, 95, 77), 0.42)"
        strokeWidth="1.5"
      />
      {/* 月降水柱 */}
      {normals.map((n, i) => {
        const h = rainH(n.precipMm);
        return (
          <rect
            key={`r-${i}`}
            x={(x(i) - 7).toFixed(1)}
            y={(760 - h).toFixed(1)}
            width="14"
            height={h.toFixed(1)}
            fill="rgba(255,255,255,0.10)"
          />
        );
      })}
      {/* 日照摆动（虚线） */}
      <polyline
        points={dayLine}
        fill="none"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1.5"
        strokeDasharray="3 7"
      />
      {/* 基线 + 月份刻度 */}
      <line x1="40" y1="762" x2={W - 40} y2="762" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      {normals.map((_, i) => (
        <text
          key={`m-${i}`}
          x={x(i).toFixed(1)}
          y="798"
          textAnchor="middle"
          fontSize="17"
          letterSpacing="2"
          fill="rgba(255,255,255,0.42)"
        >
          {MONTHS[i]}
        </text>
      ))}
    </svg>
  );
}

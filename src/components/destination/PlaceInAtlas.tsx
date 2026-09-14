"use client";

import Link from "next/link";

/**
 * PlaceInAtlas — Destination 3.0 STEP 3 "THE ATLAS"（轻量 mini atlas）。
 *
 * 复用 World Atlas 的投影（projectWorldPoint）与节点语言——不是第二套地图系统。
 * 展示：该目的地在全球 145 节点中的位置（accent 环）+ 3 个真实距离最近节点
 * （白点）+ 其余节点（退隐）。唯一动作：OPEN WORLD ATLAS。
 *
 * 数据诚信：节点位置全部来自真实坐标投影；"nearest" 为真实 Haversine 距离。
 */

export interface MiniNode {
  slug: string;
  city: string;
  x: number;
  y: number;
  /** 真实 Haversine 距离（km，server 计算） */
  km: number;
}

export default function PlaceInAtlas({
  city,
  nodes,
  nearest,
}: {
  city: string;
  /** 145 个节点（server 预投影） */
  nodes: { slug: string; city: string; x: number; y: number }[];
  /** 3 个真实最近目的地（server 端 Haversine 排序） */
  nearest: MiniNode[];
}) {
  const nearestSlugs = new Set(nearest.map((n) => n.slug));

  return (
    <div data-ut-placeinatlas="">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-ut-md border border-white/10 bg-[#070a12]">
        {/* 经纬网 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(245,243,236,0.5) 0 1px, transparent 1px calc(100%/24)), repeating-linear-gradient(to bottom, rgba(245,243,236,0.5) 0 1px, transparent 1px calc(100%/12))",
          }}
        />
        {nodes.map((n) => {
          const isSelf = n.city === city;
          const isNear = nearestSlugs.has(n.slug);
          return (
            <span
              key={n.slug}
              aria-hidden="true"
              className={[
                "absolute rounded-full",
                isSelf
                  ? "h-3 w-3 border-2 border-ut-accent bg-white"
                  : isNear
                    ? "h-1.5 w-1.5 bg-white/90"
                    : "h-1 w-1 bg-white/25",
              ].join(" ")}
              style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
            />
          );
        })}
        {/* 当前城市标签（就近显示） */}
        <span
          className="pointer-events-none absolute font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white"
          style={{
            left: `${(nodes.find((n) => n.city === city)?.x ?? 0.5) * 100}%`,
            top: `calc(${(nodes.find((n) => n.city === city)?.y ?? 0.5) * 100}% + 10px)`,
            transform: "translateX(-50%)",
          }}
        >
          {city}
        </span>
      </div>

      {/* 真实最近节点（Haversine） */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-white/45">
          Nearest gateways
        </p>
        {nearest.map((n) => (
          <Link
            key={n.slug}
            href={`/destinations/${n.slug}`}
            className="min-h-[36px] font-mono text-label uppercase tracking-[0.14em] text-white/80 underline decoration-[rgba(245,243,236,0.3)] underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-white motion-reduce:transition-none"
          >
            {n.city} · {n.km} km
          </Link>
        ))}
      </div>

      <Link
        href="/destinations"
        className="mt-5 inline-flex min-h-[44px] items-center rounded-ut-pill border border-white/25 px-5 font-mono text-label uppercase tracking-[0.16em] text-white/90 transition-colors duration-[var(--ut-dur-fast)] hover:border-white/70 motion-reduce:transition-none"
      >
        Open world atlas →
      </Link>
    </div>
  );
}

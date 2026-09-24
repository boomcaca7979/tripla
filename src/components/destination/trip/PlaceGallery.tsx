"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * PlaceGallery — 桌面左大右小画廊（参考视觉：直角、无边框、图片即主角）。
 *
 * 结构（产品结构不变）：
 *   · 桌面 ≥768px：左侧主图约 70–75% 宽，右侧缩略图列均分主图高度。
 *   · 移动端（<768px）：主图全宽，缩略图在下方 3 列网格。
 *   · 点击缩略图与主图互换（active 态 = 主绿 #53A38A 描边）。
 *
 * 参考视觉语言（站酷「旅游官网」）：图片直角、无边框、无重装饰；
 * caption 仅保留极小的白色 mono 标注。
 *
 * 数据诚信：images 只来自真实数据（destination.image + 同城 trip 真实
 * coverImage，已去重）。不足时不伪造、不重复；一张图时退化为单图。
 */
export default function PlaceGallery({
  city,
  country,
  images,
}: {
  city: string;
  country: string;
  /** 真实图片数组（构建期由 page 去重生成，1–6 张）。 */
  images: string[];
}) {
  const [selected, setSelected] = useState(0);
  // 加载失败的图片（按 src 记录）：失败即以中性渐变占位，保留布局与缩略图选择态。
  const [failedSrcs, setFailedSrcs] = useState<ReadonlySet<string>>(new Set());
  const markFailed = (src: string) => {
    setFailedSrcs((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };
  const hasThumbs = images.length > 1;
  const main = images[Math.min(selected, images.length - 1)] ?? null;

  if (!main) return null;

  return (
    <div data-ut-gallery>
      {/* 桌面：左大 + 右小；移动端：纵向堆叠 */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,290px)] md:gap-3">
        {/* 主图（aspect 决定整个画廊总高度；右列 stretch 到同高） */}
        <figure className="relative aspect-[4/3] overflow-hidden bg-ut-surface sm:aspect-[16/10]">
          {failedSrcs.has(main) ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-ut-muted/25 to-ut-muted/45"
            />
          ) : (
            <Image
              src={main}
              alt={`${city}, ${country}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
              onError={() => markFailed(main)}
            />
          )}
          <figcaption className="absolute bottom-3 left-3 bg-black/40 px-2.5 py-1 font-mono text-micro uppercase tracking-[0.2em] text-white">
            {city} · {country}
          </figcaption>
        </figure>

        {/* 右侧缩略图列（≥2 张真实图才渲染；flex-1 均分主图高度） */}
        {hasThumbs && (
          <div className="grid grid-cols-3 gap-2.5 md:flex md:flex-col md:gap-2" data-ut-gallery-thumbs>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
                aria-label={`View image ${i + 1} of ${images.length}`}
                className={`relative aspect-[4/3] overflow-hidden transition-opacity duration-[var(--ut-dur-fast)] md:aspect-auto md:min-h-0 md:flex-1 ${
                  selected === i
                    ? "border-2 border-ut-accent"
                    : "border-2 border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                {failedSrcs.has(src) ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-ut-muted/25 to-ut-muted/45"
                  />
                ) : (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 30vw, 140px"
                    className="object-cover"
                    onError={() => markFailed(src)}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

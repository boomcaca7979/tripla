/**
 * land-mask — 把矢量海岸线栅格化成球面用的**等距圆柱单通道遮罩**。
 *
 * 为什么是运行时栅格化而不是二进制贴图：
 *   · 项目禁止"地图截图当背景"与超大纹理；这里从 176KB 矢量现算一张单通道遮罩，
 *     零二进制资产、零网络请求，分辨率可随设备调整。
 *
 * 分辨率策略（与地球在屏幕上的实际尺寸挂钩）：
 *   · 精细指针（桌面）：4096×2048 —— 单通道 8MB 显存，海岸线 ≈0.6px 精度
 *   · 粗指针（触屏/低端）：2048×1024 —— 2MB
 *
 * 与节点坐标的一致性：u = (lon+180)/360、v = (90-lat)/180，必须与 earth.ts 的
 * latLonToVector3 使用同一约定，否则大陆与城市点会错位。
 */

import { LAND_RINGS } from "@/data/world/land-50m";

export interface LandMask {
  data: Uint8Array;
  width: number;
  height: number;
}

export function lonToU(lon: number): number {
  return (lon + 180) / 360;
}

export function latToV(lat: number): number {
  return (90 - lat) / 180;
}

/**
 * 生成遮罩数据：255 = 陆地，0 = 海洋。
 * 跨 180° 经线的环会被平移 ±360° 重绘，避免接缝假缺口。
 */
export function createLandMask(width: number, height: number): LandMask {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { data: new Uint8Array(width * height), width, height };

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";

  for (const ring of LAND_RINGS) {
    if (ring.length < 3) continue;
    let minLon = 180;
    let maxLon = -180;
    for (const [lon] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    const wraps = maxLon - minLon > 180;
    const offsets = wraps ? [0, 360, -360] : [0];

    for (const offset of offsets) {
      ctx.beginPath();
      for (let i = 0; i < ring.length; i += 1) {
        const x = lonToU(ring[i][0] + offset) * width;
        const y = latToV(ring[i][1]) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // 只保留单通道：Three 侧用 RedFormat 上传，显存与带宽都省 4 倍
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const data = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 1, p += 4) {
    data[i] = rgba[p]; // 白/黑灰阶一致，取 R 通道
  }
  return { data, width, height };
}

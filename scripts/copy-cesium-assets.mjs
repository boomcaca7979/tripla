/**
 * copy-cesium-assets — 把 Cesium 的静态运行时资产拷进 public/cesium。
 *
 * 为什么需要：Cesium 在运行时按需加载 Workers / Assets / Widgets / ThirdParty
 * （Web Worker、内置贴图、widgets.css 引用的图标等），这些文件必须能通过
 * HTTP 直接访问，且路径要与 window.CESIUM_BASE_URL 一致（本项目中为 /cesium/）。
 *
 * 用法：
 *   node scripts/copy-cesium-assets.mjs        # 本地/构建前手动执行一次
 * 生产（Vercel）：在 build 前执行同一脚本即可（或改为把 /cesium 指向 CDN）。
 */

import { cp, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SOURCE = path.resolve("node_modules/cesium/Build/Cesium");
const TARGET = path.resolve("public/cesium");
const DIRS = ["Workers", "Assets", "Widgets", "ThirdParty"];

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`[cesium] 未找到 ${SOURCE}，请先 npm install cesium`);
    process.exit(1);
  }
  await rm(TARGET, { recursive: true, force: true });
  await mkdir(TARGET, { recursive: true });

  for (const dir of DIRS) {
    const from = path.join(SOURCE, dir);
    if (!existsSync(from)) continue;
    await cp(from, path.join(TARGET, dir), { recursive: true });
  }

  // 只在运行时真正需要的文件；不拷贝 Build/Cesium/Cesium.js（走 bundler 引用）
  const copied = [];
  for (const dir of DIRS) {
    const p = path.join(TARGET, dir);
    if (existsSync(p)) {
      const s = await stat(p);
      copied.push(`${dir}${s.isDirectory() ? "/" : ""}`);
    }
  }
  console.log(`[cesium] assets copied to public/cesium → ${copied.join(", ")}`);
}

main().catch((err) => {
  console.error("[cesium] copy failed:", err);
  process.exit(1);
});

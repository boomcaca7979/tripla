import { copyFile, mkdir, readdir, readFile, rm } from "node:fs/promises";

/**
 * prepare-map-worker — 自托管 MapLibre 6 的 worker 与 shared 模块。
 *
 * 来源：**移植自 OSIRIS**（https://github.com/simplifaisoul/osiris，MIT License，
 * Copyright (c) Souleimen Mrad）的 `tools/prepare-map-worker.mjs`，逻辑照搬，
 * 仅把文件位置从 `tools/` 换成本项目的 `scripts/`。
 *
 * 为什么必须这么做（这是 `rendered: 0` 的根因）：
 *   MapLibre 6 的 worker 是**模块 worker**（`new Worker(url, {type:'module'})`），
 *   它会再 import 同目录的 `maplibre-gl-shared.mjs`。库默认的 worker URL 是从
 *   `import.meta.url` 推导的，并且带一道 `/^https?:/` 检查 —— 在 Turbopack 的
 *   浏览器 bundle里 `import.meta.url` 不是 http(s) URL，于是库拿到**空字符串**，
 *   worker 静默失败：源数据永不加载、`isStyleLoaded()` 恒为 false、
 *   `queryRenderedFeatures()` 恒为 0，而且**没有任何报错**。
 *
 *   所以和 OSIRIS 一样：把 worker（以及它依赖的 shared 模块）从已安装的 npm 包
 *   拷到 `public/vendor/maplibre/<version>/`，在建 Map 前用 `setWorkerUrl()` 指过去。
 *   这是**引擎代码**（约 19KB JS + BSD LICENSE），不是任何地理/地图数据。
 *
 * 接线（与 OSIRIS 相同）：`predev` 与 `prebuild` 各跑一次，保证版本始终一致；
 * 并清掉旧版本目录，避免"本地旧副本能跑、生产 404"。
 */

const root = new URL("../", import.meta.url);
const source = new URL("node_modules/maplibre-gl/", root);
const { version } = JSON.parse(await readFile(new URL("package.json", source), "utf8"));
const vendor = new URL("public/vendor/maplibre/", root);
const target = new URL(`${version}/`, vendor);
await mkdir(target, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs", "../LICENSE.txt"]) {
  await copyFile(new URL(`dist/${file}`, source), new URL(file.split("/").at(-1), target));
}

/* 这些文件需要随仓库存在：地图没有它们会直接失败，而跳过 npm 生命周期脚本的构建
   会一个都拷不出来。只保留当前安装版本对应的目录，防止"版本升级后留旧目录"。 */
for (const entry of await readdir(vendor, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== version) {
    await rm(new URL(`${entry.name}/`, vendor), { recursive: true, force: true });
    console.log(`prepare-map-worker: pruned stale maplibre ${entry.name}`);
  }
}

console.log(`prepare-map-worker: maplibre ${version} worker ready`);

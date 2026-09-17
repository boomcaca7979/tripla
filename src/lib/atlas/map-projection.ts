/**
 * map-projection — MapLibre 投影切换（globe ⇄ mercator）。
 *
 * 来源：**移植自 OSIRIS**（https://github.com/simplifaisoul/osiris，MIT License，
 * Copyright (c) Souleimen Mrad）的 `src/lib/map-projection.ts`，代码逐行保留。
 * 仅去掉了 OSIRIS 内部 issue 编号的叙述性注释，改成 UTRIPLA 语境说明。
 *
 * 为什么直接沿用而不是自己写：MapLibre 自带自适应 globe —— 在总览级是真球体，
 * 放大时由**库自己**内部切到 mercator，过渡由库负责而非应用负责。这一段逻辑
 * （尤其是"投影没变就不要调 setProjection"的短路）已经过 OSIRIS 生产验证。
 */

import type { Map, ProjectionSpecification } from 'maplibre-gl';

/** 纯 globe：总览级真球体，放大后由 MapLibre 自行转 mercator。 */
export const GLOBE_PROJECTION: ProjectionSpecification = { type: 'globe' };

/**
 * 带地形的 globe 变体：到 zoom 9 之前完成到本地平面的过渡。
 * UTRIPLA 当前不启用地形，保留此常量是为了与 OSIRIS 的实现保持同构。
 */
export const TERRAIN_GLOBE_PROJECTION: ProjectionSpecification = {
  type: ['interpolate', ['linear'], ['zoom'], 7, 'vertical-perspective', 9, 'mercator'],
};

/** 应用投影；返回是否真的发生了变更（投影相同则短路，避免多余的 GPU 程序重编译）。 */
export function applyMapProjection(
  map: Pick<Map, 'getProjection' | 'setProjection'>,
  mode: 'globe' | 'mercator',
  terrainEnabled = false,
): boolean {
  const next: ProjectionSpecification = mode === 'mercator'
    ? { type: 'mercator' }
    : terrainEnabled ? TERRAIN_GLOBE_PROJECTION : GLOBE_PROJECTION;
  // 样式未声明投影时，库的返回类型说是 globe，实际是 mercator —— 所以取 ?? 'mercator'。
  if (JSON.stringify(map.getProjection()?.type ?? 'mercator') === JSON.stringify(next.type)) return false;
  map.setProjection(next);
  return true;
}

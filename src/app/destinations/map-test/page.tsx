import type { Metadata } from "next";
import DestinationGlobeMap, { type GlobeFeatureCollection } from "@/components/atlas/DestinationGlobeMap";
import { DEFAULT_BASEMAP_ID } from "@/lib/atlas/basemap";
import { DESTINATIONS } from "@/data/destinations";
import { getClimateRecord } from "@/data/climate/nasa-canonical";
import { canonicalWindowLabel } from "@/components/besttime/besttime-state";
import { FEATURED_DESTINATIONS } from "@/data/featured-destinations";
import { vibesForInterests } from "@/lib/inner-state";

/**
 * /destinations/map-test — **临时技术验证页**（不替代正式 /destinations）。
 *
 * 本轮：在 OSIRIS→MapLibre globe 引擎之上接入**真实在线底图**。
 *   · 供应商选择与 style URL 全部在 `src/lib/atlas/basemap.ts`（Provider 层）；
 *   · 默认 `maptiler-dataviz`（深色、英文、全球、商用需订阅）；
 *   · `?basemap=openfreemap` 可切到 keyless 在线真实地图预览；
 *   · `?basemap=none` 回到无底图占位球面（纯引擎验证）。
 *
 * 凭证：**只**从环境变量读（绝不写进代码、绝不进 Git）：
 *   NEXT_PUBLIC_MAP_PROVIDER_TOKEN=<MapTiler key: https://cloud.maptiler.com/account/keys/>
 * 底图加载失败时页面降级为占位球面 + 轻量提示，globe / 节点 / 链接层照常工作。
 *
 * 隔离性：不触碰正式页任何组件；本页 noindex；仅本页隐藏站点大 Footer。
 */

export const metadata: Metadata = {
  title: "Map engine test (temporary)",
  description: "Temporary MapLibre globe engine validation page for the UTRIPLA destinations globe.",
  robots: { index: false, follow: false },
};

/** 把正式 destination 数据装配成 GeoJSON（数量由数据决定，不写死）。 */
function buildDestinations(): GlobeFeatureCollection {
  return {
    type: "FeatureCollection",
    features: DESTINATIONS.map((d) => {
      const record = getClimateRecord(d.slug);
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          // GeoJSON 顺序是 [lon, lat]
          coordinates: [d.airport.longitude, d.airport.latitude] as [number, number],
        },
        properties: {
          slug: d.slug,
          city: d.city,
          country: d.country,
          region: d.region,
          bestTime: canonicalWindowLabel(record.bestMonthsBaseline),
          budget: `${d.budgetPerDay.toLocaleString("en-US")} ${d.budgetCurrency}/day`,
          major: FEATURED_DESTINATIONS.has(d.slug),
          vibes: vibesForInterests(d.interests as string[]),
        },
      };
    }),
  };
}

export default async function MapTestPage({
  searchParams,
}: {
  searchParams: Promise<{ basemap?: string }>;
}) {
  const { basemap } = await searchParams;
  const destinations = buildDestinations();

  return (
    <>
      {/* 测试页专用：隐藏站点大 Footer（正文整块留给地图）。仅在存在地图容器时生效。 */}
      <style>{`body:has([data-maplibre-globe]) footer { display: none !important; }`}</style>
      <DestinationGlobeMap
        destinations={destinations}
        basemapId={basemap || DEFAULT_BASEMAP_ID}
        basemapCredential={process.env.NEXT_PUBLIC_MAP_PROVIDER_TOKEN || undefined}
      />
    </>
  );
}

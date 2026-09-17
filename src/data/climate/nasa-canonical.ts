import climateJson from "./nasa-power-canonical-v1.json";

/**
 * nasa-canonical — Best-time 的 **production climate authority**。
 *
 * 数据来源（migration 后的唯一气候权威，取代 lib/climate-pattern 的纬度模板）：
 *   NASA POWER (NASA Langley Research Center)
 *   → build-time acquisition（Climatology / Daily / Monthly point APIs，145 anchors）
 *   → v8.7 normalize / aggregate / validate pipeline（冻结于 internal-data-freeze-v87）
 *   → src/data/climate/nasa-power-canonical-v1.json（本 artifact，version-locked）
 *   → Best-time SSG。
 *
 * 硬性契约（migration gate STEP 1/3/7）：
 *   · 本模块是**纯静态数据访问层**——零网络、零 runtime API、零客户端 climate fetch。
 *   · `getClimateRecord` 对缺失记录**抛出异常**：任何 destination 没有 canonical
 *     记录时 build 直接 FAIL，绝不回退到纬度模板（STEP 6 硬约束）。
 *   · climate 数值 / R1–R7 tier / bestMonthsBaseline 与 v8.7 freeze 逐字节一致
 *     （coreClimateHash / recommendationHash / bestMonthsHash 见 artifact.hashes）。
 *   · sunshineHours = null 是合法状态（NASA POWER 家族无 sunshine-duration 产品）；
 *     daylightHours 是天文计算（UTRIPLA methodology），不是 NASA 数据。
 *   · attribution 遵守 compliance v2：仅事实性来源标注，不使用 NASA 标识、
 *     不暗示 NASA endorsement。
 */

export interface ClimateMonth {
  monthIndex: number;
  tempMeanC: number;
  tempHighC: number;
  tempLowC: number;
  precipMm: number;
  precipDaysGe1mm: number;
  sunshineHours: number | null;
  daylightHours: number;
  ruleId: string;
  tier: "Favourable" | "Workable" | "Challenging";
}

export interface CanonicalClimateRecord {
  destinationId: string;
  city: string;
  country: string;
  region: string;
  anchor: { type: string; latitude: number; longitude: number; elevationM: number };
  grid: { latitude: number; longitude: number; elevationM: number; resolution: string };
  sourceFamily: string;
  periodStart: number;
  periodEnd: number;
  dailyBoundary: string;
  methodologyVersion: string;
  ruleVersion: string;
  months: ClimateMonth[];
  bestMonthsBaseline: number[];
  recommendationStatus: string;
  selection: { reason: string; ruleVersion: string };
  fieldProvenance: Record<string, unknown>;
}

interface ProductionCanonical {
  artifactVersion: string;
  sourceDataset: {
    datasetVersion: string;
    sourceSha256: string;
    methodologyVersion: string;
    ruleVersion: string;
    pilotVersion: string;
  };
  attribution: { statement: string; displayLine: string; accessDate: string };
  licence: { status: string; basis: string; residual: string; audit: string };
  hashes: Record<string, string | null>;
  records: CanonicalClimateRecord[];
}

const data = climateJson as unknown as ProductionCanonical;

export const CLIMATE_ARTIFACT_VERSION = data.artifactVersion;
export const CLIMATE_SOURCE_DATASET_VERSION = data.sourceDataset.datasetVersion;
export const CLIMATE_ATTRIBUTION_LINE = data.attribution.displayLine;
export const CLIMATE_SOURCE_STATEMENT = data.attribution.statement;
export const CLIMATE_ARTIFACT_HASHES = data.hashes;

const INDEX: Map<string, CanonicalClimateRecord> = new Map(
  data.records.map((r) => [r.destinationId, r]),
);

/**
 * 取一个 destination 的 canonical 气候记录。
 * 缺失 = 抛异常 = build FAIL（禁止任何模板回退）。
 */
export function getClimateRecord(destinationId: string): CanonicalClimateRecord {
  const rec = INDEX.get(destinationId);
  if (!rec) {
    throw new Error(
      `[nasa-canonical] no climate record for "${destinationId}" — ` +
        "Best-time cannot render without the production NASA POWER dataset " +
        `(artifact ${CLIMATE_ARTIFACT_VERSION})`,
    );
  }
  return rec;
}

/** artifact 级自检：记录数不得少于期望目的地规模（v8.7 冻结时为 145，扩展后 155）。 */
export function assertCanonicalCoverage(expectedDestinations: string[]): void {
  if (data.records.length < expectedDestinations.length) {
    throw new Error(
      `[nasa-canonical] expected ${expectedDestinations.length} records, found ${data.records.length} — partial dataset detected`,
    );
  }
  const missing = expectedDestinations.filter((id) => !INDEX.has(id));
  if (missing.length > 0) {
    throw new Error(
      `[nasa-canonical] destinations missing climate records: ${missing.join(", ")}`,
    );
  }
}

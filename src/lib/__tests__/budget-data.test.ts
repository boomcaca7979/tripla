/**
 * 预算数据契约测试 —— 覆盖全部 DESTINATIONS（205 城）与 TRIPS，不是抽样。
 *
 * 数据来源口径（2026-10-27 全量核查后确立，2026-10-28 补充量级检测）：
 *   · budgetPerDay / budgetCurrency = **编辑估算值**（editorial estimate），
 *     数据文件无逐城外部来源；页面以 "estimated" 措辞披露。
 *   · 例外：Tokyo 另有 budget-detail.ts 的 evidence-backed 三档（JPY 区间，
 *     2026-10 核对，含来源链接）。
 *   · 修复记录（两批，共 30 城）：budgetCurrency 曾被错标为本币代码，而数值
 *     是按 USD 口径抄写的（Luxor 55 "EGP" ≈ 1 USD/天、Marrakech 65 "MAD"），
 *     2026-10-27 修 15 城、2026-10-28 修 15 城，均改为 USD；同期 12 个 trip
 *     的 currency 与城市口径不符（金额精确 = budgetPerDay × days），一并修正。
 *     ⚠️ 两批修复的依据都是**内部数值量级 + 同国城市对照**，未经任何独立价格
 *     来源确认 —— 不得表述为"外部核实通过"。
 *
 * 本文件防止三类回归：
 *   1) 币种错配（标签与数值口径不符）
 *   2) 修复回退（30 城重新标回本币）
 *   3) 数量级异常（折算成 USD 后明显不可能的日预算）
 *
 * ⚠️ 量级检查是**异常检测**，不是"价格正确性证明"：区间取自内部数据分布，
 *    不是行业标准，落在区间内也不代表数值经过外部核验。
 */

import { describe, expect, it } from "vitest";

import { DESTINATIONS } from "@/data/destinations";
import { TRIPS } from "@/data/trips";
import { budgetBreakdown } from "@/lib/budget-breakdown";

/** ISO 4217：数据集中出现过的全部币种代码（合法集合，新城市须在此列）。 */
const KNOWN_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "AUD", "SGD", "CNY", "MOP", "CHF", "CAD", "NZD",
  "MAD", "EGP", "TND", "TZS", "ZAR", "MUR", "SCR", "GHS", "XOF", "ETB",
  "BRL", "COP", "MXN", "UYU", "ARS", "JMD", "INR", "UZS", "OMR", "SAR",
  "GEL", "MMK", "LAK", "MYR", "KZT", "NOK", "XPF", "JPY", "KRW", "HKD",
  "AED", "CZK", "SEK", "DKK", "PLN", "HUF", "TRY", "THB", "VND", "IDR",
  "PHP", "TWD", "ILS", "CLP", "PEN",
]);

/**
 * 参考汇率快照（units per 1 USD）——**测试常量，不联网**。
 *
 *   来源：open.er-api.com（exchangerate-api 免费端点）
 *   取数：2026-10-28 UTC（中间价）
 *
 * 为什么在测试内固化而不是复用 src/lib/home-data.ts 的 REFERENCE_FX：
 *   单元测试必须确定性、可离线复现；生产侧汇率用于首页 $ 档位分桶，与本测试
 *   的"量级异常检测"目的不同，两者的更新节奏也不应互相牵制。
 *
 * ⚠️ 币种集合必须覆盖数据集中出现的每一种 budgetCurrency。缺失不会被静默跳过
 *    —— 下方专门的断言会直接失败并列出缺失币种（2026-10-28 数据集实际 13 种）。
 */
const FX_REFERENCE_DATE = "2026-10-28";
const FX_SOURCE = "open.er-api.com (exchangerate-api free endpoint)";

const FX_SNAPSHOT: Record<string, number> = {
  USD: 1,
  AUD: 1.422618,
  CAD: 1.404056,
  CHF: 0.828754,
  CNY: 6.681042,
  EUR: 0.897453,
  GBP: 0.751056,
  GEL: 2.595829,
  MOP: 8.079606,
  NZD: 1.758915,
  OMR: 0.384497,
  SAR: 3.75,
  SGD: 1.281211,
};

/**
 * 量级检测区间（USD/人/日）。**异常检测阈值，不是行业标准，也不是
 * "真实价格应在此区间"的断言。**
 *
 * 取值依据（2026-10-28 修复后全量分布）：
 *   min 23.1（Tbilisi 60 GEL）· p10 50 · 中位 105.9 · p90 180 · max 350（Maldives）
 *
 * 下界 20 的依据：两批被修复的 30 城，错标状态折算后为 0.00–18.34 USD，全部
 * 低于 20；上界 500 远高于实际最大值 350，只在出现量级级错误时触发。区间刻意
 * 留宽 —— 目的是抓"不可能"，不是抓"不精确"。
 */
const MAGNITUDE_MIN_USD = 20;
const MAGNITUDE_MAX_USD = 500;

/**
 * 合理例外登记：slug → 理由（必须写明为何该城可合法落在区间外）。
 * 目前为空 —— 修复后全量 205 城均在区间内，没有需要豁免的城市。
 * 若要新增，必须有可核查的日期与来源；不加来源的豁免等于掩盖数据错误。
 *
 * 下方「例外登记不得过期」断言会反向校验：一旦某条豁免的城市回到区间内，
 * 测试失败并提示删除该条，避免登记表退化成垃圾桶。
 */
const MAGNITUDE_EXCEPTIONS: Record<string, string> = {};

interface MagnitudeRow {
  slug: string;
  budgetPerDay: number;
  budgetCurrency: string;
}

interface MagnitudeFinding {
  slug: string;
  budgetCurrency: string;
  budgetPerDay: number;
  usdPerDay: number;
  inRange: boolean;
}

/** 纯函数：返回缺失汇率、越界未登记、过期登记三组结果（便于单测）。 */
function magnitudeAudit(
  rows: MagnitudeRow[],
  opts: {
    fx: Record<string, number>;
    minUsd: number;
    maxUsd: number;
    exceptions: Record<string, string>;
  },
) {
  const missingCurrencies = [...new Set(rows.map((r) => r.budgetCurrency))]
    .filter((c) => !(c in opts.fx))
    .sort();

  const findings: MagnitudeFinding[] = [];
  for (const r of rows) {
    if (!(r.budgetCurrency in opts.fx)) continue; // 缺失币种由 missingCurrencies 单独报出
    const usdPerDay = r.budgetPerDay / opts.fx[r.budgetCurrency];
    findings.push({
      slug: r.slug,
      budgetCurrency: r.budgetCurrency,
      budgetPerDay: r.budgetPerDay,
      usdPerDay,
      inRange: usdPerDay >= opts.minUsd && usdPerDay <= opts.maxUsd,
    });
  }

  const unregistered = findings
    .filter((f) => !f.inRange && !(f.slug in opts.exceptions))
    .map(
      (f) =>
        `${f.slug}: ${f.budgetPerDay} ${f.budgetCurrency} ≈ $${f.usdPerDay.toFixed(2)}/day（区间 ${opts.minUsd}–${opts.maxUsd}）`,
    )
    .sort();

  const stale = Object.keys(opts.exceptions)
    .filter((slug) => findings.some((f) => f.slug === slug && f.inRange))
    .sort();

  return { missingCurrencies, unregistered, stale };
}

/**
 * 2026-10 两批币种修复的锁定表（30 城 → 修复后币种）。
 * 目的：防止有人"看起来更合理"地把标签改回本币，从而重新引入同一缺陷。
 * 注意：本表锁定的是**修复结论**，不是外部事实 —— 见文件头说明。
 */
const CURRENCY_LABEL_FIXES_2026_10: Record<string, string> = {
  // 第一批 2026-10-27（15 城）
  luxor: "USD",
  aswan: "USD",
  johannesburg: "USD",
  "sao-paulo": "USD",
  cartagena: "USD",
  medellin: "USD",
  oaxaca: "USD",
  ushuaia: "USD",
  "new-delhi": "USD",
  agra: "USD",
  varanasi: "USD",
  bagan: "USD",
  vientiane: "USD",
  "kota-kinabalu": "USD",
  bergen: "USD",
  // 第二批 2026-10-28（15 城）
  marrakech: "USD",
  casablanca: "USD",
  fes: "USD",
  tunis: "USD",
  zanzibar: "USD",
  "port-louis": "USD",
  "victoria-seychelles": "USD",
  accra: "USD",
  dakar: "USD",
  "addis-ababa": "USD",
  montevideo: "USD",
  "montego-bay": "USD",
  samarkand: "USD",
  almaty: "USD",
  papeete: "USD",
};

describe("destinations 预算数据契约（全量 205 城）", () => {
  it("每个目的地存在有限正整数 budgetPerDay", () => {
    for (const d of DESTINATIONS) {
      expect(Number.isFinite(d.budgetPerDay), `${d.slug} budgetPerDay 非有限数`).toBe(true);
      expect(d.budgetPerDay, `${d.slug} budgetPerDay 必须为正`).toBeGreaterThan(0);
      expect(Number.isInteger(d.budgetPerDay), `${d.slug} budgetPerDay 必须为整数`).toBe(true);
    }
  });

  it("budgetCurrency 是已知 ISO 4217 代码（防止本币代码错配回归）", () => {
    for (const d of DESTINATIONS) {
      expect(
        KNOWN_CURRENCIES.has(d.budgetCurrency),
        `${d.slug} 的 budgetCurrency "${d.budgetCurrency}" 不在合法集合`,
      ).toBe(true);
      expect(d.budgetCurrency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it("2026-10 两批币种修复不得回退（30 城必须保持 USD）", () => {
    const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
    const regressions: string[] = [];
    for (const [slug, expected] of Object.entries(CURRENCY_LABEL_FIXES_2026_10)) {
      const d = bySlug.get(slug);
      if (!d) {
        regressions.push(`${slug}: 目的地不存在（被删除或改名？）`);
        continue;
      }
      if (d.budgetCurrency !== expected) {
        regressions.push(`${slug}: ${d.budgetCurrency}（应为 ${expected}）`);
      }
    }
    expect(regressions, "币种修复被回退").toEqual([]);
  });

  it("同国城市的计价币种一致（仅锁定现状，不证明取值正确）", () => {
    // 存量口径登记（2026-10-27 首次核查，2026-10-28 复核）：以下国家的城市数值
    // 在各自币种下均合理（如 Milan 130 USD ≈ 120 EUR），但同国计价不统一 ——
    // 统一需要汇率换算授权（不得擅自改数），故显式登记为已知状态；**新增**混用即失败。
    // （China 例外：澳门为独立货币区，MOP 合法。）
    //
    // ⚠️ 本断言只是**状态锁**，不是正确性判据：
    //    · 同国币种各异未必错（见上述六国，数值各自成立）；
    //    · 同国币种全同也可能全错（2026-10-28 前 Morocco 三城统一标 MAD，
    //      三城同时错标，本断言照样通过）。
    //    因此金额正确性由下方量级检测与修复锁定表兜底，不能只靠本项。
    const KNOWN_MIXED: Record<string, string> = {
      Italy: "EUR/USD",
      Spain: "EUR/USD",
      Germany: "EUR/USD",
      Austria: "EUR/USD",
      Finland: "EUR/USD",
      Norway: "EUR/USD",
    };
    const byCountry = new Map<string, Set<string>>();
    for (const d of DESTINATIONS) {
      const set = byCountry.get(d.country) ?? new Set<string>();
      set.add(d.budgetCurrency);
      byCountry.set(d.country, set);
    }
    const mixed = [...byCountry.entries()]
      .filter(([c, v]) => v.size > 1 && c !== "China")
      .map(([c, v]) => `${c}: ${[...v].sort().join("/")}`)
      .sort();
    const expected = Object.entries(KNOWN_MIXED).map(([c, v]) => `${c}: ${v}`).sort();
    expect(mixed, "同国币种混用与登记的存量清单不符（新增未登记的混用）").toEqual(expected);
  });

  it(`全量 205 城的日预算量级可解释（${MAGNITUDE_MIN_USD}–${MAGNITUDE_MAX_USD} USD/人/日）`, () => {
    const { unregistered } = magnitudeAudit(DESTINATIONS, {
      fx: FX_SNAPSHOT,
      minUsd: MAGNITUDE_MIN_USD,
      maxUsd: MAGNITUDE_MAX_USD,
      exceptions: MAGNITUDE_EXCEPTIONS,
    });
    expect(
      unregistered,
      "存在量级不可能的日预算 —— 通常意味着 budgetCurrency 与数值口径不符" +
        "（例如把 USD 金额标成了本币）。若确属合理例外，请带来源登记到 MAGNITUDE_EXCEPTIONS。",
    ).toEqual([]);
  });

  it("量级检测覆盖全部币种：缺少 FX 常量必须报错，不得静默跳过", () => {
    const { missingCurrencies } = magnitudeAudit(DESTINATIONS, {
      fx: FX_SNAPSHOT,
      minUsd: MAGNITUDE_MIN_USD,
      maxUsd: MAGNITUDE_MAX_USD,
      exceptions: MAGNITUDE_EXCEPTIONS,
    });
    expect(
      missingCurrencies,
      `FX_SNAPSHOT（${FX_REFERENCE_DATE}, ${FX_SOURCE}）缺少以下币种，量级检测会漏检：`,
    ).toEqual([]);
  });

  it("例外登记不得过期（回到区间内的城市必须从登记表移除）", () => {
    const { stale } = magnitudeAudit(DESTINATIONS, {
      fx: FX_SNAPSHOT,
      minUsd: MAGNITUDE_MIN_USD,
      maxUsd: MAGNITUDE_MAX_USD,
      exceptions: MAGNITUDE_EXCEPTIONS,
    });
    expect(stale, "MAGNITUDE_EXCEPTIONS 中存在已不再越界的过期条目").toEqual([]);
  });

  it("量级检测器本身能复现 2026-10 的错标形态（55 EGP 应被判为异常）", () => {
    // 用被修复城市的原始错标形态做回归：若检测器失效，此项先失败。
    const synthetic: MagnitudeRow[] = [
      { slug: "luxor-before", budgetPerDay: 55, budgetCurrency: "EGP" },
      { slug: "marrakech-before", budgetPerDay: 65, budgetCurrency: "MAD" },
      { slug: "vientiane-before", budgetPerDay: 50, budgetCurrency: "LAK" },
      { slug: "paris-ok", budgetPerDay: 150, budgetCurrency: "EUR" },
    ];
    const { unregistered } = magnitudeAudit(synthetic, {
      fx: { ...FX_SNAPSHOT, EGP: 56.094824, MAD: 9.0, LAK: 22358.11574 },
      minUsd: MAGNITUDE_MIN_USD,
      maxUsd: MAGNITUDE_MAX_USD,
      exceptions: {},
    });
    expect(unregistered.length).toBe(3);
    expect(unregistered.join("\n")).toContain("luxor-before");
    expect(unregistered.join("\n")).toContain("vientiane-before");
    expect(unregistered.join("\n")).not.toContain("paris-ok");
  });

  it("全部城市的费用分项之和 === 日预算总额（Lisbon 111≠110 回归保护）", () => {
    for (const d of DESTINATIONS) {
      const b = budgetBreakdown(d.budgetPerDay);
      const sum = b.accommodation + b.food + b.transportation + b.activities;
      expect(sum, `${d.slug}: ${b.accommodation}+${b.food}+${b.transportation}+${b.activities} ≠ ${d.budgetPerDay}`).toBe(d.budgetPerDay);
      // 分项不得为负（accommodation 吸收差额的边界条件）
      expect(b.accommodation, `${d.slug} accommodation 分项为负`).toBeGreaterThanOrEqual(0);
    }
  });

  it("slug 唯一（防止跨批次重复目的地）", () => {
    const slugs = DESTINATIONS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("trips 与目的地预算的跨模块契约（全量 trips）", () => {
  const destByCity = new Map(DESTINATIONS.map((d) => [d.city, d]));

  it("trip.currency 是已知 ISO 4217 代码", () => {
    for (const t of TRIPS) {
      expect(
        KNOWN_CURRENCIES.has(t.currency),
        `${t.slug} 的 currency "${t.currency}" 不在合法集合`,
      ).toBe(true);
    }
  });

  it("金额按城市日均口径对齐的 trip，其币种必须与目的地一致（Paris 标 USD 回归保护）", () => {
    const mislabeled: string[] = [];
    for (const t of TRIPS) {
      const dest = destByCity.get(t.city);
      if (!dest) continue;
      const expected = dest.budgetPerDay * t.days;
      // 仅约束「金额精确对齐城市日均 × 天数」的 trip —— 编辑性差异不在此列
      if (Math.abs(t.estimatedCost - expected) <= Math.max(expected * 0.02, 3)) {
        if (t.currency !== dest.budgetCurrency) {
          mislabeled.push(`${t.slug}: trip ${t.currency} vs dest ${dest.budgetCurrency}`);
        }
      }
    }
    expect(mislabeled, "存在币种与目的地口径不符的行程").toEqual([]);
  });
});

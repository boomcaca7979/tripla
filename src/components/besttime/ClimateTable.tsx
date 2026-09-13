import VerdictTag from "./VerdictTag";
import {
  VERDICT_MEANING,
  VERDICT_ORDER,
  type MonthRow,
} from "./besttime-labels";

/**
 * ClimateTable — Best-time 的 **Primary Data Object**。
 *
 * CONTRACT：
 *   §16 这是页面的主数据对象，必须是真正的语义表格：<table> + <caption> +
 *       <thead> + <tbody> + <th scope="col"> + <th scope="row">。
 *       它不是 div 拼的假表格，也不是卡片列表。
 *   §17 移动端**重新设计**而不是删列：外层容器 overflow-x 滚动（contained，
 *       绝不造成页面级横向溢出），并把 Month 列设为 sticky，滚动时始终可见。
 *       任何视口下 6 列都存在 —— 绝不为适配而删除 Temperature / Precipitation /
 *       Pattern note。
 *   §19 推荐列以**文字**表达（Best / Good / Mixed / Avoid），且四档含义在表下
 *       legend 中逐条解释 → 颜色只是辅助，信息不依赖颜色。
 *
 * NASA POWER PRIMARY MIGRATION 后的数据来源：
 *   Temperature = canonical tempHighC / tempLowC（月均日最高/最低，°C，1991–2020）
 *   Precipitation = canonical precipMm + precipDaysGe1mm（NASA-derived，≥1 mm）
 *   Verdict = R1–R7 tier + canonical bestMonthsBaseline（合成规则见 besttime-state）
 *   全部数值来自 NASA POWER canonical dataset（version-locked），非模板、非预测。
 */

const TH_CLASS =
  "whitespace-nowrap py-3 pr-5 font-mono text-micro uppercase tracking-[0.16em] text-ut-muted";
const TD_CLASS = "py-3 pr-5 align-top font-mono text-body-sm text-ut-text";

const f1 = (n: number) => n.toFixed(1);

export default function ClimateTable({
  rows,
  city,
  country,
}: {
  rows: MonthRow[];
  city: string;
  country: string;
}) {
  if (rows.length === 0) return null;

  return (
    <div>
      <p className="max-w-[68ch] text-body leading-[1.6] text-ut-text-2">
        Twelve months of NASA POWER climate normals for {city} (1991–2020
        average), side by side with the travel verdict: whether a month is
        Favourable, Workable or Challenging (R1–R7 classification), and whether
        it falls inside the canonical best-time window. Historical climate
        normals — not a forecast.
      </p>

      <div
        role="region"
        aria-label={`Month-by-month climate data table for ${city}, ${country}`}
        tabIndex={0}
        className="mt-6 overflow-x-auto overscroll-x-contain"
      >
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">
            Climate normals and travel verdict by month for {city}, {country}.
          </caption>
          <thead>
            <tr className="border-b border-ut-border-strong">
              <th scope="col" className={`sticky left-0 z-20 bg-ut-bg ${TH_CLASS} w-[150px]`}>
                Month
              </th>
              <th scope="col" className={`${TH_CLASS} w-[110px]`}>
                Season
              </th>
              <th scope="col" className={`${TH_CLASS} w-[150px]`}>
                Temperature
              </th>
              <th scope="col" className={`${TH_CLASS} w-[170px]`}>
                Precipitation
              </th>
              <th scope="col" className={`${TH_CLASS} min-w-[300px]`}>
                Month readout
              </th>
              <th scope="col" className={`${TH_CLASS} w-[110px] pr-0`}>
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.index}
                className="border-b border-ut-border align-top"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-ut-bg py-3 pr-5 text-left align-top font-normal"
                >
                  <span className="flex items-baseline gap-2">
                    <span
                      aria-hidden="true"
                      className={[
                        "h-[5px] w-[5px] shrink-0 rounded-full translate-y-[-1px]",
                        row.inWindow ? "bg-ut-accent" : "bg-transparent",
                      ].join(" ")}
                    />
                    <span className="font-mono text-body-sm text-ut-ink">
                      {row.name}
                    </span>
                  </span>
                  {row.inWindow && (
                    <span className="sr-only">
                      inside the recommended window;
                    </span>
                  )}
                </th>
                <td className={`${TD_CLASS} text-ut-text-2`}>{row.seasonName}</td>
                <td className={TD_CLASS}>
                  {f1(row.tempHighC)}° / {f1(row.tempLowC)}°C
                </td>
                <td className={TD_CLASS}>
                  {f1(row.precipMm)} mm · {f1(row.precipDaysGe1mm)} rain days
                </td>
                <td className="max-w-[420px] py-3 pr-5 align-top font-sans text-body-sm leading-[1.5] text-ut-text-2">
                  {row.note}
                </td>
                <td className="py-3 pr-0 align-top">
                  <VerdictTag verdict={row.verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
        ● marks a month inside the canonical best-time window
      </p>

      {/* 档位 legend：四档含义逐条解释，推荐结果不依赖颜色 */}
      <dl className="mt-7 grid gap-x-10 gap-y-4 border-t border-ut-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {VERDICT_ORDER.map((verdict) => (
          <div key={verdict}>
            <dt>
              <VerdictTag verdict={verdict} />
            </dt>
            <dd className="mt-2 text-body-sm leading-[1.5] text-ut-text-2">
              {VERDICT_MEANING[verdict]}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 max-w-[72ch] text-body-sm leading-[1.5] text-ut-subtle">
        Method: temperature and precipitation are 1991–2020 climate normals
        (monthly means); verdicts combine the R1–R7 climate classification with
        the canonical best-time window. No daily forecast, crowd level or price
        index is claimed.
      </p>

      <p className="mt-3 max-w-[72ch] text-body-sm leading-[1.5] text-ut-subtle">
        Climate data source: NASA POWER (NASA Langley Research Center) ·
        Climatology / Daily / Monthly point APIs · 1991–2020 · UTC+00:00 daily
        boundary.
      </p>
    </div>
  );
}

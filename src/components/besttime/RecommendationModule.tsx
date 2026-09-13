import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import VerdictTag from "./VerdictTag";
import {
  VERDICT_LABEL,
  VERDICT_ORDER,
  type MonthRow,
  type Verdict,
} from "./besttime-labels";
import type { DecisionReadout } from "./besttime-state";
import type { Destination } from "@/data/destinations";

/**
 * RecommendationModule — Best-time 的「决定 + 为什么」模块。
 *
 * CONTRACT：
 *   §18 推荐不是一段 AI 文案，而是一个**可核对的合成**：
 *       左侧给出决定（真实窗口），右侧给出四档月份分布；下方逐条解释"为什么是这几个月"。
 *   §19 四档恒以文字呈现（Best / Good / Mixed / Avoid），颜色仅辅助；
 *       空档位也要保留行并显示 "—"（结构不随数据变化）。
 *   §20 "Why these months?" 必须由**真实数据**支撑：窗口本身来自 canonical
 *       bestMonthsBaseline（R1–R7 派生），窗口内气候读数来自 NASA POWER
 *       1991–2020 normals，窗口外的替代/不利月份同样来自 canonical tier，
 *
 * 全页唯一 Primary CTA 不在此处；这里最多一个 hairline 语境链接（非主按钮）。
 */

export default function RecommendationModule({
  dest,
  rows,
  readout,
}: {
  dest: Destination;
  rows: MonthRow[];
  readout: DecisionReadout;
}) {
  const win = readout.window;
  const zone = readout.zone;
  const hemisphere = readout.hemisphere;

  const monthsByVerdict = (verdict: Verdict): string[] =>
    rows.filter((r) => r.verdict === verdict).map((r) => r.short);

  const outsideWindowCount = rows.length - win.count;
  const altNames = monthsByVerdict("good");
  const avoidNames = monthsByVerdict("avoid");

  const tempRead =
    win.tempLevels.length > 0 ? win.tempLevels.join(" / ") : "no clear temp level";
  const precipRead =
    win.precipTendencies.length > 0
      ? win.precipTendencies.join(" / ")
      : "no clear precipitation level";

  return (
    <div>
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>The decision</Eyebrow>
          <p className="mt-3 max-w-[20ch] font-display text-h2 leading-[var(--ut-text-h2--lh)] text-ut-ink">
            Go in {win.label}
          </p>
          <p className="mt-4 max-w-[58ch] text-body leading-[1.6] text-ut-text-2">
            {dest.bestSeason}
          </p>
          <p className="mt-3 max-w-[58ch] text-body leading-[1.6] text-ut-text-2">
            {dest.weatherScore.recommendation}
          </p>
          <Link
            href={`/destinations/${dest.slug}`}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-ut-accent-strong underline decoration-ut-accent-line underline-offset-4 transition-colors duration-[var(--ut-dur-fast)] hover:text-ut-ink focus-visible:outline-2 focus-visible:outline-ut-accent"
          >
            Read the full {dest.city} destination guide
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="lg:col-span-5">
          <dl>
            {VERDICT_ORDER.map((verdict) => {
              const names = monthsByVerdict(verdict);
              return (
                <div
                  key={verdict}
                  className="grid grid-cols-[110px_1fr] items-baseline gap-x-4 border-t border-ut-border py-3 last:border-b"
                >
                  <dt>
                    <VerdictTag verdict={verdict} />
                  </dt>
                  <dd className="text-right font-mono text-body-sm leading-[1.5] text-ut-text">
                    {names.length > 0 ? names.join(" · ") : "—"}
                    <span className="ml-2 text-ut-subtle">
                      {names.length}/{rows.length}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-3 font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
            Distribution across the twelve months
          </p>
        </div>
      </div>

      {/* Why these months? —— 逐条给出依据 */}
      <div className="mt-10 grid gap-x-12 gap-y-5 border-t border-ut-border-strong pt-7 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>Reasoning</Eyebrow>
          <h3 className="mt-3 font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
            Why these months?
          </h3>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <p className="max-w-[66ch] text-body leading-[1.6] text-ut-text-2">
            {dest.city}&apos;s canonical best-time window is{" "}
            <span className="text-ut-ink">{win.label || "the whole year"}</span>{" "}
            — {win.count === 0
              ? "every month reads as workable on the 1991–2020 record"
              : `${win.count} ${win.count === 1 ? "month" : "months"} of the year`}
            . That window is derived from the R1–R7 classification of NASA POWER
            climate normals, and it is the primary signal behind the verdicts
            above.
          </p>
          <p className="max-w-[66ch] text-body leading-[1.6] text-ut-text-2">
            Inside the window, NASA POWER climate normals for a{" "}
            {zone.toLowerCase()} climate in the {hemisphere.toLowerCase()}{" "}
            hemisphere read {tempRead} with {precipRead} precipitation —
            1991–2020 monthly averages, not a forecast. Outside it, month-by-
            month verdicts come from the R1–R7 climate classification over the
            same dataset.
          </p>
          <p className="max-w-[66ch] text-body leading-[1.6] text-ut-text-2">
            {outsideWindowCount > 0 ? (
              <>
                The other {outsideWindowCount} months sit outside the window.{" "}
                {altNames.length > 0 ? (
                  <>
                    {altNames.join(", ")}{" "}
                    {altNames.length === 1 ? "still reads" : "still read"} as
                    workable on the pattern — useful for shoulder-season travel.{" "}
                  </>
                ) : null}
                {avoidNames.length > 0 ? (
                  <>
                    {avoidNames.join(", ")}{" "}
                    {avoidNames.length === 1 ? "reads" : "read"} as least
                    favourable for this zone.
                  </>
                ) : (
                  <>No month reads as least favourable on the pattern.</>
                )}
              </>
            ) : (
              <>
                Every month of the year falls inside the recommended window for{" "}
                {dest.city}, so the deciding factor is cost and crowds rather
                than the climate pattern.
              </>
            )}
          </p>
          <p className="max-w-[66ch] font-mono text-micro uppercase tracking-[0.18em] text-ut-subtle">
            Signals — {VERDICT_LABEL.best}: R1–R7 favourable months ·{" "}
            {VERDICT_LABEL.good} / {VERDICT_LABEL.mixed}: R1–R7 workable ·{" "}
            {VERDICT_LABEL.avoid}: R1–R7 challenging · climate normals: NASA
            POWER 1991–2020
          </p>
        </div>
      </div>
    </div>
  );
}

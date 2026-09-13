import { SEASON_TINT } from "./besttime-labels";
import {
  seasonLabel,
  type SeasonSummary as SeasonSummaryData,
  type WindowSummary,
} from "./besttime-state";

/**
 * SeasonSummary — 季节叙述（**编辑式 + 数据**，不是 4 张卡片）。
 *
 * CONTRACT §21：Season Summary 必须是"编辑判断 + 数据读数"的叙述，
 * 而不是把 Spring / Summer / Autumn / Winter 做成四张同构卡片。
 * 因此这里用**细线行**（每季一行，左侧季节名 + 月份，右侧数据读数 + 一句叙述），
 * 行首 hairline 取该季的装饰色（SEASON_TINT，纯装饰、aria-hidden 语义为空）。
 *
 * 数据诚实：每行的 Temperature / Precipitation 集合来自 NASA POWER canonical
 * 数值的确定性分桶；"in the recommended window" 计数来自 canonical
 * bestMonthsBaseline（R1–R7 派生）。
 */

export default function SeasonSummary({
  seasons,
  window: win,
  city,
}: {
  seasons: SeasonSummaryData[];
  window: WindowSummary;
  city: string;
}) {
  const rows = seasons.filter((s) => s.months.length > 0);
  if (rows.length === 0) return null;

  const windowSeasons =
    win.seasons.length > 0
      ? win.seasons.map((s) => seasonLabel(s)).join(" and ")
      : "no season";

  return (
    <div>
      <p className="max-w-[68ch] text-body leading-[1.6] text-ut-text-2">
        The recommended window ({win.label}) runs through {windowSeasons}. Below,
        each season is read on two axes: the NASA POWER climate normals for{" "}
        {city}&apos;s 1991–2020 record, and how much of it sits inside the
        canonical best-time window.
      </p>

      <ol className="mt-8">
        {rows.map((s) => {
          const inWindow = s.inWindowCount > 0;
          return (
            <li
              key={s.season}
              className="grid gap-x-12 gap-y-3 border-t py-6 first:border-t-0 first:pt-0 lg:grid-cols-12"
              style={{
                borderTopColor: `rgba(${SEASON_TINT[s.season]}, 0.45)`,
              }}
            >
              <div className="lg:col-span-4">
                <h3 className="font-display text-h3 leading-[var(--ut-text-h3--lh)] text-ut-ink">
                  {s.label}
                </h3>
                <p className="mt-2 font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
                  {s.monthNames}
                </p>
              </div>

              <div className="lg:col-span-8">
                <p className="font-mono text-body-sm text-ut-text">
                  {s.tempLevels.length > 0 ? s.tempLevels.join(" / ") : "—"}
                  <span className="text-ut-muted"> · </span>
                  {s.precipTendencies.length > 0
                    ? s.precipTendencies.join(" / ")
                    : "—"}
                  <span className="text-ut-muted"> precipitation</span>
                </p>
                {s.character && (
                  <p className="mt-3 max-w-[62ch] text-body leading-[1.6] text-ut-text-2">
                    {s.character}
                  </p>
                )}
                <p
                  className={[
                    "mt-3 font-mono text-micro uppercase tracking-[0.18em]",
                    inWindow ? "text-ut-accent-strong" : "text-ut-muted",
                  ].join(" ")}
                >
                  {inWindow
                    ? `${s.inWindowCount} of ${
                        s.months.length
                      } months inside the recommended window`
                    : "Outside the recommended window"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 max-w-[72ch] text-body-sm leading-[1.5] text-ut-subtle">
        Temperature and precipitation are 1991–2020 NASA POWER climate normals
        (qualitative buckets are derived from the monthly values); the season
        names follow the destination&apos;s hemisphere, and daylight hours are
        astronomical.
      </p>
    </div>
  );
}

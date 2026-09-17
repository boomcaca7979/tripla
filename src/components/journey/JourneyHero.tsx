import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@/data/trips";
import { capitalize, daysLabel, type JourneyLeg } from "./journey-state";

/**
 * JourneyHero — Journey Arrival（首屏）。
 *
 * CONTRACT：
 *   §8  首屏回答"这是一段怎样的旅程"：Journey eyebrow（mono）+ H1（Instrument
 *       Serif，唯一视觉焦点）+ 路线读数（城市/国家 · 天数 · 停靠点 · 节奏）+
 *       风格/兴趣读数 + 紧凑的旅程状态（leg 进度）。
 *   §8  首屏**禁止**：大段正文、蓝色 AI CTA、多个按钮、任何 commerce 入口。
 *       因此这里除唯一的「Plan this trip」规划入口外没有任何按钮。
 *
 *   Stage 3 §6.1 修订（Product Requirement）：Trip Detail 首屏必须明确给出
 *   **主 CTA = Plan this trip**（指向既有 planner 深链），因此本组件新增
 *   `planHref` 与 `image` 两个 prop：
 *     · planHref —— 唯一首屏行动入口，指向既有 `/` planner（buildJourneyPlannerHref）。
 *       它**不是** commerce 入口，也不新造 planner 能力。
 *     · image    —— 首图解析结果：`trip.coverImage` → `destination.image` → null。
 *       19 个 trip 有自有封面；+81 个可由真实目的地图片补足；其余仍走 journey band。
 *   §29 图片优先：有图 → next/image + preload（Next 16 起旧 priority 属性已
 *       deprecated）+ 精确 sizes + descriptive alt + scrim。
 *       无图 → **不使用假照片渐变**，改为 journey band：
 *       旅程色调 + 装饰性 route rail（呼应本页的 Journey Strip）+ 12 栏竖线 +
 *       底部 accent hairline，读起来像"一段路线的题头"，而不是"缺图的卡片"。
 *   §33 高度：mobile 30rem / sm 26rem / lg 28rem（image-led；不是 60vh）。
 *       Stage 3 上调口径（**实测驱动**，非审美偏好）：首屏新增 style/interests
 *       读数行 + 「Plan this trip」(44px) 后，文字块增高约 90px。按既有的
 *       "文字块 ≤ 80% 带高"约束重新标定，取全语料最坏标题
 *       （vietnam-north-5d 52 字符 3 行；europe-10d-highlights 50 字符 3 行且有图）
 *       在 390 / 768 / 1280 的实测值：
 *         390  ：旧 27rem(432px) → 文字块 380px = 88% ✗ → 30rem(480px) = 79% ✓
 *         768  ：旧 24rem(384px) → 文字块 330px = 86% ✗ → 26rem(416px) = 79% ✓
 *         1280 ：旧 27rem(432px) → 文字块 354px = 82% ✗ → 28rem(448px) = 79% ✓
 *       该约束的来源与测量口径见下方 §33/WCAG 段。
 *
 *   §33 / §WCAG 高度与 scrim 回归（实测驱动，非审美偏好）：
 *       全语料 280 个 trip 的 H1 最长 52 字符（vietnam-north-5d），在 390 宽度下
 *       折成 **3 行**（line-height ≈43px → 130px），整块文字（eyebrow→leg 进度）
 *       含底部内边距共 **268px**。旧高度 mobile 17rem = 272px 时，文字块占掉
 *       272px 中的 268px —— eyebrow 实测落在距底 93.6%–98.7% 处（即旧 scrim
 *       近乎透明的顶部），距上边缘仅 3px：既是 2.38:1 的对比度事故，也是"顶到
 *       边框"的版面事故。
 *       ① 高度提升到 **≥ 文字块 / 0.8**（268 / 0.8 ≈ 335px → 21rem），使最长
 *          标题下文字块也 ≤80% 带高，重新留出顶部照片带与呼吸位。
 *       ② scrim 改为"文字带全程 ≥0.72 + 78% 以上快速衰减"：
 *          有图 trip 的标题最长 32 字符（barcelona-art-architecture），实测文字块顶
 *          在 mobile / sm / lg 分别位于带高 ~67% / ~65% / ~63%，故 0.72@78% 留出
 *          ≥11% 余量；即便出现 3 行标题（文字顶 ~80%）此处仍 ~0.68 ——
 *          eyebrow(white/80) 在纯白照片上 ≈5.1:1，H1/route/leg 更高，全部 ≥AA。
 *          顶部 ~22% 带高归还给照片（对比修复前 0.90 veil 只留 10%）。
 *       口径：对比度按**元素真实白色透明度**（h1 1.0 / route .85 / eyebrow .80 /
 *       leg 状态 .75）在**最亮像素**上计算，而非纯白代理值 —— 见验收报告。
 */

/** Eyebrow 在图片 scrim 上需要 on-scrim 颜色，故显式给出类名（避免 class 覆盖冲突）。 */
const EYEBROW = "font-mono text-micro uppercase tracking-[0.18em]";

export default function JourneyHero({
  trip,
  legs,
  stops,
  pace,
  region,
  image,
  planHref,
}: {
  trip: Trip;
  legs: JourneyLeg[];
  stops: number;
  pace: string;
  region: string;
  /** 首图解析结果：trip.coverImage → destination.image → null */
  image: string | null;
  /** 唯一首屏规划入口（既有 planner 深链） */
  planHref: string;
}) {
  const hasImage = Boolean(image);
  const legCount = legs.length;
  const progressLabel = `Day 1 of ${trip.days}`;

  return (
    <header>
      <div
        className={[
          "relative isolate overflow-hidden rounded-ut-lg border border-ut-border",
          "h-[30rem] sm:h-[26rem] lg:h-[28rem]",
          hasImage ? "" : "bg-ut-surface",
        ].join(" ")}
      >
        {hasImage ? (
          <>
            <Image
              src={image as string}
              alt={`${trip.title} — ${trip.city}, ${trip.country}`}
              fill
              preload
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
            {/* Scrim（实测校准）：文字带全程保持 ≥0.72 的 veil，在 78%→100% 之间
                快速衰减，把顶部 ~22% 的带高还给照片。
                标定依据（见文件头 §WCAG）：文字块顶（eyebrow）在 mobile/sm/lg 分别
                位于距底 ~67% / ~65% / ~63%，故 0.72@78% 留出 ≥11% 余量；
                即使出现 3 行标题（文字顶 ~80%），此处仍有 ~0.68 → eyebrow(white/80)
                在纯白照片上 ≈5.1:1，仍达 AA。 */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,12,16,0.88) 0%, rgba(10,12,16,0.78) 54%, rgba(10,12,16,0.72) 78%, rgba(10,12,16,0.34) 93%, rgba(10,12,16,0.06) 100%)",
              }}
            />
          </>
        ) : (
          <>
            {/* 旅程氛围场：色相由 slug 确定性派生（--ut-journey-rgb），对比极低 */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(var(--ut-journey-rgb, 164, 81, 59), 0.13) 0%, rgba(var(--ut-journey-rgb, 164, 81, 59), 0.04) 46%, rgba(var(--ut-journey-rgb, 164, 81, 59), 0) 100%)",
              }}
            />
            {/* 装饰性 route rail：置于带顶部 12% 的空白区（照片带/氛围带内），
                避开正文——最长标题（3 行）时文字块顶部约在带高 20% 处。
                呼应下方 Journey Strip（纯装饰，不承载任何信息） */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-[12%] sm:inset-x-8 lg:inset-x-10"
            >
              <div
                className="h-px w-full"
                style={{
                  background: "rgba(var(--ut-journey-rgb, 164, 81, 59), 0.22)",
                }}
              />
              <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-between">
                {Array.from({ length: Math.max(legCount, 2) }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-ut-pill"
                    style={{
                      background: "rgba(var(--ut-journey-rgb, 164, 81, 59), 0.34)",
                    }}
                  />
                ))}
              </div>
            </div>
            {/* 12 栏空间感：极细竖线，仅 md+ */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden md:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(22,24,29,0.045) 0 1px, transparent 1px 80px)",
              }}
            />
            {/* 底部 accent hairline：旅程色，非蓝色、非渐变条幅 */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px"
              style={{
                background: "rgba(var(--ut-journey-rgb, 164, 81, 59), 0.5)",
              }}
            />
          </>
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
          <span className={`${EYEBROW} ${hasImage ? "text-white/80" : "text-ut-subtle"}`}>
            Journey · {region}
          </span>

          <h1
            className={[
              "mt-3 max-w-[22ch] font-display text-display-xl leading-[var(--ut-text-display-xl--lh)]",
              hasImage ? "text-white" : "text-ut-ink",
            ].join(" ")}
          >
            {trip.title}
          </h1>

          {/* Route readout：城市 · 天数 · 停靠点 · 节奏 —— 全部为真实字段/派生读数 */}
          <p
            className={[
              "mt-3 font-mono text-body-sm tabular-nums",
              hasImage ? "text-white/85" : "text-ut-text-2",
            ].join(" ")}
          >
            {trip.city}, {trip.country} · {daysLabel(trip.days)} · {stops} stops · {pace}
          </p>

          {/* Style / interests 读数 —— 受控枚举，全部来自真实字段 */}
          {trip.interests.length > 0 && (
            <p
              className={[
                "mt-2 font-mono text-label uppercase tracking-[0.16em]",
                hasImage ? "text-white/75" : "text-ut-muted",
              ].join(" ")}
            >
              {capitalize(trip.travelStyle)} · {trip.interests.map(capitalize).join(" · ")}
            </p>
          )}

          {/* Compact journey state：leg 进度（外观状态，SSR 确定性 = Day 1） */}
          <div className="mt-5 flex items-center gap-3">
            <span
              className={[
                "shrink-0 font-mono text-micro uppercase tracking-[0.18em]",
                hasImage ? "text-white/75" : "text-ut-muted",
              ].join(" ")}
            >
              {progressLabel}
            </span>
            <span
              className="flex min-w-0 flex-1 items-center gap-1"
              role="img"
              aria-label={`Journey progress: ${progressLabel}`}
            >
              {Array.from({ length: Math.max(trip.days, 1) }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-[3px] min-w-0 flex-1 rounded-ut-pill",
                    i === 0
                      ? hasImage
                        ? "bg-white"
                        : "bg-ut-accent"
                      : hasImage
                        ? "bg-white/30"
                        : "bg-ut-border-strong",
                  ].join(" ")}
                />
              ))}
            </span>
          </div>

          {/* 唯一首屏规划入口 —— Plan this trip → 既有 planner 深链（非 commerce） */}
          <div className="mt-6">
            <Link
              href={planHref}
              data-trip-primary-cta=""
              className={[
                "inline-flex min-h-[44px] items-center gap-2 rounded-ut-sm bg-ut-accent px-5",
                "text-body font-medium text-ut-inverse transition-colors duration-[var(--ut-dur-fast)] ease-ut-out",
                "hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2",
                hasImage ? "focus-visible:outline-white" : "focus-visible:outline-ut-accent",
              ].join(" ")}
            >
              Plan this trip
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

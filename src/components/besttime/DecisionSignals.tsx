/**
 * DecisionSignals — Best-time 首屏「紧凑气候 / 季节读数带」。
 *
 * CONTRACT：
 *   §4  第一屏 = Decision First：Breadcrumb → Decision eyebrow → H1 →
 *       destination context → best-month signal → **compact climate / season readout**。
 *       本组件就是最后那一层读数带：它把已经在上方给过的"决定"补充为
 *       可核对的仪器读数，而不是再讲一遍故事。
 *   §10 Environment Depth = 2：读数带的顶部 hairline 使用**季节色**
 *       （--ut-season-rgb，由 SeasonAtmosphere 提供），作为唯一的"气候/季节"氛围暗示；
 *       文本与数值本身仍使用中性 ink/text token，不做彩色读数。
 *       季节色只用于装饰性分隔线（aria-hidden / 无语义），不承载任何信息，
 *       因此不受 WCAG 文本对比约束（对比度审计以文本元素为准）。
 *   §17 Instrument Surface：mono 标签 + mono 数值 + 单像素分隔，无卡片、无阴影、无圆角盒。
 *
 * 数据诚实：每一项都由调用方传入的**真实字段或已标注派生的读数**构成，
 * 本组件不计算、不推断、不填充任何缺失值（缺失项由调用方省略）。
 */

export interface Signal {
  label: string;
  value: string;
  /** 可选：该项的来源标注（real / general pattern），用于区分真实与派生 */
  basis?: string;
}

export default function DecisionSignals({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) return null;

  return (
    <div
      className="border-t pt-5"
      style={{ borderTopColor: "rgba(var(--ut-season-rgb), 0.45)" }}
      data-ut-signals=""
    >
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {signals.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
              {s.label}
            </dt>
            <dd className="mt-2 font-mono text-body-sm leading-[1.4] text-ut-text">
              {s.value}
            </dd>
            {s.basis && (
              <dd className="mt-1 font-mono text-micro uppercase tracking-[0.16em] text-ut-subtle">
                {s.basis}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

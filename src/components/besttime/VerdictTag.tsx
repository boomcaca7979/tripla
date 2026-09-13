import { VERDICT_LABEL, type Verdict } from "./besttime-labels";

/**
 * VerdictTag — Best / Good / Mixed / Avoid 的**文本标签**呈现（非颜色标记）。
 *
 * CONTRACT §19/§20：推荐结果必须以**文字**表达（Best / Good / Mixed / Avoid），
 * 颜色只能是辅助。因此本组件的可访问名就是标签文字本身，色带 `aria-hidden`。
 *
 * 造型：1px 竖条 + mono 大写文字，无边框、无底色、无圆角 —— 它是仪器刻度，
 * 不是 chip / 卡片。四档颜色全部落在 ut-* token 内，且均满足 AA ≥4.5:1
 * （accent-strong #9a4a3a ≈5.84:1、text #23272f、muted #5b6473、ink #16181d）。
 */

const VERDICT_TEXT: Record<Verdict, string> = {
  best: "text-ut-accent-strong",
  good: "text-ut-text",
  mixed: "text-ut-muted",
  avoid: "text-ut-ink",
};

export default function VerdictTag({
  verdict,
  className = "",
}: {
  verdict: Verdict;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap font-mono text-micro uppercase tracking-[0.16em] ${VERDICT_TEXT[verdict]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-[12px] w-[2px] shrink-0 bg-current opacity-70"
      />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

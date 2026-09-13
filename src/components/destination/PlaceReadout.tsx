/**
 * PlaceReadout — Place Identity 的单个仪器读数格。
 *
 * CONTRACT（Destination Design Contract §14 / §17）：
 *   Place Identity 不是 4 张白卡，而是 mono readouts + 细分隔线 + 极细横线，
 *   读起来像仪器，而不是 dashboard。
 *
 * 可读性（§52 Accessibility）：
 *   标签用于**标识该读数的含义**（Local time / Season / Weather），属于信息而非
 *   纯装饰，因此使用 --ut-muted（暖面 5.30:1 / 纸面 5.68:1），而不是最低层级的
 *   --ut-subtle（4.61:1）。
 *   数值使用 --ut-text（16.9:1），保证仪器读数主体始终高对比。
 *   这里刻意不使用共享的 <Eyebrow>（其 text-ut-subtle 为硬编码，class 追加的
 *   覆盖结果取决于 CSS 生成顺序，不可靠），改为显式类名。
 *
 * 无 directive：由 server 组件（Region / Country）与 client 组件（Local time /
 * Season / Weather）共同复用 —— 纯展示，无状态、无副作用。
 */
export default function PlaceReadout({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 border-t border-ut-border px-4 py-3.5 sm:px-5 ${className}`}
    >
      <span className="font-mono text-micro uppercase tracking-[0.18em] text-ut-muted">
        {label}
      </span>
      <p className="mt-1.5 break-words font-mono text-body-sm tabular-nums text-ut-text">
        {value}
      </p>
    </div>
  );
}

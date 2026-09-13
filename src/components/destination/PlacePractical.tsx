/**
 * PlacePractical — Practical / Instrument Surface。
 *
 * CONTRACT §17：Practical 使用 Instrument Surface，但必须紧凑、清晰、安静，
 * 适合 Currency / Time zone / Transport / Typical duration / Budget range。
 * 禁止把每一项做成独立巨大 Card。
 *
 * 实现：定义式仪器栅格 —— mono 标签 + 等宽数值 + 单像素行分隔线，
 * 三列等宽使横线在 lg 下逐行对齐（读数表观感），无边框盒、无阴影、无圆角卡。
 *
 * 可读性：标签用于标识该行数据的含义，属信息而非装饰 → 使用 --ut-muted
 * （纸面 4.73:1），而非声明为 decoration-only 的 --ut-subtle。
 */
export default function PlacePractical({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  if (rows.length === 0) return null;

  return (
    <dl className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 border-t border-ut-border py-3.5"
        >
          <dt className="font-mono text-label uppercase tracking-[0.16em] text-ut-muted">
            {row.label}
          </dt>
          <dd className="text-right font-mono text-body-sm text-ut-text">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

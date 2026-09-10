import type { HTMLAttributes } from "react";

type StateChipVariant = "default" | "active" | "subtle";

interface StateChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** default = 静态状态；active = 呼吸点 + 强调（如 Live）；subtle = 低噪声标注 */
  variant?: StateChipVariant;
  /** 可选前缀圆点（active 变体默认带呼吸点） */
  dot?: boolean;
}

/**
 * StateChip — 状态徽章（Live / Local time / Seasonal / Updated…）。
 * 颜色一律来自 --ut-accent 的 alpha 层级，不建立独立色板。
 * 文字用 mono label 尺寸，保持"仪器标注"感且保证可读对比度。
 */
export default function StateChip({
  variant = "default",
  dot,
  className = "",
  children,
  ...rest
}: StateChipProps) {
  const showDot = dot ?? variant === "active";

  const surface: Record<StateChipVariant, string> = {
    default: "bg-ut-accent-soft text-ut-accent-strong",
    active: "bg-ut-accent-soft text-ut-accent-strong",
    subtle: "bg-ut-surface-hover text-ut-text-2",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-ut-pill px-2 py-0.5",
        "font-mono text-label tracking-wide",
        surface[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {showDot && (
        <span
          className={[
            "h-1.5 w-1.5 rounded-full bg-ut-accent",
            variant === "active" ? "ut-chip-pulse" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

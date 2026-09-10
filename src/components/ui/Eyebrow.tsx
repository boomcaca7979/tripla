import type { HTMLAttributes } from "react";

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** 附加一个小的 accent 前缀点（默认关闭） */
  dot?: boolean;
}

/**
 * Eyebrow — 10px 等宽大写微标签。
 * 仅用于装饰性 / 分组信息（section 标注、分类、元数据）。
 * 禁止承载价格、时间等关键信息（对比度刻意偏低）。
 */
export default function Eyebrow({ dot = false, className = "", children, ...rest }: EyebrowProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-mono uppercase",
        "text-micro tracking-[0.18em] text-ut-subtle",
        className,
      ].join(" ")}
      {...rest}
    >
      {dot && (
        <span
          className="h-1 w-1 rounded-full bg-ut-accent"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

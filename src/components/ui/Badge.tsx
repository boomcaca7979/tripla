import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "accent";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-ut-surface-hover text-ut-text-2",
  accent: "bg-ut-accent-soft text-ut-accent-strong",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-sky-100 text-sky-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-label",
  md: "px-2.5 py-1 text-body-sm",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={[
          "inline-flex items-center rounded-ut-pill font-medium",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
export default Badge;

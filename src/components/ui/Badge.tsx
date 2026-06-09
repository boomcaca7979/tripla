import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={[
          "inline-flex items-center rounded-full font-medium",
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

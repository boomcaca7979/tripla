import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

// 视觉全部来自 --ut-* token（经 @theme 映射为 ut-* 工具类）
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ut-accent text-ut-inverse hover:bg-ut-accent-strong focus-visible:ring-ut-accent",
  secondary:
    "bg-ut-surface-hover text-ut-text hover:bg-ut-border focus-visible:ring-ut-accent",
  ghost:
    "bg-transparent text-ut-text-2 hover:bg-ut-surface-hover focus-visible:ring-ut-accent",
  outline:
    "border border-ut-border-strong bg-transparent text-ut-text hover:border-ut-accent-line hover:text-ut-accent focus-visible:ring-ut-accent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-body-sm gap-1.5",
  md: "px-4 py-2 text-body-sm gap-2",
  lg: "px-6 py-3 text-body gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...rest }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center rounded-ut-sm font-medium",
          "transition-[background-color,color,border-color,box-shadow]",
          "duration-[var(--ut-dur-fast)] ease-ut-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].filter(Boolean).join(" ")}
        {...rest}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type CardVariant = "default" | "elevated" | "bordered";
type CardPadding = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white",
  elevated: "bg-white shadow-lg",
  bordered: "border border-gray-200 bg-white",
};

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={["rounded-xl", variantStyles[variant], paddingStyles[padding], className]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
export default Card;

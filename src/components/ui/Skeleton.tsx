import { forwardRef, type HTMLAttributes } from "react";

type SkeletonVariant = "text" | "circle" | "rect";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-ut-sm",
  circle: "rounded-full",
  rect: "rounded-ut-md",
};

// shimmer 由 .ut-skeleton 提供（transform-based，支持 reduced-motion 关闭）
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", width, height, className = "", style, ...rest }, ref) => {
    const resolvedWidth = typeof width === "number" ? `${width}px` : width;
    const resolvedHeight = typeof height === "number" ? `${height}px` : height;

    return (
      <div
        ref={ref}
        className={["ut-skeleton", variantStyles[variant], className].join(" ")}
        style={{
          ...(resolvedWidth ? { width: resolvedWidth } : {}),
          ...(resolvedHeight ? { height: resolvedHeight } : {}),
          ...style,
        }}
        aria-hidden="true"
        {...rest}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
export default Skeleton;

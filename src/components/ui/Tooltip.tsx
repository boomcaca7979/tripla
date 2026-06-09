import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: "left-1/2 top-full -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-b-gray-800 border-l-transparent border-r-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-4 border-t-4 border-b-4 border-l-gray-800 border-t-transparent border-b-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-4 border-t-4 border-b-4 border-r-gray-800 border-t-transparent border-b-transparent",
};

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, position = "top", children, className = "", ...rest }, ref) => {
    return (
      <div ref={ref} className={["group relative inline-flex", className].filter(Boolean).join(" ")} {...rest}>
        {children}
        <div
          role="tooltip"
          className={[
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-sm transition-opacity",
            "group-hover:opacity-100",
            positionStyles[position],
          ].join(" ")}
        >
          {content}
          <span className={["absolute h-0 w-0", arrowStyles[position]].join(" ")} aria-hidden="true" />
        </div>
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";
export default Tooltip;

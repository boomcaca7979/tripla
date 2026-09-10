import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = "", id: externalId, ...rest }, ref) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-medium text-ut-text-2">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="pointer-events-none absolute left-3 text-ut-muted">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={[
              "w-full rounded-ut-sm border bg-ut-surface px-3 py-2 text-body-sm",
              "text-ut-text placeholder:text-ut-subtle",
              "transition-[border-color,box-shadow] duration-[var(--ut-dur-fast)] ease-ut-out",
              "focus:outline-none focus-visible:ring-2",
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-ut-border hover:border-ut-border-strong focus-visible:ring-ut-accent",
              prefix ? "pl-10" : "",
              suffix ? "pr-10" : "",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ut-surface-hover",
              className,
            ].filter(Boolean).join(" ")}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 text-ut-muted">{suffix}</span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-body-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;

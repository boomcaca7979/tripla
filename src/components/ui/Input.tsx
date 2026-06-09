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
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="pointer-events-none absolute left-3 text-gray-500">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={[
              "w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-1 transition-colors",
              "focus:outline-none focus:ring-2",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400 focus:ring-blue-500",
              prefix ? "pl-10" : "",
              suffix ? "pr-10" : "",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            ].filter(Boolean).join(" ")}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 text-gray-500">{suffix}</span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;

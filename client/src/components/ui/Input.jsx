import { forwardRef, useId } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      id,
      name,
      type = "text",
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const inputClasses = [
      "block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900",
      "placeholder:text-slate-400",
      "transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      error
        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
        : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500",
      "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
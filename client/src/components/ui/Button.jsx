import { forwardRef } from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed";

const variantClasses = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",

  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",

  disabled:
    "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      type = "button",
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const classes = [
      baseClasses,
      variantClasses[variant] || variantClasses.primary,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || variant === "disabled"}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
const variantClasses = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  error: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  neutral: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

function Badge({ children, variant = "neutral", className = "" }) {
  const classes = [
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
    variantClasses[variant] || variantClasses.neutral,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}

export default Badge;
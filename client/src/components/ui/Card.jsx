function Card({ children, className = "", ...props }) {
  const classes = [
    "rounded-2xl border border-slate-200 bg-white shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export default Card;
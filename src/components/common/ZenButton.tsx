"use client";

import React from "react";

interface ZenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "sage";
  size?: "sm" | "md" | "lg";
}

/** الزر الهادئ — الحواف الانسيابية والانتقال الناعم بلا صخب */
export const ZenButton: React.FC<ZenButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none";

  const variants = {
    primary:
      "bg-zen-900 text-white hover:bg-zen-800 dark:bg-white dark:text-zen-900 shadow-sm",
    secondary:
      "bg-zen-100 text-zen-800 hover:bg-zen-200 dark:bg-zen-800 dark:text-zen-100",
    ghost:
      "bg-transparent text-zen-600 hover:bg-zen-100 dark:text-zen-400 dark:hover:bg-zen-800/60",
    danger:
      "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400",
    sage:
      "bg-sage-500 text-white hover:bg-sage-600 shadow-sm",
  } as const;

  const sizes = {
    sm: "px-3.5 py-2 text-sm gap-1.5",
    md: "px-5 py-3 text-base gap-2",
    lg: "w-full py-4 text-lg font-semibold gap-2",
  } as const;

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

"use client";

import React from "react";

/**
 * شعار بوصلة: دائرة مرسومة بخط ناعم غير مغلقة تماماً
 * ترمز لمسار قيد الاكتمال — مع إبرة اتجاه هادئة.
 */
export const CompassLogo: React.FC<{ size?: number; animate?: boolean }> = ({
  size = 96,
  animate = true,
}) => {
  const circumference = 2 * Math.PI * 58;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      role="img"
      aria-label="شعار بوصلة"
    >
      {/* الدائرة المفتوحة */}
      <circle
        cx="70"
        cy="70"
        r="58"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.82} ${circumference * 0.18}`}
        strokeDashoffset={animate ? circumference * 0.82 : undefined}
        transform="rotate(-56 70 70)"
        className={animate ? "animate-draw-compass" : ""}
        style={animate ? { strokeDashoffset: circumference * 0.18 * 0.4 } : undefined}
      />
      {/* إبرة الاتجاه */}
      <path d="M70 38 L80 70 L70 102 L60 70 Z" className="fill-zen-800 dark:fill-zen-100" />
      <path d="M70 38 L80 70 L70 70 Z" className="fill-emerald-500" />
      <circle
        cx="70"
        cy="70"
        r="7"
        className="fill-zen-50 dark:fill-zen-900 stroke-zen-800 dark:stroke-zen-100"
        strokeWidth="5"
      />
    </svg>
  );
};

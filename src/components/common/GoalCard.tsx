"use client";

import React from "react";
import type { Goal } from "@/lib/types";
import { getLifeArea } from "@/domain/lifeAreas";
import { LifeAreaIcon } from "./LifeAreaIcon";

interface GoalCardProps {
  goal: Goal;
  variant?: "long" | "short" | "plain";
  areaLabel?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  rank?: number;
}

/**
 * بطاقة الهدف الموحدة.
 * long: إطار زمردي هادئ (الهدف طويل الأمد الحصري).
 * short: إطار رمادي هادئ.
 * plain: بطاقة محايدة للقوائم.
 */
export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  variant = "plain",
  areaLabel = true,
  onClick,
  children,
  rank,
}) => {
  const area = getLifeArea(goal.lifeAreaId);

  const isLong = variant === "long" || (variant === "plain" && goal.term === "long" && goal.status === "active");
  const wrapper = isLong
    ? "p-5 rounded-3xl bg-white dark:bg-zen-800 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-xs relative overflow-hidden"
    : variant === "plain"
      ? "p-4 rounded-2xl bg-white dark:bg-zen-800/70 border border-zen-150 dark:border-zen-800 shadow-xs"
      : "p-5 rounded-3xl bg-white dark:bg-zen-800 border border-zen-200/80 dark:border-zen-700/80 shadow-xs";

  return (
    <div className={`${wrapper} ${onClick ? "cursor-pointer hover:border-zen-400 dark:hover:border-zen-500 transition-colors" : ""}`} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {rank !== undefined && (
            <span className={`w-6 h-6 shrink-0 grid place-items-center rounded-lg text-xs font-bold ${
              rank === 1
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                : "bg-zen-100 text-zen-500 dark:bg-zen-800 dark:text-zen-400"
            }`}>
              {rank}
            </span>
          )}
          {isLong ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 whitespace-nowrap">
              🌱 هدف طويل الأمد
            </span>
          ) : variant === "short" || (variant === "plain" && goal.term === "short" && goal.status === "active") ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 whitespace-nowrap">
              🎯 قصير الأمد
            </span>
          ) : null}
        </div>
        {areaLabel && area && (
          <span className="text-xs text-zen-400 whitespace-nowrap shrink-0">{area.labelAr}</span>
        )}
      </div>

      <h3
        className={`font-bold mt-1 text-zen-900 dark:text-white leading-snug break-words ${
          variant === "plain" ? "text-base" : "text-lg"
        }`}
      >
        {goal.title}
      </h3>

      {children}
    </div>
  );
};

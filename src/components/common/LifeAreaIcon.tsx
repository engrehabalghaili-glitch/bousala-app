"use client";

import React from "react";
import * as Icons from "lucide-react";
import { LIFE_AREAS, getLifeArea } from "@/domain/lifeAreas";

const IconMap = Icons as unknown as Record<
  string,
  React.FC<{ size?: number; className?: string; strokeWidth?: number }>
>;

interface LifeAreaIconProps {
  areaId: string | null;
  size?: number;
  /** حجم الحاوية الملونة */
  padded?: boolean;
  className?: string;
}

/** حل أيقونة الجانب ديناميكيًا مع الحاوية الملونة باستيل */
export const LifeAreaIcon: React.FC<LifeAreaIconProps> = ({
  areaId,
  size = 18,
  padded = true,
  className = "",
}) => {
  const area = getLifeArea(areaId);
  const IconComponent = area ? IconMap[area.iconName] || Icons.Circle : Icons.Circle;

  return (
    <div
      className={`${padded ? "p-2.5 rounded-xl" : ""} shrink-0 ${
        area ? area.colorClass : "text-zen-400 bg-zen-100 dark:bg-zen-800"
      } ${className}`}
    >
      <IconComponent size={size} />
    </div>
  );
};

export { LIFE_AREAS };

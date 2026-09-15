"use client";

import React from "react";
import { ZenSheet } from "@/components/common/ZenSheet";
import { GoalCard } from "@/components/common/GoalCard";
import { COPY_AR } from "@/content/copyAr";
import type { Goal } from "@/lib/types";

interface SelectGoalSheetProps {
  open: boolean;
  onClose: () => void;
  activeGoals: Goal[];
  onSelect: (goal: Goal) => void;
}

/** صفيحة اختيار الهدف — تعرض الخيارات الثلاثة النشطة فقط */
export const SelectGoalSheet: React.FC<SelectGoalSheetProps> = ({
  open,
  onClose,
  activeGoals,
  onSelect,
}) => {
  return (
    <ZenSheet open={open} onClose={onClose} title={COPY_AR.home.startExecution} closeLabel={COPY_AR.common.close}>
      <p className="text-sm text-zen-500 mb-4">{COPY_AR.home.selectGoal}</p>
      <div className="space-y-2.5">
        {activeGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            variant={goal.term === "long" ? "long" : "short"}
            onClick={() => onSelect(goal)}
          />
        ))}
      </div>
    </ZenSheet>
  );
};

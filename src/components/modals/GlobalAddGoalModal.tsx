"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { ZenSheet } from "@/components/common/ZenSheet";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";
import { toast } from "sonner";

interface GlobalAddGoalModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * نافذة الإضافة العائمة الشاملة:
 * تفرض قاعدة النظام الصارمة — «إضافة هدف لا تعني بدء تنفيذه الآن».
 * كل هدف جديد يُحفظ مباشرة في الـ backlog.
 */
export const GlobalAddGoalModal: React.FC<GlobalAddGoalModalProps> = ({ open, onClose }) => {
  const addBacklogGoal = useAppStore((s) => s.addBacklogGoal);
  const [goalTitle, setGoalTitle] = useState("");

  const handleSave = () => {
    if (!goalTitle.trim()) return;
    addBacklogGoal(goalTitle);
    setGoalTitle("");
    onClose();
    toast.success("حُفظ الهدف في قائمة الأهداف القادمة بهدوء");
  };

  return (
    <ZenSheet open={open} onClose={onClose} title={COPY_AR.addGoal.title} closeLabel={COPY_AR.common.close}>
      <input
        type="text"
        value={goalTitle}
        onChange={(e) => setGoalTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder={COPY_AR.addGoal.placeholder}
        aria-label={COPY_AR.addGoal.placeholder}
        autoFocus
        className="w-full p-4 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400 mb-4"
      />

      {/* إشعار فلسفة النظام */}
      <div className="flex gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs mb-6">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {COPY_AR.addGoal.philosophy}
        </p>
      </div>

      <ZenButton size="lg" onClick={handleSave} disabled={!goalTitle.trim()}>
        {COPY_AR.addGoal.save}
      </ZenButton>
    </ZenSheet>
  );
};

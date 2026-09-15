"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ZenButton } from "@/components/common/ZenButton";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";

interface WriteGoalsScreenProps {
  onNext: () => void;
}

/** شاشة تفريغ الذهن — إدخال كافة الرغبات دفعة واحدة بلا قيود أو أحكام أولية */
export const WriteGoalsScreen: React.FC<WriteGoalsScreenProps> = ({ onNext }) => {
  const goals = useAppStore((s) => s.goals);
  const addDraftGoal = useAppStore((s) => s.addDraftGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);

  const [currentInput, setCurrentInput] = useState("");
  const drafts = goals.filter((g) => g.status === "draft");

  const handleAdd = () => {
    if (!currentInput.trim()) return;
    addDraftGoal(currentInput.trim());
    setCurrentInput("");
  };

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-xl mx-auto min-h-dvh p-6 flex flex-col">
        <div className="flex-1 flex flex-col min-h-0">
          <header className="my-7 animate-fade-up">
            <span className="text-sm font-semibold tracking-wider text-sage-600">المرحلة الأولى</span>
            <h1 className="text-3xl font-bold mt-1">🎯 {COPY_AR.declutter.writeTitle}</h1>
            <p className="mt-3 text-zen-500 dark:text-zen-400 leading-relaxed text-sm">
              {COPY_AR.declutter.writeHint}
            </p>
          </header>

          {/* حقل الإدخال السريع */}
          <div className="relative flex items-center mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={COPY_AR.declutter.inputPlaceholder}
              aria-label={COPY_AR.declutter.inputPlaceholder}
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white dark:bg-zen-800 border border-zen-200 dark:border-zen-700 focus:outline-none focus:ring-2 focus:ring-zen-400 shadow-sm transition"
            />
            <button
              onClick={handleAdd}
              disabled={!currentInput.trim()}
              className="absolute left-3 bg-zen-900 dark:bg-white text-white dark:text-zen-900 p-2.5 rounded-xl hover:opacity-90 disabled:opacity-30 transition"
              aria-label="إضافة"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* سحابة الأهداف الحالية — تنزلق من الأعلى */}
          <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto zen-scroll pr-1 pb-4">
            {drafts.length === 0 && (
              <div className="h-full min-h-40 grid place-items-center text-center px-8">
                <p className="text-sm text-zen-400 leading-relaxed">
                  اكتب أول فكرة في الحقل أعلاه ثم اضغط <kbd className="px-1.5 py-0.5 rounded-md bg-zen-100 dark:bg-zen-800 text-[11px]">Enter</kbd>
                  <br />
                  هناك مساحة واسعة — لا حدّ لأفكارك هنا.
                </p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {drafts.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{ type: "spring", damping: 26, stiffness: 340 }}
                  className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-zen-800/70 rounded-2xl border border-zen-100 dark:border-zen-800 shadow-xs"
                >
                  <span className="text-base font-medium leading-snug break-words">{goal.title}</span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-zen-400 hover:text-rose-500 p-1 transition shrink-0"
                    aria-label={`حذف: ${goal.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* الشريط السفلي والعداد الهادئ */}
        <footer className="pt-4 border-t border-zen-200/60 dark:border-zen-800 mt-4">
          <div className="text-center mb-4 text-sm text-zen-500">
            لديك الآن{" "}
            <strong className="text-zen-900 dark:text-white font-bold">{drafts.length}</strong>{" "}
            {COPY_AR.common.goalsCount}
          </div>
          <ZenButton size="lg" disabled={drafts.length === 0} onClick={onNext}>
            {COPY_AR.declutter.writeDone}
            <ArrowLeft size={18} />
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

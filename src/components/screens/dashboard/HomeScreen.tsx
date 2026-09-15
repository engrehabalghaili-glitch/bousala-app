"use client";

import React, { useMemo, useState } from "react";
import { FolderKanban, Play, Plus, Sparkles } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { GoalCard } from "@/components/common/GoalCard";
import { SelectGoalSheet } from "@/components/modals/SelectGoalSheet";
import { ZenExecutionModal } from "@/components/modals/ZenExecutionModal";
import { GoalCompletedModal } from "@/components/modals/GoalCompletedModal";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";
import { toast } from "sonner";
import type { Goal } from "@/lib/types";

interface HomeScreenProps {
  onNavigateGoals: () => void;
  onAddGoal: () => void;
  onConfigureSeats: () => void;
}

/** الشاشة الرئيسية الهادئة — 3 بطاقات حصراً، بلا عدادات ولا مواعيد متبقية */
export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateGoals,
  onAddGoal,
  onConfigureSeats,
}) => {
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.goals);
  const logProgress = useAppStore((s) => s.logProgress);
  const completeGoal = useAppStore((s) => s.completeGoal);

  const [selectOpen, setSelectOpen] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<Goal | null>(null);
  const [celebration, setCelebration] = useState<{
    completed: Goal;
    suggestedNext: Goal | null;
  } | null>(null);

  const activeGoals = useMemo(
    () =>
      goals
        .filter((g) => g.status === "active")
        .sort((a, b) => (a.term === "long" ? -1 : b.term === "long" ? 1 : a.priorityRank - b.priorityRank)),
    [goals]
  );
  const backlogCount = goals.filter((g) => g.status === "backlog").length;

  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? COPY_AR.home.greetingMorning : COPY_AR.home.greetingEvening;

  const startSession = (goal: Goal) => {
    setSelectOpen(false);
    setSessionGoal(goal);
  };

  const handleSaveProgress = (note: string) => {
    if (!sessionGoal) return;
    logProgress(sessionGoal.id, note);
    toast.success(COPY_AR.session.saved);
    setSessionGoal(null);
  };

  const handleComplete = () => {
    if (!sessionGoal) return;
    const result = completeGoal(sessionGoal.id);
    setSessionGoal(null);
    if (result) {
      setCelebration({ completed: result.completed, suggestedNext: result.suggestedNext });
    }
  };

  return (
    <div className="bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100 min-h-dvh">
      <div className="max-w-lg mx-auto p-6 flex flex-col min-h-dvh pb-36">
        {/* الترويسة الترحيبية الهادئة */}
        <header className="pt-5 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-zen-900 dark:text-white">
              {greeting}، {profile?.name || "صديقي"} 👋
            </h1>
            <p className="text-sm text-zen-500 dark:text-zen-400 mt-1 leading-relaxed">
              {COPY_AR.home.calmPhrase}
            </p>
          </div>
          <button
            onClick={onNavigateGoals}
            aria-label="استعراض كل أهدافي"
            className="p-2.5 rounded-2xl bg-white dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-zen-600 dark:text-zen-400 hover:text-zen-900 dark:hover:text-white transition shrink-0"
          >
            <FolderKanban size={20} />
          </button>
        </header>

        {/* حاوية الأهداف النشطة الثلاثة الحصرية */}
        <div className="space-y-4 my-auto py-7">
          <div className="flex items-center justify-between text-xs text-zen-400 font-medium px-1">
            <span>
              {COPY_AR.home.activeLabel}{" "}
              <span className="text-zen-500 dark:text-zen-300">({activeGoals.length} {COPY_AR.home.maxNote})</span>
            </span>
            {activeGoals.length > 0 && (
              <span className="flex items-center gap-1 text-sage-600 dark:text-sage-500">
                <Sparkles size={14} />
                {COPY_AR.home.stableNote}
              </span>
            )}
          </div>

          {activeGoals.length === 0 ? (
            /* حالة الفراغ الهادئة — بلا لوم */
            <div className="p-8 rounded-3xl bg-white dark:bg-zen-800/60 border border-dashed border-zen-200 dark:border-zen-700 text-center animate-fade-up">
              <div className="text-3xl mb-3">🕊️</div>
              <h3 className="font-bold text-zen-800 dark:text-zen-200">مقاعدك الثلاثة شاغرة</h3>
              <p className="text-sm text-zen-500 dark:text-zen-400 mt-2 leading-relaxed">
                {backlogCount > 0
                  ? "لديك أهداف جاهزة في قائمة الانتظار. فعّل ما يستحق جهدك الآن."
                  : "ابدأ بإضافة فكرة جديدة، وسنرتبها معاً بهدوء."}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {backlogCount > 0 ? (
                  <ZenButton size="sm" onClick={onConfigureSeats}>
                    كوّن مقاعدك الثلاثة
                  </ZenButton>
                ) : (
                  <ZenButton size="sm" onClick={onAddGoal}>
                    <Plus size={15} />
                    أضف هدفك الأول
                  </ZenButton>
                )}
                {backlogCount > 0 && (
                  <ZenButton size="sm" variant="secondary" onClick={onNavigateGoals}>
                    استعرض القائمة
                  </ZenButton>
                )}
              </div>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                variant={goal.term === "long" ? "long" : "short"}
              />
            ))
          )}

          {/* دعوة خفيفة لملء المقاعد الشاغرة */}
          {activeGoals.length > 0 && activeGoals.length < 3 && backlogCount > 0 && (
            <button
              onClick={onConfigureSeats}
              className="w-full py-3 rounded-2xl border border-dashed border-zen-300 dark:border-zen-700 text-xs text-zen-500 dark:text-zen-400 hover:border-sage-500/50 hover:text-sage-600 dark:hover:text-sage-500 transition flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              لديك {backlogCount} هدفاً في الانتظار — املأ المقعد الشاغر
            </button>
          )}
        </div>

        {/* زر انطلاق جلسة التنفيذ */}
        {activeGoals.length > 0 && (
          <div className="pb-2">
            <ZenButton size="lg" onClick={() => setSelectOpen(true)}>
              <Play size={20} className="fill-current" />
              {COPY_AR.home.startExecution}
            </ZenButton>
          </div>
        )}
      </div>

      {/* الصفيحة والنوافذ */}
      <SelectGoalSheet
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        activeGoals={activeGoals}
        onSelect={startSession}
      />
      <ZenExecutionModal
        open={Boolean(sessionGoal)}
        goalTitle={sessionGoal?.title ?? ""}
        onClose={() => setSessionGoal(null)}
        onSaveProgress={handleSaveProgress}
        onCompleteGoal={handleComplete}
      />
      <GoalCompletedModal
        open={Boolean(celebration)}
        completedGoal={celebration?.completed ?? null}
        suggestedNext={celebration?.suggestedNext ?? null}
        onClose={() => setCelebration(null)}
        onReviewAll={() => {
          setCelebration(null);
          onNavigateGoals();
        }}
      />
    </div>
  );
};

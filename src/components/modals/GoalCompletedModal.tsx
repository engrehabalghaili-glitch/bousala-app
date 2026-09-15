"use client";

import React, { useState } from "react";
import { ArrowDown, Check, Sparkles } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { useAppStore } from "@/store/useAppStore";
import { backlogCandidates } from "@/domain/goalRules";
import { COPY_AR } from "@/content/copyAr";
import type { Goal } from "@/lib/types";

interface GoalCompletedModalProps {
  open: boolean;
  completedGoal: Goal | null;
  /** المرشح التالي المقترح (قصير الأمد) */
  suggestedNext: Goal | null;
  onClose: () => void;
  onReviewAll: () => void;
}

/**
 * نافذة الاحتفال بالإنجاز والترقية من قائمة الانتظار:
 * المقعد شاغر → تُعرض اقتراحات بنفس النوع، والتفعيل بضغطة واحدة.
 */
export const GoalCompletedModal: React.FC<GoalCompletedModalProps> = ({
  open,
  completedGoal,
  suggestedNext,
  onClose,
  onReviewAll,
}) => {
  const goals = useAppStore((s) => s.goals);
  const activateGoal = useAppStore((s) => s.activateGoal);

  const isLong = completedGoal?.term === "long";
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const longCandidates = isLong && completedGoal ? backlogCandidates("long", goals) : [];
  const effectiveCandidate = isLong
    ? longCandidates.find((g) => g.id === selectedCandidateId) ?? null
    : suggestedNext;

  const handleActivate = () => {
    if (!effectiveCandidate || !completedGoal) return;
    const res = activateGoal(effectiveCandidate.id, effectiveCandidate.term ?? (isLong ? "long" : "short"));
    if (res.ok) {
      onClose();
    }
  };

  if (!completedGoal) return null;

  const title = isLong ? COPY_AR.celebrate.titleLong : COPY_AR.celebrate.titleShort;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-zen-900 rounded-3xl p-7 text-center shadow-2xl border border-zen-200 dark:border-zen-800 my-auto animate-pop-in">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-pulse-soft">
            <Sparkles size={32} />
          </div>
          <span className="absolute -top-1 -right-1 text-amber-400 text-lg animate-pulse-soft" aria-hidden>✨</span>
          <span className="absolute -top-1 -left-1 text-amber-300 text-sm animate-pulse-soft" aria-hidden>⭐</span>
        </div>

        <h2 className="text-2xl font-bold text-zen-900 dark:text-white">{title}</h2>
        <p className="text-sm text-zen-500 mt-2 leading-relaxed">
          {COPY_AR.celebrate.subtitle}{" "}
          <span className="font-semibold text-zen-800 dark:text-zen-200">«{completedGoal.title}»</span>{" "}
          {COPY_AR.celebrate.subtitleAfter}
        </p>

        {/* قسم الترقية من قائمة الانتظار */}
        {isLong ? (
          longCandidates.length > 0 ? (
            <div className="my-6 text-right">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sage-600 mb-2.5">
                <ArrowDown size={14} />
                <span>{COPY_AR.celebrate.longPick}</span>
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto zen-scroll pr-1">
                {longCandidates.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedCandidateId(g.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-right transition ${
                      selectedCandidateId === g.id
                        ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20"
                        : "bg-zen-50 dark:bg-zen-800 border-zen-200 dark:border-zen-700 hover:border-zen-400"
                    }`}
                  >
                    <span className="w-6 h-6 shrink-0 grid place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold leading-snug">{g.title}</span>
                    {selectedCandidateId === g.id && (
                      <Check size={16} className="text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="my-6 p-4 rounded-2xl bg-zen-50 dark:bg-zen-800 text-sm text-zen-500">
              {COPY_AR.celebrate.noCandidate}
            </div>
          )
        ) : suggestedNext ? (
          <div className="my-6 p-4 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-right animate-fade-up">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sage-600 mb-1">
              <ArrowDown size={14} />
              <span>{COPY_AR.celebrate.seatFree}</span>
            </div>
            <p className="text-base font-bold text-zen-900 dark:text-white leading-snug">
              {suggestedNext.title}
            </p>
          </div>
        ) : (
          <div className="my-6 p-4 rounded-2xl bg-zen-50 dark:bg-zen-800 text-sm text-zen-500">
            {COPY_AR.celebrate.noCandidate}
          </div>
        )}

        <div className="space-y-2">
          {effectiveCandidate && (
            <ZenButton size="lg" onClick={handleActivate}>
              {COPY_AR.celebrate.activate}
            </ZenButton>
          )}
          <ZenButton variant="ghost" size="md" className="w-full" onClick={onReviewAll}>
            {COPY_AR.celebrate.review}
          </ZenButton>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zen-400 hover:text-zen-600 dark:hover:text-zen-300 transition"
          >
            {COPY_AR.celebrate.keepEmpty}
          </button>
        </div>
      </div>
    </div>
  );
};

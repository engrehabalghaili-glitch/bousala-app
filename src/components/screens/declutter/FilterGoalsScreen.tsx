"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Pause, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";

interface FilterGoalsScreenProps {
  onNext: () => void;
}

type DecisionKey = "keep" | "star" | "defer" | "exclude";

/** شاشة غربلة الأهداف — بطاقة تلو الأخرى، بلا حذف قسري: كل فكرة تُحفظ في مكانها */
export const FilterGoalsScreen: React.FC<FilterGoalsScreenProps> = ({ onNext }) => {
  const goals = useAppStore((s) => s.goals);
  const decideGoal = useAppStore((s) => s.decideGoal);

  const drafts = useMemo(
    () => goals.filter((g) => g.status === "draft").sort((a, b) => a.priorityRank - b.priorityRank),
    [goals]
  );
  // الإجمالي يُلتقط عند أول تركيب للشاشة (بعد بوابة الترطيب)
  const [total] = useState(() => drafts.length);
  const [exiting, setExiting] = useState<DecisionKey | null>(null);

  const current = drafts[0];
  const done = drafts.length === 0;

  // انتهاء الغربلة → الانتقال تلقائياً إلى الترتيب
  useEffect(() => {
    if (done) {
      const t = setTimeout(onNext, 350);
      return () => clearTimeout(t);
    }
  }, [done, onNext]);

  const decide = (key: DecisionKey) => {
    if (!current || exiting) return;
    setExiting(key);
    setTimeout(() => {
      if (key === "keep") {
        decideGoal(current.id, "backlog");
      } else if (key === "star") {
        decideGoal(current.id, "backlog");
      } else if (key === "defer") {
        decideGoal(current.id, "deferred");
      } else {
        decideGoal(current.id, "excluded");
      }
      setExiting(null);
    }, 260);
  };

  const DECISIONS: Array<{
    key: DecisionKey;
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    cls: string;
    star?: boolean;
  }> = [
    {
      key: "keep",
      icon: Check,
      label: COPY_AR.declutter.filterKeep,
      cls: "border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "star",
      icon: Star,
      label: COPY_AR.declutter.filterStar,
      cls: "border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400",
      star: true,
    },
    {
      key: "defer",
      icon: Pause,
      label: COPY_AR.declutter.filterDefer,
      cls: "border-zen-200 dark:border-zen-700 hover:bg-zen-100 dark:hover:bg-zen-800 text-zen-600 dark:text-zen-400",
    },
    {
      key: "exclude",
      icon: X,
      label: COPY_AR.declutter.filterExclude,
      cls: "border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 dark:text-rose-400",
    },
  ];

  if (done) {
    return (
      <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 grid place-items-center text-zen-400 text-sm">
        جارٍ الانتقال إلى الترتيب…
      </div>
    );
  }

  const processed = total - drafts.length;
  const progressPct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col">
        {/* المؤشر الهادئ */}
        <div className="w-full pt-4">
          <div className="flex justify-between items-center text-xs text-zen-400 mb-2">
            <span>مرحلة الغربلة</span>
            <span>
              {COPY_AR.common.remaining} {drafts.length} {COPY_AR.common.of} {total}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zen-200 dark:bg-zen-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* بطاقة الهدف المركزية */}
        <div className="my-auto py-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: exiting ? 0 : 1, y: exiting ? -18 : 0, scale: exiting ? 0.97 : 1 }}
              exit={{ opacity: 0, y: -22, scale: 0.96 }}
              transition={{ duration: 0.24 }}
              className="bg-white dark:bg-zen-800 border border-zen-200/80 dark:border-zen-700/60 rounded-3xl p-8 shadow-sm text-center"
            >
              <span className="text-xs font-semibold text-zen-400 uppercase tracking-wider block mb-3">
                {COPY_AR.declutter.filterQuestion}
              </span>
              <h2 className="text-2xl font-bold leading-snug break-words">{current.title}</h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* مصفوفة الخيارات الأربعة 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {DECISIONS.map(({ key, icon: Icon, label, cls, star }) => (
            <button
              key={key}
              onClick={() => decide(key)}
              disabled={Boolean(exiting)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-zen-800 border transition active:scale-[0.97] disabled:opacity-50 ${cls}`}
            >
              <Icon size={24} className="mb-1.5" />
              <span className="text-sm font-semibold text-center leading-snug">
                {star && "★ "}
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

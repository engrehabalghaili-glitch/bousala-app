"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { LIFE_AREAS } from "@/domain/lifeAreas";
import { COPY_AR } from "@/content/copyAr";

interface AssignLifeAreaScreenProps {
  onNext: () => void;
}

const IconMap = Icons as unknown as Record<string, React.FC<{ size?: number; className?: string }>>;

/** شاشة ربط الأهداف بالجوانب الـ 12 — نقرة واحدة تومض بالأخضر وينزلق الهدف التالي */
export const AssignLifeAreaScreen: React.FC<AssignLifeAreaScreenProps> = ({ onNext }) => {
  const goals = useAppStore((s) => s.goals);
  const assignLifeArea = useAppStore((s) => s.assignLifeArea);

  const backlog = useMemo(
    () =>
      goals
        .filter((g) => g.status === "backlog")
        .sort((a, b) => a.priorityRank - b.priorityRank),
    [goals]
  );

  const [index, setIndex] = useState(0);
  const [flashAreaId, setFlashAreaId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const done = backlog.length === 0 || index >= backlog.length;
  const current = done ? null : backlog[index];

  const advance = (dir = 1) => {
    setDirection(dir);
    setIndex((i) => {
      const next = i + dir;
      if (next >= backlog.length) {
        setTimeout(onNext, 240);
      }
      return Math.min(Math.max(next, 0), backlog.length);
    });
  };

  const pick = (areaId: string) => {
    if (!current) return;
    assignLifeArea(current.id, areaId);
    setFlashAreaId(areaId);
    setTimeout(() => {
      setFlashAreaId(null);
      advance();
    }, 320);
  };

  if (backlog.length === 0) {
    return (
      <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 grid place-items-center text-zen-400 text-sm">
        لا أهداف لربطها بالجوانب…
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 grid place-items-center text-zen-400 text-sm">
        جارٍ تجهيز ملخص الرؤية…
      </div>
    );
  }

  const progressPct = Math.round((index / backlog.length) * 100);

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-xl mx-auto min-h-dvh p-6 flex flex-col">
        <header className="my-6">
          <div className="flex justify-between items-center text-xs text-zen-400 mb-2">
            <span>الخطوة الرابعة — توزيع الجوانب</span>
            <span>
              الهدف {index + 1} {COPY_AR.common.of} {backlog.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zen-200 dark:bg-zen-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <h1 className="text-2xl font-bold mt-4">🌍 {COPY_AR.declutter.areasTitle}</h1>
          <p className="mt-2 text-sm text-zen-500 dark:text-zen-400">{COPY_AR.declutter.areasHint}</p>
        </header>

        {/* بطاقة الهدف الحالي المثبتة */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current!.id}
            initial={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? 32 : -32, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="bg-white dark:bg-zen-800 border border-zen-200/70 dark:border-zen-700 p-5 rounded-2xl shadow-xs mb-6 text-center"
          >
            <span className="text-xs text-zen-400 block mb-1">{COPY_AR.common.goalCurrent}</span>
            <p className="text-lg font-bold text-zen-900 dark:text-white leading-snug break-words">
              {current!.title}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* شبكة الجوانب الـ 12 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 content-start overflow-y-auto zen-scroll pb-4">
          {LIFE_AREAS.map((area) => {
            const IconComponent = IconMap[area.iconName] || Icons.Circle;
            const flashing = flashAreaId === area.id;
            return (
              <button
                key={area.id}
                onClick={() => pick(area.id)}
                disabled={Boolean(flashAreaId)}
                className={`flex flex-col items-center text-center p-4 rounded-2xl bg-white dark:bg-zen-800 border transition-all duration-200 group shadow-xs active:scale-[0.96] ${
                  flashing
                    ? "border-sage-500 bg-sage-50 dark:bg-sage-900/30 scale-[1.03] ring-2 ring-sage-500/40"
                    : "border-zen-150 dark:border-zen-700/60 hover:border-zen-400 dark:hover:border-zen-500"
                }`}
              >
                <div
                  className={`p-3 rounded-xl mb-2.5 transition-transform ${area.colorClass} ${
                    flashing ? "scale-110" : ""
                  }`}
                >
                  <IconComponent size={20} />
                </div>
                <span
                  className={`text-xs font-semibold leading-snug transition-colors ${
                    flashing
                      ? "text-sage-700 dark:text-sage-500"
                      : "text-zen-700 dark:text-zen-300 group-hover:text-zen-900 dark:group-hover:text-white"
                  }`}
                >
                  {area.labelAr}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="pt-3 pb-2 flex justify-center">
          <button
            onClick={() => advance()}
            className="text-xs text-zen-400 hover:text-zen-600 dark:hover:text-zen-300 px-4 py-2 rounded-xl hover:bg-zen-100 dark:hover:bg-zen-800 transition"
          >
            {COPY_AR.common.skip} — سأحدد الجانب لاحقاً
          </button>
        </footer>
      </div>
    </div>
  );
};

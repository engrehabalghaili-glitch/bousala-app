"use client";

import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";

interface SummaryScreenProps {
  onNext: () => void;
}

/** شاشة ملخص الرؤية الصافية — وثيقة صفاء رمزية تُظهر الفرق الفعلي من قاعدة البيانات */
export const SummaryScreen: React.FC<SummaryScreenProps> = ({ onNext }) => {
  const goals = useAppStore((s) => s.goals);

  const totalCount = goals.length;
  const accepted = goals.filter((g) => g.status === "backlog").length;
  const deferred = goals.filter((g) => g.status === "deferred").length;
  const excluded = goals.filter((g) => g.status === "excluded").length;
  const areasCovered = new Set(
    goals.filter((g) => g.status === "backlog" && g.lifeAreaId).map((g) => g.lifeAreaId)
  ).size;

  const stats = [
    { value: totalCount, label: "فكرة ورغبة بدأت بها" },
    { value: accepted, label: "هدفاً حقيقياً يستحق وقتك" },
    { value: areasCovered, label: "جوانب رئيسية في حياتك" },
  ];

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col justify-center">
        {/* بطاقة شهادة الصفاء */}
        <main className="bg-white dark:bg-zen-800/70 rounded-3xl border border-zen-150 dark:border-zen-800 shadow-sm p-8 text-center relative overflow-hidden animate-fade-up">
          {/* زخرفة علوية هادئة */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-emerald-400/70 via-sage-500/70 to-emerald-400/70" aria-hidden />

          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-sage-100 dark:bg-sage-900/40 text-sage-600 dark:text-sage-500 grid place-items-center animate-pulse-soft">
            <Sparkles size={30} />
          </div>

          <h1 className="text-2xl font-extrabold text-zen-900 dark:text-white">رؤيتك أصبحت صافية</h1>
          <p className="mt-3 text-sm text-zen-500 dark:text-zen-400 leading-relaxed">
            {COPY_AR.declutter.summaryEmpower}
          </p>

          {/* الإحصائيات الفعلية */}
          <div className="mt-7 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="py-4 px-2 rounded-2xl bg-zen-50 dark:bg-zen-900/60 border border-zen-100 dark:border-zen-800"
              >
                <p className="text-2xl font-extrabold text-zen-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-zen-400 mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          {/* تفاصيل الغربلة */}
          {(deferred > 0 || excluded > 0) && (
            <div className="mt-4 flex justify-center gap-2 text-[11px] text-zen-400">
              {deferred > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-zen-50 dark:bg-zen-900/60 border border-zen-100 dark:border-zen-800">
                  ⏸ {deferred} مؤجلة بأمان
                </span>
              )}
              {excluded > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-zen-50 dark:bg-zen-900/60 border border-zen-100 dark:border-zen-800">
                  ✕ {excluded} مستبعدة للأرشيف
                </span>
              )}
            </div>
          )}
        </main>

        <footer className="mt-8 pb-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <ZenButton size="lg" onClick={onNext}>
            {COPY_AR.declutter.summaryCta}
            <ArrowLeft size={18} />
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

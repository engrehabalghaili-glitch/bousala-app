"use client";

import React, { useMemo } from "react";
import { ListChecks, Rocket, Trophy } from "lucide-react";
import { LifeAreaIcon } from "@/components/common/LifeAreaIcon";
import { LIFE_AREAS } from "@/domain/lifeAreas";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";

const MAX_SCALE = 6;

/** خارطة التوازن الحياتي — مؤشرات الـ12 جانباً دون أسلوب التوبيخ أو درجات رسوب */
export const LifeBalanceScreen: React.FC = () => {
  const goals = useAppStore((s) => s.goals);

  const stats = useMemo(() => {
    const completed = goals.filter((g) => g.status === "completed").length;
    const active = goals.filter((g) => g.status === "active").length;
    const backlog = goals.filter((g) => g.status === "backlog").length;
    return [
      { icon: Trophy, label: COPY_AR.progress.statCompleted, value: completed, tone: "text-amber-500" },
      { icon: Rocket, label: COPY_AR.progress.statActive, value: active, tone: "text-emerald-500" },
      { icon: ListChecks, label: COPY_AR.progress.statBacklog, value: backlog, tone: "text-zen-500" },
    ];
  }, [goals]);

  const areaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of goals) {
      if (!g.lifeAreaId || g.status === "draft") continue;
      map[g.lifeAreaId] = (map[g.lifeAreaId] ?? 0) + 1;
    }
    return map;
  }, [goals]);

  return (
    <div className="bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100 min-h-dvh">
      <div className="max-w-lg mx-auto p-6 pb-36 min-h-dvh">
        <header className="pt-5">
          <h1 className="text-2xl font-bold text-zen-900 dark:text-white">{COPY_AR.progress.title}</h1>
          <p className="text-sm text-zen-500 dark:text-zen-400 mt-1 leading-relaxed">
            {COPY_AR.progress.subtitle}
          </p>
        </header>

        {/* الإحصائيات الإجمالية — بطاقات ناعمة */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {stats.map(({ icon: Icon, label, value, tone }) => (
            <div
              key={label}
              className="p-4 rounded-2xl bg-white dark:bg-zen-800/70 border border-zen-150 dark:border-zen-800 shadow-xs text-center"
            >
              <Icon size={18} className={`mx-auto mb-2 ${tone}`} />
              <p className="text-2xl font-extrabold text-zen-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-zen-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* أعمدة التوازن الـ 12 */}
        <div className="mt-6 space-y-2.5">
          <h2 className="text-sm font-bold text-zen-600 dark:text-zen-300 px-1 mb-3">
            توزيع اهتمامك على جوانب الحياة
          </h2>
          {LIFE_AREAS.map((area) => {
            const count = areaCounts[area.id] ?? 0;
            const percentage = Math.min((count / MAX_SCALE) * 100, 100);
            const isEmpty = count === 0;

            return (
              <div
                key={area.id}
                className={`p-3.5 rounded-2xl bg-white dark:bg-zen-800/70 border flex items-center gap-3.5 transition-opacity ${
                  isEmpty
                    ? "border-zen-100 dark:border-zen-800/70 opacity-55"
                    : "border-zen-150 dark:border-zen-800"
                }`}
              >
                <LifeAreaIcon areaId={area.id} size={18} />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5 gap-2">
                    <span className="truncate">{area.labelAr}</span>
                    <span className="text-zen-400 whitespace-nowrap shrink-0">
                      {count > 0 ? `${count} ${COPY_AR.progress.goalsCount}` : COPY_AR.progress.noGoals}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zen-100 dark:bg-zen-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isEmpty
                          ? "bg-zen-300 dark:bg-zen-600"
                          : "bg-zen-900 dark:bg-white"
                      }`}
                      style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* رسالة تشجيعية بلا لوم */}
        <p className="text-center text-[11px] text-zen-400 mt-6 leading-relaxed px-6">
          الجوانب الباهتة ليست تقصيراً — بل دعوة لطيفة لمنحها رعايتها متى ما شعرت بأن الوقت مناسب.
        </p>
      </div>
    </div>
  );
};

"use client";

import React, { useMemo, useState } from "react";
import { Archive, BookMarked, ListChecks, PauseCircle, Rocket } from "lucide-react";
import { GoalCard } from "@/components/common/GoalCard";
import { GoalDetailSheet } from "@/components/modals/GoalDetailSheet";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";
import type { Goal } from "@/lib/types";

interface AllGoalsScreenProps {
  initialTab?: GoalTab;
}

export type GoalTab = "active" | "backlog" | "long" | "deferred" | "excluded";

const TAB_ICONS: Record<GoalTab, React.FC<{ size?: number; className?: string }>> = {
  active: Rocket,
  backlog: ListChecks,
  long: BookMarked,
  deferred: PauseCircle,
  excluded: Archive,
};

/** المستودع الشامل — تصفح كافة الأفكار عبر تبويبات أفقية قابلة للتمرير */
export const AllGoalsScreen: React.FC<AllGoalsScreenProps> = ({ initialTab = "active" }) => {
  const goals = useAppStore((s) => s.goals);
  const [tab, setTab] = useState<GoalTab>(initialTab);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  const groups = useMemo(() => {
    const byStatus = (status: string) =>
      goals.filter((g) => g.status === status).sort((a, b) => a.priorityRank - b.priorityRank);

    return {
      active: byStatus("active"),
      backlog: byStatus("backlog"),
      long: goals.filter((g) => g.status === "backlog" && g.term === "long").sort((a, b) => a.priorityRank - b.priorityRank),
      deferred: byStatus("deferred"),
      excluded: byStatus("excluded"),
    };
  }, [goals]);

  const tabs: Array<{ key: GoalTab; label: string; count: number }> = [
    { key: "active", label: COPY_AR.goals.tabs.active, count: groups.active.length },
    { key: "backlog", label: COPY_AR.goals.tabs.backlog, count: groups.backlog.length },
    { key: "long", label: COPY_AR.goals.tabs.long, count: groups.long.length },
    { key: "deferred", label: COPY_AR.goals.tabs.deferred, count: groups.deferred.length },
    { key: "excluded", label: COPY_AR.goals.tabs.excluded, count: groups.excluded.length },
  ];

  const current = groups[tab];

  return (
    <div className="bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100 min-h-dvh">
      <div className="max-w-lg mx-auto p-6 pb-36 min-h-dvh">
        <header className="pt-5 mb-5">
          <h1 className="text-2xl font-bold text-zen-900 dark:text-white">{COPY_AR.goals.title}</h1>
          <p className="text-sm text-zen-500 dark:text-zen-400 mt-1">
            كل أفكارك في مكان واحد — اضغط أي هدف لعرض تفاصيله وتعديله أو نقله بين القوائم.
          </p>
        </header>

        {/* التبويبات الأفقية القابلة للتمرير */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1"
          role="tablist"
          aria-label="قوائم الأهداف"
        >
          {tabs.map(({ key, label, count }) => {
            const Icon = TAB_ICONS[key];
            const isActive = tab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all duration-200 ${
                  isActive
                    ? "bg-zen-900 dark:bg-white text-white dark:text-zen-900 border-zen-900 dark:border-white"
                    : "bg-white dark:bg-zen-800/70 text-zen-600 dark:text-zen-300 border-zen-150 dark:border-zen-800 hover:border-zen-400"
                }`}
              >
                <Icon size={14} />
                {label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-white/20 dark:bg-zen-900/15" : "bg-zen-100 dark:bg-zen-800 text-zen-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* قائمة الأهداف */}
        <main className="space-y-2.5 mt-3" role="tabpanel">
          {current.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-zen-800/60 border border-dashed border-zen-200 dark:border-zen-700 text-center">
              <div className="text-3xl mb-3 opacity-70">{tab === "active" ? "🪴" : tab === "long" ? "🏔️" : tab === "deferred" ? "⏸️" : tab === "excluded" ? "🗄️" : "📭"}</div>
              <p className="text-sm text-zen-500 dark:text-zen-400 leading-relaxed max-w-xs mx-auto">
                {COPY_AR.goals.empty[tab]}
              </p>
            </div>
          ) : (
            current.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                rank={tab === "backlog" || tab === "long" ? idx + 1 : undefined}
                onClick={() => setDetailGoal(goal)}
              />
            ))
          )}
        </main>
      </div>

      <GoalDetailSheet goal={detailGoal} onClose={() => setDetailGoal(null)} />
    </div>
  );
};

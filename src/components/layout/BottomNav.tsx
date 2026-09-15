"use client";

import React from "react";
import { ChartPie, Compass, FolderKanban, Plus, Settings } from "lucide-react";

export type TabKey = "home" | "goals" | "progress" | "settings";

interface BottomNavProps {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
  onAddGoal: () => void;
}

const TABS: Array<{ key: TabKey; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }> = [
  { key: "home", label: "الرئيسية", icon: Compass },
  { key: "goals", label: "كل أهدافي", icon: FolderKanban },
  { key: "progress", label: "خارطة الحياة", icon: ChartPie },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

/** شريط التنقل السفلي الدائم + زر الإضافة العائم المدمج في المنتصف */
export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate, onAddGoal }) => {
  const left = TABS.slice(0, 2); // تُعرض يمينًا في RTL
  const right = TABS.slice(2); // تُعرض يسارًا في RTL

  const TabButton = ({ tab }: { tab: (typeof TABS)[number] }) => {
    const isActive = active === tab.key;
    const Icon = tab.icon;
    return (
      <button
        onClick={() => onNavigate(tab.key)}
        aria-label={tab.label}
        aria-current={isActive ? "page" : undefined}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-200 ${
          isActive
            ? "text-zen-900 dark:text-white"
            : "text-zen-400 hover:text-zen-600 dark:hover:text-zen-300"
        }`}
      >
        <span
          className={`p-2 rounded-xl transition-all duration-200 ${
            isActive ? "bg-zen-100 dark:bg-zen-800" : "bg-transparent"
          }`}
        >
          <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
        </span>
        <span className={`text-[10px] font-semibold ${isActive ? "opacity-100" : "opacity-70"}`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
    >
      <div className="max-w-lg mx-auto px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="pointer-events-auto relative flex items-end justify-between gap-1 rounded-3xl border border-zen-200/70 dark:border-zen-800 bg-white/85 dark:bg-zen-900/85 backdrop-blur-lg shadow-lg shadow-zen-900/5 px-2 pt-1.5 pb-1.5">
          {left.map((t) => (
            <TabButton key={t.key} tab={t} />
          ))}

          {/* الزر العائم الإضافي — وظيفته حصرية طرح الأهداف إلى قائمة الانتظار */}
          <div className="relative shrink-0 w-16 flex justify-center">
            <button
              onClick={onAddGoal}
              aria-label="إضافة هدف جديد إلى قائمة الانتظار"
              className="absolute -top-7 w-14 h-14 rounded-full bg-zen-900 dark:bg-white text-white dark:text-zen-900 grid place-items-center shadow-xl shadow-zen-900/25 ring-4 ring-white dark:ring-zen-900 transition-transform duration-200 active:scale-95 hover:scale-[1.04]"
            >
              <Plus size={26} strokeWidth={2.4} />
            </button>
            <span className="h-9" aria-hidden />
          </div>

          {right.map((t) => (
            <TabButton key={t.key} tab={t} />
          ))}
        </div>
      </div>
    </nav>
  );
};

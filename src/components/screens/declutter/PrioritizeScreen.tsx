"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Link2, Unlink } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { useAppStore } from "@/store/useAppStore";
import { isDependencyOrdered } from "@/domain/goalRules";
import { COPY_AR } from "@/content/copyAr";
import type { Goal } from "@/lib/types";

interface PrioritizeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

/** بطاقة قابلة للسحب مع مقبض نقطي وأرقام أولوية ذهبية ورمادية */
const SortableGoalRow: React.FC<{
  goal: Goal;
  rank: number;
  dependencyLabel: string | null;
}> = ({ goal, rank, dependencyLabel }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: goal.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zen-800 border transition-shadow ${
        isDragging
          ? "border-sage-500/50 shadow-lg shadow-sage-500/10 z-10 relative"
          : "border-zen-150 dark:border-zen-800 shadow-xs"
      }`}
    >
      {/* رقم الأولوية */}
      <span
        className={`w-7 h-7 shrink-0 grid place-items-center rounded-lg text-sm font-extrabold transition-colors ${
          rank === 1
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
            : "bg-zen-100 text-zen-500 dark:bg-zen-800/80 dark:text-zen-400"
        }`}
      >
        {rank}
      </span>

      <p className="flex-1 text-sm font-semibold leading-snug break-words">{goal.title}</p>

      {dependencyLabel && (
        <span className="hidden sm:inline text-[10px] px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 whitespace-nowrap">
          ⇦ {dependencyLabel}
        </span>
      )}

      {/* مقبض السحب النقطي */}
      <button
        {...attributes}
        {...listeners}
        aria-label={`اسحب لإعادة ترتيب: ${goal.title}`}
        className="p-2 -m-1 text-zen-300 dark:text-zen-600 hover:text-zen-500 dark:hover:text-zen-400 touch-none cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>
    </div>
  );
};

/** شاشة ترتيب الأولويات بالسحب والإفلات + تنبيه الاعتمادية الذكي */
export const PrioritizeScreen: React.FC<PrioritizeScreenProps> = ({ onNext, onBack }) => {
  const goals = useAppStore((s) => s.goals);
  const reorderBacklog = useAppStore((s) => s.reorderBacklog);
  const setDependency = useAppStore((s) => s.setDependency);

  const backlog = useMemo(
    () =>
      goals
        .filter((g) => g.status === "backlog")
        .sort((a, b) => a.priorityRank - b.priorityRank),
    [goals]
  );

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [movedGoalId, setMovedGoalId] = useState<string | null>(null);
  const [depAlertGoalId, setDepAlertGoalId] = useState<string | null>(null);
  const [showDepPicker, setShowDepPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const orderedIds = localOrder ?? backlog.map((g) => g.id);
  const orderedGoals = orderedIds
    .map((id) => backlog.find((g) => g.id === id))
    .filter((g): g is Goal => Boolean(g));

  const onDragStart = (_e: DragStartEvent) => {
    // اهتزاز خفيف في الهواتف
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        /* تجاهل */
      }
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setLocalOrder(next);
    reorderBacklog(next);
    setMovedGoalId(active.id as string);

    // فحص الاعتمادية: هل الهدف المُقدَّم يعتمد على هدف متأخر؟
    const moved = backlog.find((g) => g.id === active.id);
    if (moved) {
      const refreshed = { ...moved, priorityRank: newIndex + 1 };
      if (!isDependencyOrdered(refreshed, goals)) {
        setDepAlertGoalId(moved.id);
      }
    }
  };

  const depGoal = backlog.find((g) => g.id === depAlertGoalId) ?? null;

  // حالة القائمة الفارغة
  if (backlog.length === 0) {
    return (
      <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
        <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col justify-center text-center gap-6">
          <div>
            <div className="text-4xl mb-4">🕊️</div>
            <h1 className="text-xl font-bold">لم تبقَ أهداف مقبولة في القائمة</h1>
            <p className="text-sm text-zen-500 mt-2 leading-relaxed">
              كل أفكارك إما مؤجلة أو مستبعدة. عد وأضف ما يستحق جهدك، أو تابع لإعادة التفكير.
            </p>
          </div>
          <ZenButton size="lg" onClick={onBack}>
            العودة لكتابة الأهداف
          </ZenButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col">
        <header className="my-6 animate-fade-up">
          <span className="text-sm font-semibold tracking-wider text-sage-600">الخطوة الثالثة</span>
          <h1 className="text-2xl font-bold mt-1">🪜 {COPY_AR.declutter.prioritizeTitle}</h1>
          <p className="mt-2 text-sm text-zen-500 dark:text-zen-400 leading-relaxed">
            {COPY_AR.declutter.prioritizeHint}
          </p>
        </header>

        {/* تنبيه الاعتمادية الذكي */}
        {depGoal && (
          <div className="mb-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 animate-fade-up">
            <p className="text-xs font-semibold leading-relaxed">
              «{COPY_AR.declutter.dependencyAsk}» — <span className="font-bold">{depGoal.title}</span>
            </p>
            {!showDepPicker ? (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowDepPicker(true)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 transition font-semibold"
                >
                  نعم، ربطه بهدف
                </button>
                <button
                  onClick={() => {
                    setDepAlertGoalId(null);
                    setMovedGoalId(null);
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  لا، ترتيبه صحيح
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-1.5 max-h-44 overflow-y-auto zen-scroll">
                {backlog
                  .filter((g) => g.id !== depGoal.id)
                  .map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setDependency(depGoal.id, g.id);
                        setDepAlertGoalId(null);
                        setMovedGoalId(null);
                        setShowDepPicker(false);
                      }}
                      className="w-full text-right text-xs px-3 py-2 rounded-xl bg-white dark:bg-zen-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition font-medium"
                    >
                      <Link2 size={12} className="inline ml-1.5 -mt-0.5" />
                      {g.title}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* قائمة السحب والإفلات */}
        <main className="flex-1 min-h-0 overflow-y-auto zen-scroll pb-4 space-y-2.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              {orderedGoals.map((goal, idx) => {
                const dep = goal.dependsOnGoalId
                  ? goals.find((g) => g.id === goal.dependsOnGoalId)
                  : null;
                return (
                  <SortableGoalRow
                    key={goal.id}
                    goal={goal}
                    rank={idx + 1}
                    dependencyLabel={dep ? `يعتمد على: ${dep.title}` : null}
                  />
                );
              })}
            </SortableContext>
          </DndContext>

          {/* إزالة الاعتمادية إن وُجدت */}
          {movedGoalId && (() => {
            const g = goals.find((x) => x.id === movedGoalId);
            return g?.dependsOnGoalId ? (
              <button
                onClick={() => setDependency(g.id, null)}
                className="w-full text-xs text-zen-400 hover:text-rose-500 py-2 transition flex items-center justify-center gap-1"
              >
                <Unlink size={13} />
                إزالة اعتمادية «{g.title}»
              </button>
            ) : null;
          })()}
        </main>

        <footer className="pt-4 border-t border-zen-200/60 dark:border-zen-800">
          <ZenButton size="lg" onClick={onNext}>
            {COPY_AR.common.next}
            <ArrowLeft size={18} />
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

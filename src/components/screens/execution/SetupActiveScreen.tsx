"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Check, Sprout, Target } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { LifeAreaIcon } from "@/components/common/LifeAreaIcon";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";
import { toast } from "sonner";
import type { Goal, GoalTerm } from "@/lib/types";

interface SetupActiveScreenProps {
  onNext: () => void;
}

/** شاشة تكوين الأهداف النشطة: مقعد طويل واحد (اختياري) + مقعدان قصيران — يفرض canActivate دائمًا */
export const SetupActiveScreen: React.FC<SetupActiveScreenProps> = ({ onNext }) => {
  const goals = useAppStore((s) => s.goals);
  const activateGoal = useAppStore((s) => s.activateGoal);
  const setGoalTerm = useAppStore((s) => s.setGoalTerm);

  const backlog = useMemo(
    () =>
      goals
        .filter((g) => g.status === "backlog")
        .sort((a, b) => a.priorityRank - b.priorityRank),
    [goals]
  );

  const [longSeat, setLongSeat] = useState<string | null>(null);
  const [shortSeats, setShortSeats] = useState<string[]>([]);

  const toggle = (goal: Goal, seat: GoalTerm) => {
    if (seat === "long") {
      const next = longSeat === goal.id ? null : goal.id;
      setLongSeat(next);
      setGoalTerm(goal.id, next ? "long" : null);
      if (next) {
        // إزالته من المقاعد القصيرة إن كان هناك
        setShortSeats((prev) => prev.filter((id) => id !== goal.id));
      }
      return;
    }

    if (shortSeats.includes(goal.id)) {
      setGoalTerm(goal.id, null);
      setShortSeats((prev) => prev.filter((id) => id !== goal.id));
      return;
    }
    if (shortSeats.length >= 2) {
      toast.info("مقعدا القصير الأمد مشغولان — أزل اختيارًا أولًا");
      return;
    }
    setGoalTerm(goal.id, "short");
    setShortSeats((prev) => [...prev, goal.id]);
    if (longSeat === goal.id) setLongSeat(null);
  };

  const handleStart = () => {
    const selected: Array<{ id: string; term: GoalTerm }> = [];
    if (longSeat) selected.push({ id: longSeat, term: "long" });
    shortSeats.forEach((id) => selected.push({ id, term: "short" }));

    for (const s of selected) {
      const res = activateGoal(s.id, s.term);
      if (!res.ok) {
        toast.error(res.reason || "تعذّر التفعيل");
        return;
      }
    }
    onNext();
  };

  const totalSelected = (longSeat ? 1 : 0) + shortSeats.length;

  const SeatRow: React.FC<{ goal: Goal; seat: GoalTerm; selected: boolean; disabled?: boolean }> = ({
    goal,
    seat,
    selected,
    disabled,
  }) => (
    <button
      onClick={() => toggle(goal, seat)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all duration-200 active:scale-[0.99] disabled:opacity-35 disabled:pointer-events-none ${
        selected
          ? seat === "long"
            ? "border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/20"
            : "border-blue-400/50 bg-blue-50/60 dark:bg-blue-950/20"
          : "bg-white dark:bg-zen-800/70 border-zen-150 dark:border-zen-800 hover:border-zen-300 dark:hover:border-zen-700"
      }`}
    >
      <LifeAreaIcon areaId={goal.lifeAreaId} size={16} />
      <p className="flex-1 text-sm font-semibold leading-snug break-words">{goal.title}</p>
      <span
        className={`w-6 h-6 shrink-0 grid place-items-center rounded-lg border-2 transition ${
          selected
            ? seat === "long"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-blue-500 border-blue-500 text-white"
            : "border-zen-200 dark:border-zen-700"
        }`}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col">
        <header className="my-6 animate-fade-up">
          <span className="text-sm font-semibold tracking-wider text-sage-600">الخطوة الأخيرة</span>
          <h1 className="text-2xl font-bold mt-1">🪑 {COPY_AR.execution.setupTitle}</h1>
          <p className="mt-2 text-sm text-zen-500 dark:text-zen-400 leading-relaxed">
            {COPY_AR.execution.setupHint}
          </p>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto zen-scroll pb-4 space-y-6">
          {/* مقعد الهدف طويل الأمد */}
          <section>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-sm font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Sprout size={16} />
                {COPY_AR.execution.seatLong}
              </h2>
              <span className="text-[11px] text-zen-400">{COPY_AR.execution.seatLongOptional}</span>
            </div>
            <div className="space-y-2">
              {backlog.map((g) => (
                <SeatRow key={g.id} goal={g} seat="long" selected={longSeat === g.id} />
              ))}
            </div>
          </section>

          {/* مقعدا الهدفين قصيرا الأمد */}
          <section>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-sm font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                <Target size={16} />
                {COPY_AR.execution.seatShort}
              </h2>
              <span className="text-[11px] text-zen-400">
                {shortSeats.length}/2 — {COPY_AR.execution.seatShortHint}
              </span>
            </div>
            <div className="space-y-2">
              {backlog.map((g) => (
                <SeatRow
                  key={g.id}
                  goal={g}
                  seat="short"
                  selected={shortSeats.includes(g.id)}
                  disabled={!shortSeats.includes(g.id) && shortSeats.length >= 2}
                />
              ))}
            </div>
          </section>
        </main>

        <footer className="pt-4 border-t border-zen-200/60 dark:border-zen-800 space-y-2">
          <ZenButton size="lg" disabled={totalSelected === 0} onClick={handleStart}>
            {COPY_AR.execution.startJourney}
            <ArrowLeft size={18} />
          </ZenButton>
          <ZenButton variant="ghost" size="md" className="w-full" onClick={onNext}>
            {COPY_AR.execution.later}
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

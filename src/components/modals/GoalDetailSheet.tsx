"use client";

import React, { useMemo, useState } from "react";
import { CalendarOff, Check, Clock4, Pencil, Sprout, Target } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { ZenSheet } from "@/components/common/ZenSheet";
import { LifeAreaIcon } from "@/components/common/LifeAreaIcon";
import { useAppStore } from "@/store/useAppStore";
import { canActivate } from "@/domain/goalRules";
import { getLifeArea, LIFE_AREAS } from "@/domain/lifeAreas";
import { COPY_AR } from "@/content/copyAr";
import { toast } from "sonner";
import type { Goal, GoalStatus } from "@/lib/types";

interface GoalDetailSheetProps {
  goal: Goal | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<GoalStatus, string> = {
  draft: "مسودة",
  excluded: "مستبعدة",
  deferred: "مؤجلة",
  backlog: "في القادمة",
  active: "نشطة الآن",
  completed: "منجزة",
};

/** الغلاف الخارجي: يبقى مركّباً لحفظ حركة الإغلاق، والداخل يُعاد بناؤه مع كل هدف */
export const GoalDetailSheet: React.FC<GoalDetailSheetProps> = ({ goal, onClose }) => {
  return (
    <ZenSheet
      open={Boolean(goal)}
      onClose={onClose}
      title={goal ? STATUS_LABEL[goal.status] : undefined}
      closeLabel={COPY_AR.common.close}
    >
      {goal && <GoalDetailInner key={goal.id} goal={goal} onClose={onClose} />}
    </ZenSheet>
  );
};

const GoalDetailInner: React.FC<{ goal: Goal; onClose: () => void }> = ({ goal, onClose }) => {
  const goals = useAppStore((s) => s.goals);
  const logs = useAppStore((s) => s.logs);
  const updateGoalTitle = useAppStore((s) => s.updateGoalTitle);
  const assignLifeArea = useAppStore((s) => s.assignLifeArea);
  const setGoalTerm = useAppStore((s) => s.setGoalTerm);
  const moveGoal = useAppStore((s) => s.moveGoal);
  const activateGoal = useAppStore((s) => s.activateGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const setDependency = useAppStore((s) => s.setDependency);

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [showAreaGrid, setShowAreaGrid] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goalLogs = useMemo(
    () => logs.filter((l) => l.goalId === goal.id).sort((a, b) => b.createdAt - a.createdAt),
    [logs, goal.id]
  );

  const dependencyGoal = goal.dependsOnGoalId
    ? goals.find((g) => g.id === goal.dependsOnGoalId) ?? null
    : null;

  const backlogs = goals.filter((g) => g.status === "backlog" && g.id !== goal.id);
  const activation = canActivate({ ...goal }, goals);

  const handleActivate = () => {
    const res = activateGoal(goal.id, goal.term ?? "short");
    if (res.ok) {
      toast.success("نُشِّط الهدف — انطلق بهدوء");
      onClose();
    } else {
      toast.error(res.reason);
    }
  };

  const statusActions: Array<{ label: string; target: GoalStatus; tone: "secondary" | "ghost" | "danger" }> = [];
  if (goal.status === "active") {
    statusActions.push({ label: "إرجاعه إلى القادمة", target: "backlog", tone: "secondary" });
    statusActions.push({ label: "تأجيل", target: "deferred", tone: "ghost" });
  }
  if (goal.status === "backlog") {
    statusActions.push({ label: "تأجيل", target: "deferred", tone: "ghost" });
    statusActions.push({ label: "استبعاد", target: "excluded", tone: "ghost" });
  }
  if (goal.status === "deferred" || goal.status === "excluded" || goal.status === "completed") {
    statusActions.push({ label: "إعادة إلى القادمة", target: "backlog", tone: "secondary" });
  }

  return (
    <div>
      {/* العنوان والتعديل */}
      {editing ? (
        <div className="flex gap-2 mb-1">
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            className="flex-1 p-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400"
            autoFocus
          />
          <ZenButton
            size="sm"
            onClick={() => {
              updateGoalTitle(goal.id, titleDraft);
              setEditing(false);
              toast.success("حُدِّث العنوان");
            }}
          >
            <Check size={15} />
          </ZenButton>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-lg font-bold leading-snug text-zen-900 dark:text-white break-words">
            {goal.title}
          </h2>
          <button
            onClick={() => setEditing(true)}
            aria-label={COPY_AR.goals.actions.edit}
            className="p-2 rounded-xl text-zen-400 hover:text-zen-600 dark:hover:text-zen-300 hover:bg-zen-100 dark:hover:bg-zen-800 transition shrink-0"
          >
            <Pencil size={16} />
          </button>
        </div>
      )}

      {/* الجانب الحالي */}
      <button
        onClick={() => setShowAreaGrid((v) => !v)}
        className="mt-3 w-full flex items-center gap-3 p-3 rounded-2xl bg-zen-50 dark:bg-zen-800/70 border border-zen-100 dark:border-zen-800 hover:border-zen-300 dark:hover:border-zen-700 transition text-right"
      >
        <LifeAreaIcon areaId={goal.lifeAreaId} size={16} />
        <span className="flex-1 text-xs font-semibold text-zen-600 dark:text-zen-300">
          {getLifeArea(goal.lifeAreaId)?.labelAr ?? COPY_AR.common.noArea}
        </span>
        <span className="text-[10px] text-zen-400">{showAreaGrid ? "إخفاء" : "تغيير"}</span>
      </button>

      {/* شبكة اختيار الجانب */}
      {showAreaGrid && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {LIFE_AREAS.map((area) => {
            const selected = goal.lifeAreaId === area.id;
            return (
              <button
                key={area.id}
                onClick={() => {
                  assignLifeArea(goal.id, selected ? null : area.id);
                  setShowAreaGrid(false);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition ${
                  selected
                    ? "border-sage-500 bg-sage-50 dark:bg-sage-900/30"
                    : "border-zen-150 dark:border-zen-800 hover:border-zen-300"
                }`}
              >
                <LifeAreaIcon areaId={area.id} size={14} />
                <span className="text-[9px] font-semibold leading-tight text-zen-600 dark:text-zen-300">
                  {area.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* النوع: طويل/قصير (متاح فقط قبل الإنجاز) */}
      {goal.status !== "completed" && goal.status !== "active" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setGoalTerm(goal.id, goal.term === "long" ? null : "long")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold border transition ${
              goal.term === "long"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                : "border-zen-150 dark:border-zen-800 text-zen-500 hover:border-emerald-400/50"
            }`}
          >
            <Sprout size={14} />
            {COPY_AR.goals.actions.setLong}
          </button>
          <button
            onClick={() => setGoalTerm(goal.id, goal.term === "short" ? null : "short")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold border transition ${
              goal.term === "short"
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500/40 text-blue-700 dark:text-blue-400"
                : "border-zen-150 dark:border-zen-800 text-zen-500 hover:border-blue-400/50"
            }`}
          >
            <Target size={14} />
            {COPY_AR.goals.actions.setShort}
          </button>
        </div>
      )}

      {/* الاعتمادية */}
      {goal.status === "backlog" && (
        <div className="mt-3">
          {dependencyGoal ? (
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-snug">
                ⇦ يعتمد على: <span className="font-bold">{dependencyGoal.title}</span>
              </p>
              <button
                onClick={() => setDependency(goal.id, null)}
                aria-label="إزالة الاعتمادية"
                className="text-[10px] text-blue-500 hover:text-blue-700 shrink-0 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
              >
                إزالة
              </button>
            </div>
          ) : backlogs.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setDependency(goal.id, e.target.value);
              }}
              className="w-full p-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-xs text-zen-500 dark:text-zen-400 focus:outline-none"
            >
              <option value="">⤷ يعتمد على هدف آخر (اختياري)…</option>
              {backlogs.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* تفعيل من القادمة */}
      {goal.status === "backlog" && (
        <div className="mt-4">
          <ZenButton size="lg" onClick={handleActivate} disabled={!activation.ok} title={activation.reason}>
            {COPY_AR.goals.actions.activate}
          </ZenButton>
          {!activation.ok && (
            <p className="text-[11px] text-zen-400 text-center mt-2 leading-relaxed">{activation.reason}</p>
          )}
        </div>
      )}

      {/* سجل التقدم */}
      {goalLogs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-bold text-zen-500 dark:text-zen-400 mb-2.5 flex items-center gap-1.5">
            <Clock4 size={13} />
            سجل التقدم ({goalLogs.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto zen-scroll pr-1">
            {goalLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-zen-50 dark:bg-zen-800/70 border border-zen-100 dark:border-zen-800"
              >
                <p className="text-xs leading-relaxed text-zen-700 dark:text-zen-300">{log.note}</p>
                <p className="text-[10px] text-zen-400 mt-1.5">
                  {new Date(log.createdAt).toLocaleDateString("ar", { day: "numeric", month: "long" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ملاحظة الفلسفة: بلا مواعيد */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-zen-400 justify-center">
        <CalendarOff size={13} />
        لا موعد نهائي لهذا الهدف — استمرّ على راحتك.
      </div>

      {/* نقل الحالة */}
      {statusActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {statusActions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                moveGoal(goal.id, a.target);
                onClose();
              }}
              className="text-xs px-3.5 py-2 rounded-xl bg-zen-100 dark:bg-zen-800 text-zen-700 dark:text-zen-300 hover:bg-zen-200 dark:hover:bg-zen-700 transition font-medium"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* الحذف النهائي */}
      <div className="mt-6 pt-4 border-t border-zen-100 dark:border-zen-800">
        {confirmDelete ? (
          <div className="flex gap-2">
            <ZenButton
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => {
                deleteGoal(goal.id);
                onClose();
                toast.success("حُذف الهدف نهائياً");
              }}
            >
              نعم، حذف نهائي
            </ZenButton>
            <ZenButton variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              {COPY_AR.common.cancel}
            </ZenButton>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full text-xs text-zen-400 hover:text-rose-500 transition py-1.5"
          >
            {COPY_AR.goals.actions.delete}
          </button>
        )}
      </div>
    </div>
  );
};

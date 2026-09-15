/**
 * قواعد الأعمال الحاكمة — قلب النظام المنطقي
 *
 * الفرض دائمًا في الكود لا في التصميم فقط:
 * 1. الأهداف النشطة ≤ 3 دائمًا (هدف طويل واحد + هدفان قصيران).
 * 2. لا يتحول هدف إلى active إلا من backlog.
 * 3. عند الإنجاز يُفتح مقعد ويُعرض أفضل مرشح من backlog (اقتراح، دون تفعيل تلقائي).
 * 4. لا مواعيد نهائية، لا كميات، لا مؤقتات — الاستمرارية قبل كل شيء.
 */

import type { Goal, GoalTerm } from "@/lib/types";

export const MAX_ACTIVE_GOALS = 3;
export const MAX_ACTIVE_LONG = 1;
export const MAX_ACTIVE_SHORT = 2;

/** عدد الأهداف النشطة حسب نوعها */
export function countActive(goals: Goal[]): { long: number; short: number; total: number } {
  const active = goals.filter((g) => g.status === "active");
  const long = active.filter((g) => g.term === "long").length;
  const short = active.filter((g) => g.term === "short").length;
  return { long, short, total: long + short };
}

/** هل يمكن تنشيط هذا الهدف الآن؟ */
export function canActivate(
  goal: Pick<Goal, "id" | "status" | "term">,
  allGoals: Goal[]
): { ok: boolean; reason?: string } {
  if (goal.status !== "backlog") {
    return { ok: false, reason: "لا يمكن تفعيل الهدف إلا من قائمة الأهداف القادمة." };
  }
  const term: GoalTerm = goal.term ?? "short";
  const counts = countActive(allGoals);
  if (counts.total >= MAX_ACTIVE_GOALS) {
    return { ok: false, reason: "المقاعد الثلاثة مشغولة بالكامل. أتمّ أحد أهدافك أولًا ليتصفّد غيره." };
  }
  if (term === "long" && counts.long >= MAX_ACTIVE_LONG) {
    return { ok: false, reason: "لا يمكن أن يوجد أكثر من هدف طويل الأمد واحد نشط." };
  }
  if (term === "short" && counts.short >= MAX_ACTIVE_SHORT) {
    return { ok: false, reason: "مقعدا القصير الأمد مشغولان بالكامل." };
  }
  return { ok: true };
}

/** أفضل مرشّح للترقية بعد إنجاز هدف — نفس النوع، أعلى أولوية من backlog */
export function suggestNextGoal(
  completedTerm: GoalTerm,
  allGoals: Goal[]
): Goal | null {
  const candidates = allGoals
    .filter((g) => g.status === "backlog")
    .filter((g) => (g.term ?? "short") === completedTerm)
    .sort((a, b) => a.priorityRank - b.priorityRank);
  return candidates[0] ?? null;
}

/** كل مرشّحي نفس النوع من backlog (للاختيار بعد إنجاز الهدف الطويل) */
export function backlogCandidates(term: GoalTerm, allGoals: Goal[]): Goal[] {
  return allGoals
    .filter((g) => g.status === "backlog")
    .filter((g) => (g.term ?? "short") === term)
    .sort((a, b) => a.priorityRank - b.priorityRank);
}

/** اقتراح اعتمادية بسيط بالكلمات المفتاحية — نسخة أولى خفيفة */
export function suggestDependency(
  goalTitle: string,
  existingGoals: Goal[]
): Goal | null {
  const clean = goalTitle.replace(/[إأآا]/g, "ا").replace(/[ىي]/g, "ي").trim();
  if (clean.length < 4) return null;
  const tokens = clean
    .split(/\s+/)
    .map((t) => t.replace(/[^\u0621-\u064Aa-zA-Z0-9]/g, ""))
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return null;

  let best: { goal: Goal; score: number } | null = null;
  for (const g of existingGoals) {
    if (!g.title) continue;
    const gTitle = g.title.replace(/[إأآا]/g, "ا").replace(/[ىي]/g, "ي");
    let score = 0;
    for (const t of tokens) {
      if (gTitle.includes(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { goal: g, score };
    }
  }
  return best && best.score >= 2 ? best.goal : null;
}

/** هل اعتمادية الهدف مرتّبة (يقع المعتمد عليه قبله في الترتيب)؟ */
export function isDependencyOrdered(goal: Goal, allGoals: Goal[]): boolean {
  if (!goal.dependsOnGoalId) return true;
  const dep = allGoals.find((g) => g.id === goal.dependsOnGoalId);
  if (!dep) return true;
  return dep.priorityRank < goal.priorityRank;
}

/** إعادة احتساب أولويات قائمة مرتبة */
export function recomputeRanks(goals: Goal[]): Goal[] {
  return goals.map((g, i) => ({ ...g, priorityRank: i + 1 }));
}

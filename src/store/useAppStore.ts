"use client";

/**
 * المخزن المركزي — Zustand + persist (localStorage)
 * Offline Vault: كل البيانات محلية 100% بلا حسابات ولا خوادم.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  AppSettings,
  BackupPayload,
  FilterDecision,
  Goal,
  GoalStatus,
  GoalTerm,
  ProgressLog,
  UserProfile,
} from "@/lib/types";
import { canActivate, recomputeRanks, suggestNextGoal } from "@/domain/goalRules";

const SCHEMA_VERSION = 1;

const defaultSettings: AppSettings = {
  id: "singleton",
  theme: "system",
  language: "ar",
};

function newGoal(title: string, status: GoalStatus, rank: number): Goal {
  return {
    id: uuidv4(),
    title,
    status,
    term: null,
    lifeAreaId: null,
    priorityRank: rank,
    dependsOnGoalId: null,
    createdAt: Date.now(),
    activatedAt: null,
    completedAt: null,
    lastTouchedAt: null,
  };
}

export interface AppState {
  hydrated: boolean;
  profile: UserProfile | null;
  settings: AppSettings;
  goals: Goal[];
  logs: ProgressLog[];

  // الملف الشخصي
  saveProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;

  // الأهداف
  addDraftGoal: (title: string) => void;
  addBacklogGoal: (title: string) => void;
  decideGoal: (id: string, decision: FilterDecision) => void;
  reorderBacklog: (orderedIds: string[]) => void;
  setDependency: (goalId: string, dependsOnGoalId: string | null) => void;
  assignLifeArea: (goalId: string, areaId: string | null) => void;
  setGoalTerm: (goalId: string, term: GoalTerm | null) => void;
  updateGoalTitle: (goalId: string, title: string) => void;
  moveGoal: (goalId: string, status: GoalStatus) => void;
  activateGoal: (goalId: string, term: GoalTerm) => { ok: boolean; reason?: string };
  completeGoal: (goalId: string) => { completed: Goal; suggestedNext: Goal | null } | null;
  logProgress: (goalId: string, note: string) => void;
  deleteGoal: (goalId: string) => void;

  // الإعدادات والبيانات
  setThemeMode: (theme: AppSettings["theme"]) => void;
  exportBackup: () => BackupPayload;
  importBackup: (raw: string) => { ok: boolean; error?: string };
  resetAll: () => void;
  seedDemo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: null,
      settings: defaultSettings,
      goals: [],
      logs: [],

      saveProfile: (patch) =>
        set((s) => ({
          profile: {
            id: "singleton",
            name: "",
            age: null,
            fieldOfStudyOrWork: "",
            lifeDream: "",
            avatarDataUrl: null,
            onboardingCompleted: false,
            createdAt: Date.now(),
            ...s.profile,
            ...patch,
          },
        })),

      completeOnboarding: () => {
        get().saveProfile({ onboardingCompleted: true });
      },

      addDraftGoal: (title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => {
          const draftCount = s.goals.filter((g) => g.status === "draft").length;
          return { goals: [newGoal(t, "draft", draftCount + 1), ...s.goals] };
        });
      },

      addBacklogGoal: (title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => {
          const backlogCount = s.goals.filter((g) => g.status === "backlog").length;
          return { goals: [newGoal(t, "backlog", backlogCount + 1), ...s.goals] };
        });
      },

      decideGoal: (id, decision) =>
        set((s) => {
          const backlogCount = s.goals.filter((g) => g.status === "backlog").length;
          const deferredCount = s.goals.filter((g) => g.status === "deferred").length;
          const rank =
            decision === "backlog" ? backlogCount + 1 : decision === "deferred" ? deferredCount + 1 : 0;
          return {
            goals: s.goals.map((g) => (g.id === id ? { ...g, status: decision, priorityRank: rank } : g)),
          };
        }),

      reorderBacklog: (orderedIds) =>
        set((s) => {
          const backlog = orderedIds
            .map((id) => s.goals.find((g) => g.id === id))
            .filter((g): g is Goal => Boolean(g));
          const ranked = recomputeRanks(backlog);
          const rankMap = new Map(ranked.map((g) => [g.id, g.priorityRank]));
          return {
            goals: s.goals.map((g) =>
              rankMap.has(g.id) ? { ...g, priorityRank: rankMap.get(g.id)! } : g
            ),
          };
        }),

      setDependency: (goalId, dependsOnGoalId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, dependsOnGoalId: dependsOnGoalId === goalId ? null : dependsOnGoalId } : g
          ),
        })),

      assignLifeArea: (goalId, areaId) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, lifeAreaId: areaId } : g)),
        })),

      setGoalTerm: (goalId, term) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, term } : g)),
        })),

      updateGoalTitle: (goalId, title) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId && title.trim() ? { ...g, title: title.trim() } : g
          ),
        })),

      moveGoal: (goalId, status) =>
        set((s) => {
          const countInTarget = s.goals.filter((g) => g.status === status).length;
          return {
            goals: s.goals.map((g) => {
              if (g.id !== goalId) return g;
              const next: Goal = { ...g, status, priorityRank: countInTarget + 1 };
              if (status === "active") {
                next.activatedAt = Date.now();
              }
              if (status === "backlog" && g.status === "active") {
                next.activatedAt = null;
              }
              return next;
            }),
          };
        }),

      activateGoal: (goalId, term) => {
        const { goals } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return { ok: false, reason: "الهدف غير موجود." };
        const check = canActivate({ ...goal, term }, goals);
        if (!check.ok) return { ok: false, reason: check.reason };
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  status: "active",
                  term,
                  activatedAt: Date.now(),
                  lastTouchedAt: Date.now(),
                }
              : g
          ),
        }));
        return { ok: true };
      },

      completeGoal: (goalId) => {
        const { goals } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal || goal.status !== "active") return null;
        const term: GoalTerm = goal.term ?? "short";
        const completedGoal: Goal = {
          ...goal,
          status: "completed",
          completedAt: Date.now(),
          lastTouchedAt: Date.now(),
        };
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goalId ? completedGoal : g)),
        }));
        const suggestedNext = suggestNextGoal(term, get().goals);
        return { completed: completedGoal, suggestedNext };
      },

      logProgress: (goalId, note) => {
        const n = note.trim();
        if (!n) return;
        set((s) => ({
          logs: [{ id: uuidv4(), goalId, note: n, createdAt: Date.now() }, ...s.logs],
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, lastTouchedAt: Date.now() } : g
          ),
        }));
      },

      deleteGoal: (goalId) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== goalId),
          logs: s.logs.filter((l) => l.goalId !== goalId),
        })),

      setThemeMode: (theme) =>
        set((s) => ({ settings: { ...s.settings, theme } })),

      exportBackup: () => {
        const { goals, logs, profile, settings } = get();
        return {
          goals,
          progressLogs: logs,
          userProfile: profile ? [profile] : [],
          settings: [settings],
          exportedAt: Date.now(),
          schemaVersion: SCHEMA_VERSION,
        };
      },

      importBackup: (raw) => {
        try {
          const data = JSON.parse(raw) as BackupPayload;
          if (!data || typeof data !== "object" || !Array.isArray(data.goals)) {
            return { ok: false, error: "invalid" };
          }
          const profile: UserProfile | null =
            Array.isArray(data.userProfile) && data.userProfile.length > 0
              ? { ...data.userProfile[0], id: "singleton" }
              : null;
          const settings: AppSettings =
            Array.isArray(data.settings) && data.settings.length > 0
              ? { ...data.settings[0], id: "singleton" }
              : defaultSettings;
          set({
            goals: data.goals,
            logs: Array.isArray(data.progressLogs) ? data.progressLogs : [],
            profile,
            settings,
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "parse" };
        }
      },

      resetAll: () =>
        set({
          profile: null,
          goals: [],
          logs: [],
          settings: defaultSettings,
        }),

      seedDemo: () => {
        const now = Date.now();
        const mk = (
          title: string,
          status: GoalStatus,
          term: GoalTerm | null,
          lifeAreaId: string | null,
          priorityRank: number,
          extra?: Partial<Goal>
        ): Goal => ({
          id: uuidv4(),
          title,
          status,
          term,
          lifeAreaId,
          priorityRank,
          dependsOnGoalId: null,
          createdAt: now - Math.floor(Math.random() * 20 + 5) * 86400000,
          activatedAt: status === "active" ? now - 6 * 86400000 : null,
          completedAt: status === "completed" ? now - 2 * 86400000 : null,
          lastTouchedAt: status === "active" ? now - 86400000 : null,
          ...extra,
        });

        const goals: Goal[] = [
          mk("إتقان بنية واجهات التطبيقات الحديثة", "active", "long", "career", 1),
          mk("إنهاء دراسة مرجع بنية البيانات", "active", "short", "career", 2),
          mk("المشي المنتظم بعد العصر", "active", "short", "health", 3),
          mk("تعلم أساسيات شبكات الحاسب", "backlog", "short", "career", 1),
          mk("حفظ جزأين من القرآن الكريم", "backlog", "short", "spirituality", 2),
          mk("بناء صندوق طوارئ يغطي 6 أشهر", "backlog", "long", "finance", 3),
          mk("رحلة تخييم في الجوف", "backlog", "short", "travel", 4),
          mk("تعلّم أساسيات التصميم", "backlog", null, "personal", 5),
          mk("كتابة وصية وتنظيم الإرث العائلي", "backlog", "long", "legacy", 6),
          mk("قراءة 20 صفحة يومياً", "completed", "short", "personal", 1),
          mk("ترتيب المكتب المنزلي", "completed", "short", "lifestyle", 2),
          mk("زيارة الأجداد كل أسبوع", "deferred", null, "family", 1),
          mk("تعلم العزف على البيانو", "deferred", null, "personal", 2),
          mk("متابعة كل أخبار التقنية يومياً", "excluded", null, "tech", 1),
        ];

        const logs: ProgressLog[] = [
          {
            id: uuidv4(),
            goalId: goals[1].id,
            note: "أنهيت الفصل الخامس — القوائم المترابطة وتطبيقاتها",
            createdAt: now - 86400000,
          },
          {
            id: uuidv4(),
            goalId: goals[0].id,
            note: "قرأت واستوعبت نمط Server Components وقررت استخدامه",
            createdAt: now - 2 * 86400000,
          },
          {
            id: uuidv4(),
            goalId: goals[2].id,
            note: "مشيت مسار الحي كاملاً وطاب الجو",
            createdAt: now - 3 * 86400000,
          },
          {
            id: uuidv4(),
            goalId: goals[9].id,
            note: "أنهيت الجزء الثلاثين كاملاً بفضل الثبات الهادئ",
            createdAt: now - 2 * 86400000,
          },
        ];

        set({
          profile: {
            id: "singleton",
            name: "عمرو",
            age: 24,
            fieldOfStudyOrWork: "طالب هندسة حاسب",
            lifeDream: "أن أبني منتجاً تقنياً يخدم ملايين المستخدمين العرب",
            avatarDataUrl: null,
            onboardingCompleted: true,
            createdAt: now - 30 * 86400000,
          },
          goals,
          logs,
          settings: get().settings,
        });
      },
    }),
    {
      name: "boslah-offline-vault",
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
        goals: state.goals,
        logs: state.logs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

/** دوال مساحة انتقائية للوصول السريع */
export function useHydrated() {
  return useAppStore((s) => s.hydrated);
}

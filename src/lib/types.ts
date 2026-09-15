/**
 * نماذج البيانات المركزية — تطبيق بوصلة
 * ⚠️ قاعدة التصميم الحاكمة: لا توجد أي حقول مواعيد نهائية، مؤقتات، أو كميات مفروضة.
 * الحقول الزمنية الوحيدة المسموحة: createdAt / activatedAt / completedAt / lastTouchedAt (تلقائية).
 */

export type GoalStatus =
  | "draft" // في مرحلة "اكتب أهدافك" قبل الغربلة
  | "excluded" // مستبعد (لا أحتاجه) — أرشيف دون حذف
  | "deferred" // مؤجل (ليس الآن)
  | "backlog" // مقبول، في قائمة الأهداف القادمة
  | "active" // نشط الآن (ضمن الثلاثة كحد أقصى)
  | "completed"; // منجز

export type GoalTerm = "long" | "short";

export interface Goal {
  id: string;
  title: string;
  status: GoalStatus;
  term: GoalTerm | null; // يُحدَّد عند التنشيط أو عند تعيينه كطموح طويل الأمد
  lifeAreaId: string | null; // ربط بأحد الجوانب الـ12
  priorityRank: number; // ترتيب نسبي ضمن نفس الحالة
  dependsOnGoalId: string | null; // اعتمادية اختيارية
  createdAt: number;
  activatedAt: number | null;
  completedAt: number | null;
  lastTouchedAt: number | null;
}

/** سجل تقدم حر النص بالكامل — لا كميات مفروضة (القاعدة الثالثة) */
export interface ProgressLog {
  id: string;
  goalId: string;
  note: string;
  createdAt: number;
}

export interface UserProfile {
  id: "singleton";
  name: string;
  age: number | null;
  fieldOfStudyOrWork: string;
  lifeDream: string;
  avatarDataUrl: string | null; // صورة Base64 محفوظة محليًا (اختيارية)
  onboardingCompleted: boolean;
  createdAt: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  id: "singleton";
  theme: ThemeMode;
  language: "ar" | "en";
}

/** حزمة النسخ الاحتياطي الكاملة (Offline Vault) */
export interface BackupPayload {
  goals: Goal[];
  progressLogs: ProgressLog[];
  userProfile: UserProfile[];
  settings: AppSettings[];
  exportedAt: number;
  schemaVersion: number;
}

export type FilterDecision = "backlog" | "excluded" | "deferred";

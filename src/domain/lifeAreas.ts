/**
 * الجوانب الـ 12 لحياة الإنسان — بيانات ثابتة (Seed Data)
 * تُستخدم لرسم خارطة التوازن وتصنيف الأهداف.
 */

export interface LifeAreaItem {
  id: string;
  labelAr: string;
  iconName: string;
  colorClass: string;
}

export const LIFE_AREAS: readonly LifeAreaItem[] = [
  { id: "health", labelAr: "الصحة والعافية", iconName: "HeartPulse", colorClass: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
  { id: "career", labelAr: "التعليم والمسار المهني", iconName: "GraduationCap", colorClass: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  { id: "family", labelAr: "العلاقات والأسرة", iconName: "Users", colorClass: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { id: "finance", labelAr: "الاستقرار المالي", iconName: "Coins", colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "personal", labelAr: "التطور الشخصي", iconName: "Sprout", colorClass: "text-teal-500 bg-teal-50 dark:bg-teal-950/30" },
  { id: "spirituality", labelAr: "الروحانية والدين", iconName: "Moon", colorClass: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
  { id: "social", labelAr: "الأثر المجتمعي", iconName: "Handshake", colorClass: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" },
  { id: "lifestyle", labelAr: "المنزل ونمط الحياة", iconName: "Home", colorClass: "text-orange-500 bg-orange-50 dark:bg-orange-950/30" },
  { id: "travel", labelAr: "السفر والمغامرات", iconName: "Plane", colorClass: "text-sky-500 bg-sky-50 dark:bg-sky-950/30" },
  { id: "tech", labelAr: "التكنولوجيا والحياة الرقمية", iconName: "Laptop", colorClass: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
  { id: "legacy", labelAr: "التخطيط والإرث", iconName: "Scale", colorClass: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30" },
  { id: "environment", labelAr: "المسؤولية البيئية", iconName: "Leaf", colorClass: "text-green-600 bg-green-50 dark:bg-green-950/30" },
] as const;

export function getLifeArea(areaId: string | null): LifeAreaItem | null {
  if (!areaId) return null;
  return LIFE_AREAS.find((a) => a.id === areaId) ?? null;
}

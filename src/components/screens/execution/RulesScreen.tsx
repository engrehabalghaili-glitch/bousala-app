"use client";

import React from "react";
import * as Icons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ZenButton } from "@/components/common/ZenButton";
import { COPY_AR } from "@/content/copyAr";

interface RulesScreenProps {
  ruleIndex: number; // 0..3
  onNext: () => void;
}

const IconMap = Icons as unknown as Record<
  string,
  React.FC<{ size?: number; className?: string; strokeWidth?: number }>
>;

/** شاشات القواعد الأربع — بطاقة تأملية كبيرة لكل قاعدة مع زر وحيد: فهمت القاعدة */
export const RulesScreen: React.FC<RulesScreenProps> = ({ ruleIndex, onNext }) => {
  const rule = COPY_AR.rules[ruleIndex];
  const IconComponent = IconMap[rule.icon] || Icons.Circle;

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh p-6 flex flex-col justify-center">
        {/* مؤشر القاعدة الحالية */}
        <div className="flex justify-center gap-2 mb-8" aria-label={`القاعدة ${ruleIndex + 1} من 4`}>
          {COPY_AR.rules.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                i === ruleIndex ? "w-8 bg-sage-500" : i < ruleIndex ? "w-1.5 bg-sage-500/50" : "w-1.5 bg-zen-200 dark:bg-zen-800"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={ruleIndex}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-zen-800/70 rounded-3xl border border-zen-150 dark:border-zen-800 shadow-sm p-10 text-center"
          >
            <span className="text-xs font-semibold tracking-widest text-zen-400 uppercase">
              القاعدة {ruleIndex + 1}
            </span>

            <div className="my-8 flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-zen-50 dark:bg-zen-900/70 border border-zen-100 dark:border-zen-800 grid place-items-center text-zen-700 dark:text-zen-300 relative">
                <IconComponent size={44} strokeWidth={1.5} />
                {ruleIndex === 0 && (
                  /* شطبة رمزية على الساعة الرملية — تحرر من المواعيد */
                  <span className="absolute w-0.5 h-14 bg-rose-400/80 rotate-45 rounded-full" aria-hidden />
                )}
                {ruleIndex === 1 && (
                  <span className="absolute -bottom-2 text-[10px] font-bold text-zen-400 bg-zen-50 dark:bg-zen-900/70 px-2 rounded-full">
                    بلا ساعة
                  </span>
                )}
                {ruleIndex === 2 && (
                  <span className="absolute -bottom-2 text-[10px] font-bold text-zen-400 bg-zen-50 dark:bg-zen-900/70 px-2 rounded-full">
                    بلا عدّاد
                  </span>
                )}
                {ruleIndex === 3 && (
                  <span className="absolute -bottom-2 text-[10px] font-bold text-sage-600 dark:text-sage-500 bg-zen-50 dark:bg-zen-900/70 px-2 rounded-full">
                    مقاعد محفوظة
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-extrabold leading-snug text-zen-900 dark:text-white">
              {rule.title}
            </h1>
            <p className="mt-4 text-sm text-zen-500 dark:text-zen-400 leading-loose px-2">
              {rule.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 pb-4">
          <ZenButton size="lg" onClick={onNext} className="animate-pulse-soft">
            فهمت القاعدة
          </ZenButton>
        </div>
      </div>
    </div>
  );
};

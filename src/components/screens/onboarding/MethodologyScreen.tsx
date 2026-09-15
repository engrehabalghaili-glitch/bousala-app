"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { COPY_AR } from "@/content/copyAr";

interface MethodologyScreenProps {
  onStart: () => void;
  onBack: () => void;
}

/** رسم خطي هادئ: عقل يستريح من الزحام */
const CalmMindIllustration: React.FC = () => (
  <svg width="150" height="104" viewBox="0 0 150 104" fill="none" role="img" aria-label="عقل هادئ يستريح">
    {/* رأس العقل */}
    <path
      d="M75 12c-26 0-44 17-44 38 0 12 6 22 15 29 3 2 5 6 5 10v3h48v-3c0-4 2-8 5-10 9-7 15-17 15-29 0-21-18-38-44-38Z"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      className="text-zen-700 dark:text-zen-300"
    />
    {/* موجات الفوضى تتحول إلى خط هادئ */}
    <path d="M45 52c6-6 10-6 16 0s10 6 16 0 10-6 16 0 10 6 16 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-emerald-500/80" />
    <path d="M52 68c5-4 9-4 14 0s9 4 14 0 9-4 14 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-zen-300 dark:text-zen-600" />
    {/* نقاط زحام تتلاشى */}
    <circle cx="38" cy="22" r="3" className="fill-zen-200 dark:fill-zen-700" />
    <circle cx="112" cy="18" r="2.5" className="fill-zen-200 dark:fill-zen-700" />
    <circle cx="122" cy="34" r="2" className="fill-zen-200 dark:fill-zen-700" />
  </svg>
);

/** شاشة بيان المنهج — أشبه بمقتطف من كتاب راقٍ أو بطاقة تأمل */
export const MethodologyScreen: React.FC<MethodologyScreenProps> = ({ onStart, onBack }) => {
  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh flex flex-col p-6">
        <header className="pt-2">
          <button
            onClick={onBack}
            aria-label={COPY_AR.common.back}
            className="p-2.5 rounded-2xl text-zen-500 hover:bg-zen-100 dark:hover:bg-zen-800 transition"
          >
            <ArrowLeft className="rotate-180" size={20} />
          </button>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          {/* بطاقة التأمل */}
          <div className="bg-white dark:bg-zen-800/60 rounded-3xl border border-zen-150 dark:border-zen-800 shadow-sm px-7 py-10 text-center animate-fade-up">
            <div className="flex justify-center text-zen-700 dark:text-zen-300 mb-6">
              <CalmMindIllustration />
            </div>

            <h1 className="text-xl font-bold leading-loose text-zen-900 dark:text-white">
              «{COPY_AR.methodology.headline}»
            </h1>

            <p className="mt-5 text-sm text-zen-500 dark:text-zen-400 leading-relaxed">
              {COPY_AR.methodology.body}
            </p>

            {/* خطوات المنهج */}
            <div className="mt-7 space-y-3 text-right">
              {COPY_AR.methodology.steps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-zen-50 dark:bg-zen-900/60 border border-zen-100 dark:border-zen-800 animate-fade-up"
                  style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                >
                  <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-sage-100 dark:bg-sage-900/50 text-sage-700 dark:text-sage-500 text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-zen-800 dark:text-zen-100">{step.title}</p>
                    <p className="text-xs text-zen-500 dark:text-zen-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="pb-4 pt-6">
          <ZenButton size="lg" onClick={onStart}>
            {COPY_AR.methodology.cta}
            <ArrowLeft size={19} />
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

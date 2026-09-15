"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { CompassLogo } from "@/components/common/CompassLogo";
import { ZenButton } from "@/components/common/ZenButton";
import { COPY_AR } from "@/content/copyAr";

interface IdentityScreenProps {
  onStart: () => void;
  onDemo: () => void;
}

/** شاشة الهوية والانطلاق — فراغ تنفس بصري واسع وشعار ينبض بنعومة */
export const IdentityScreen: React.FC<IdentityScreenProps> = ({ onStart, onDemo }) => {
  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh flex flex-col px-6 py-10">
        {/* الثلث العلوي: فراغ تنفس */}
        <div className="flex-[1.1]" aria-hidden />

        {/* المنتصف: الشعار + الاسم + التوجيه */}
        <main className="text-center animate-fade-up">
          <div className="inline-block text-zen-800 dark:text-zen-100 animate-pulse-soft">
            <CompassLogo size={112} />
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-zen-900 dark:text-white">
            {COPY_AR.app.name}
          </h1>
          <p className="mt-4 text-zen-500 dark:text-zen-400 text-lg leading-relaxed max-w-xs mx-auto">
            {COPY_AR.app.tagline}
          </p>
        </main>

        {/* الأسفل: زر الانطلاق النابض بنعومة */}
        <footer className="flex-[1] flex flex-col justify-end gap-3 pb-4 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <div className="animate-pulse-soft">
            <ZenButton size="lg" onClick={onStart}>
              {COPY_AR.app.start}
              <ArrowLeft size={19} />
            </ZenButton>
          </div>
          <ZenButton variant="ghost" size="md" className="w-full" onClick={onDemo}>
            {COPY_AR.app.demo}
          </ZenButton>
          <p className="text-center text-[11px] text-zen-400 mt-2 leading-relaxed">
            بلا حسابات — بياناتك تُحفظ محليًا في متصفحك فقط، ويعمل التطبيق دون اتصال.
          </p>
        </footer>
      </div>
    </div>
  );
};

"use client";

import React, { useRef, useState } from "react";
import { ArrowLeft, Camera, User } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";

interface ProfileScreenProps {
  onNext: () => void;
  onBack: () => void;
}

/** شاشة بطاقة التعريف الشخصي — حقول مسطحة بلا إطارات حادة */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNext, onBack }) => {
  const profile = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [field, setField] = useState(profile?.fieldOfStudyOrWork ?? "");
  const [dream, setDream] = useState(profile?.lifeDream ?? "");
  const [avatar, setAvatar] = useState<string | null>(profile?.avatarDataUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canProceed = name.trim().length > 0;

  const handleAvatar = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // تصغير الصورة إلى 256px لتخفيف الحجم المحفوظ محليًا
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        setAvatar(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!canProceed) return;
    saveProfile({
      name: name.trim(),
      age: age ? parseInt(age, 10) || null : null,
      fieldOfStudyOrWork: field.trim(),
      lifeDream: dream.trim(),
      avatarDataUrl: avatar,
    });
    onNext();
  };

  const inputCls =
    "w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-base focus:outline-none focus:ring-2 focus:ring-zen-400 dark:focus:ring-zen-500 placeholder:text-zen-300 dark:placeholder:text-zen-600 transition";

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100">
      <div className="max-w-lg mx-auto min-h-dvh flex flex-col p-6">
        <header className="pt-2 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label={COPY_AR.common.back}
            className="p-2.5 rounded-2xl text-zen-500 hover:bg-zen-100 dark:hover:bg-zen-800 transition"
          >
            <ArrowLeft className="rotate-180" size={20} />
          </button>
          <span className="text-xs font-semibold text-sage-600">رحلة التهيئة</span>
        </header>

        <main className="flex-1 flex flex-col justify-center py-6">
          {/* بطاقة ناعمة مستديرة الحواف */}
          <div className="bg-white dark:bg-zen-800/60 rounded-3xl border border-zen-150 dark:border-zen-800 shadow-xs p-6 space-y-5 animate-fade-up">
            {/* أيقونة الصورة الشخصية */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="اختيار صورة شخصية (اختياري)"
                className="relative w-20 h-20 rounded-full overflow-hidden bg-zen-100 dark:bg-zen-700 grid place-items-center text-zen-400 hover:text-zen-500 transition group ring-2 ring-transparent hover:ring-sage-500/40"
              >
                {avatar ? (
                  <img src={avatar} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} strokeWidth={1.6} />
                )}
                <span className="absolute inset-0 grid place-items-center bg-zen-900/45 opacity-0 group-hover:opacity-100 transition">
                  <Camera size={20} className="text-white" />
                </span>
              </button>
              <span className="text-[11px] text-zen-400">الصورة الشخصية — اختيارية، تُحفظ محلياً فقط</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
            </div>

            {/* الاسم */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
                الاسم الأول أو المستعار
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عمرو"
                className={inputCls}
                autoFocus
              />
            </div>

            {/* العمر والمجال في صف أفقي مقسوم مناصفة */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="age" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
                  العمر
                </label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={8}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="field" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
                  التخصص أو المجال
                </label>
                <input
                  id="field"
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="طالب هندسة حاسب"
                  className={inputCls}
                />
              </div>
            </div>

            {/* حلم الحياة */}
            <div className="space-y-1.5">
              <label htmlFor="dream" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
                ما هو حلمك الأكبر في هذه الحياة؟
              </label>
              <textarea
                id="dream"
                rows={3}
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="دوّنه بحرية — سيذكّرك به التطبيق في اللحظات المناسبة..."
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </div>
          </div>
        </main>

        <footer className="pb-4">
          <ZenButton size="lg" disabled={!canProceed} onClick={handleSubmit}>
            {COPY_AR.common.next}
            <ArrowLeft size={19} />
          </ZenButton>
        </footer>
      </div>
    </div>
  );
};

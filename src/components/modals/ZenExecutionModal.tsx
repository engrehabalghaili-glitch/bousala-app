"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { ZenButton } from "@/components/common/ZenButton";
import { ZenSheet } from "@/components/common/ZenSheet";
import { COPY_AR } from "@/content/copyAr";

interface ZenExecutionModalProps {
  open: boolean;
  goalTitle: string;
  onClose: () => void;
  onSaveProgress: (note: string) => void;
  onCompleteGoal: () => void;
}

/**
 * جلسة التنفيذ الصافية — تدوين تقدم سريع (Micro-Journaling)
 * خالية تماماً من المشتتات والعدادات والمؤقتات.
 */
export const ZenExecutionModal: React.FC<ZenExecutionModalProps> = ({
  open,
  goalTitle,
  onClose,
  onSaveProgress,
  onCompleteGoal,
}) => {
  const [note, setNote] = useState("");

  const quickPills = COPY_AR.session.quickPills;

  const handleSave = () => {
    if (!note.trim()) return;
    onSaveProgress(note.trim());
    setNote("");
  };

  const handleComplete = () => {
    const finalNote = note.trim();
    if (finalNote) {
      onSaveProgress(finalNote);
    }
    setNote("");
    onCompleteGoal();
  };

  return (
    <ZenSheet open={open} onClose={onClose} title={COPY_AR.session.title} closeLabel={COPY_AR.common.close}>
      <h2 className="text-xl font-bold mb-1 text-zen-900 dark:text-white leading-snug break-words">
        {goalTitle}
      </h2>
      <p className="text-sm text-zen-500 mb-5">{COPY_AR.session.question}</p>

      {/* حقل التدوين الحر */}
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={COPY_AR.session.placeholder}
        aria-label={COPY_AR.session.question}
        className="w-full p-4 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400 resize-none mb-4 leading-relaxed"
      />

      {/* عبارات الإنجاز السريع بنقرة واحدة */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="عبارات إنجاز سريعة">
        {quickPills.map((pill) => (
          <button
            key={pill}
            onClick={() => setNote(pill)}
            className="text-xs px-3 py-1.5 rounded-xl bg-zen-100 dark:bg-zen-800 text-zen-700 dark:text-zen-300 hover:bg-zen-200 dark:hover:bg-zen-700 transition"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* إجراءات الحفظ والإنجاز التام */}
      <div className="space-y-2">
        <ZenButton size="lg" onClick={handleSave} disabled={!note.trim()}>
          {COPY_AR.session.save}
        </ZenButton>

        <button
          onClick={handleComplete}
          className="w-full py-3 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl transition flex items-center justify-center gap-1.5"
        >
          <Check size={16} />
          {COPY_AR.session.completeToday}
        </button>
      </div>
    </ZenSheet>
  );
};

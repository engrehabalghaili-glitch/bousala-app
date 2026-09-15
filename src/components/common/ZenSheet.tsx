"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ZenSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** bottom = صفيحة سفلية منزلقة على الهاتف، center = نافذة وسطية */
  layout?: "bottom" | "center";
  closeLabel?: string;
}

/**
 * النافذة المنبثقة الموحدة: صفيحة سفلية على الهاتف، وسطية على الشاشات الأكبر.
 * خلفية معتمة ناعمة مع blur خفيف.
 */
export const ZenSheet: React.FC<ZenSheetProps> = ({
  open,
  onClose,
  title,
  children,
  layout = "bottom",
  closeLabel = "إغلاق",
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || closeLabel}
            initial={{ y: layout === "bottom" ? 80 : 24, opacity: 0, scale: layout === "center" ? 0.96 : 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: layout === "bottom" ? 60 : 16, opacity: 0, scale: layout === "center" ? 0.97 : 1 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative w-full max-w-lg bg-white dark:bg-zen-900 border border-zen-200 dark:border-zen-800 shadow-2xl ${
              layout === "bottom"
                ? "rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto zen-scroll"
                : "rounded-3xl max-h-[88vh] overflow-y-auto zen-scroll"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 pt-4 pb-3 bg-white/90 dark:bg-zen-900/90 backdrop-blur-sm rounded-t-3xl border-b border-zen-100 dark:border-zen-800/70">
              {title ? (
                <h3 className="font-bold text-lg text-zen-900 dark:text-white">{title}</h3>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                aria-label={closeLabel}
                className="p-2 rounded-xl text-zen-400 hover:text-zen-600 dark:hover:text-zen-300 hover:bg-zen-100 dark:hover:bg-zen-800/70 transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

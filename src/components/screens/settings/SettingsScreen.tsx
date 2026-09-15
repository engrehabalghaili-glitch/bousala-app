"use client";

import React, { useRef, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  Database,
  Download,
  Info,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ZenButton } from "@/components/common/ZenButton";
import { ZenSheet } from "@/components/common/ZenSheet";
import { useAppStore } from "@/store/useAppStore";
import { COPY_AR } from "@/content/copyAr";
import { toast } from "sonner";

interface SettingsScreenProps {
  onRestartJourney: () => void;
}

type ThemeOption = "light" | "dark" | "system";

const APP_VERSION = "1.0.0";

/** كشف التركيب على العميل دون cascading renders */
const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

/** نموذج تعديل الملف — يُركّب فقط عند فتح النافذة فتلتقط القيم الأولية تلقائياً */
const ProfileForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const profile = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [field, setField] = useState(profile?.fieldOfStudyOrWork ?? "");
  const [dream, setDream] = useState(profile?.lifeDream ?? "");

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="set-name" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
          الاسم
        </label>
        <input
          id="set-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="set-age" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
            العمر
          </label>
          <input
            id="set-age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="set-field" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
            التخصص أو المجال
          </label>
          <input
            id="set-field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="set-dream" className="text-sm font-semibold text-zen-700 dark:text-zen-300 px-1">
          حلمك الأكبر
        </label>
        <textarea
          id="set-dream"
          rows={3}
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-zen-50 dark:bg-zen-800 border border-zen-200 dark:border-zen-700 text-sm focus:outline-none focus:ring-1 focus:ring-zen-400 resize-none leading-relaxed"
        />
      </div>
      <ZenButton
        size="lg"
        onClick={() => {
          saveProfile({
            name: name.trim() || "صديقي",
            age: age ? parseInt(age, 10) || null : null,
            fieldOfStudyOrWork: field.trim(),
            lifeDream: dream.trim(),
          });
          onClose();
          toast.success(COPY_AR.settings.savedProfile);
        }}
      >
        {COPY_AR.common.save}
      </ZenButton>
    </div>
  );
};

/** الإعدادات والنسخ الاحتياطي — المظهر، الملف، الخزنة المحلية، والبداية الجديدة */
export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onRestartJourney }) => {
  const { theme, setTheme } = useTheme();
  const profile = useAppStore((s) => s.profile);
  const exportBackup = useAppStore((s) => s.exportBackup);
  const importBackup = useAppStore((s) => s.importBackup);
  const resetAll = useAppStore((s) => s.resetAll);

  const mounted = useMounted();
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const importRef = useRef<HTMLInputElement>(null);

  const themeOptions: Array<{ key: ThemeOption; label: string; icon: React.FC<{ size?: number }> }> = [
    { key: "light", label: COPY_AR.settings.themeLight, icon: Sun },
    { key: "dark", label: COPY_AR.settings.themeDark, icon: Moon },
    { key: "system", label: COPY_AR.settings.themeSystem, icon: Monitor },
  ];

  const handleExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    a.href = url;
    a.download = `boslah-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(COPY_AR.settings.exported);
  };

  const handleImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importBackup(reader.result as string);
      if (res.ok) {
        toast.success(COPY_AR.settings.imported);
      } else {
        toast.error(COPY_AR.settings.importError);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAll();
    setResetOpen(false);
    onRestartJourney();
  };

  const rowCls =
    "w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-zen-800/70 border border-zen-150 dark:border-zen-800 hover:border-zen-300 dark:hover:border-zen-700 transition text-right";

  return (
    <div className="bg-zen-50 dark:bg-zen-900 text-zen-800 dark:text-zen-100 min-h-dvh">
      <div className="max-w-lg mx-auto p-6 pb-36 min-h-dvh">
        <header className="pt-5 mb-6">
          <h1 className="text-2xl font-bold text-zen-900 dark:text-white">{COPY_AR.settings.title}</h1>
        </header>

        <main className="space-y-6">
          {/* المظهر */}
          <section>
            <h2 className="text-xs font-bold text-zen-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 px-1">
              <Palette size={13} />
              {COPY_AR.settings.appearance}
            </h2>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-white dark:bg-zen-800/70 rounded-2xl border border-zen-150 dark:border-zen-800">
              {themeOptions.map(({ key, label, icon: Icon }) => {
                const active = mounted && theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-zen-900 dark:bg-white text-white dark:text-zen-900 shadow-sm"
                        : "text-zen-500 dark:text-zen-400 hover:bg-zen-100 dark:hover:bg-zen-800"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* الملف الشخصي */}
          <section>
            <h2 className="text-xs font-bold text-zen-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 px-1">
              <User size={13} />
              {COPY_AR.settings.profile}
            </h2>
            <button onClick={() => setProfileOpen(true)} className={rowCls}>
              {profile?.avatarDataUrl ? (
                <img
                  src={profile.avatarDataUrl}
                  alt="الصورة الشخصية"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-zen-100 dark:ring-zen-700"
                />
              ) : (
                <span className="w-11 h-11 rounded-full bg-zen-100 dark:bg-zen-700 grid place-items-center text-zen-400">
                  <User size={20} />
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-zen-800 dark:text-zen-100 truncate">
                  {profile?.name || "بدون اسم"}
                </span>
                <span className="block text-[11px] text-zen-400 truncate">
                  {profile?.fieldOfStudyOrWork || COPY_AR.settings.profileEdit}
                </span>
              </span>
            </button>
          </section>

          {/* إدارة البيانات المحلية */}
          <section>
            <h2 className="text-xs font-bold text-zen-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 px-1">
              <Database size={13} />
              {COPY_AR.settings.data}
            </h2>
            <div className="space-y-2">
              <button onClick={handleExport} className={rowCls}>
                <span className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900/40 text-sage-600 dark:text-sage-500 grid place-items-center shrink-0">
                  <Download size={18} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-zen-800 dark:text-zen-100">
                    {COPY_AR.settings.exportBtn}
                  </span>
                  <span className="block text-[11px] text-zen-400">{COPY_AR.settings.exportHint}</span>
                </span>
              </button>

              <button onClick={() => importRef.current?.click()} className={rowCls}>
                <span className="w-10 h-10 rounded-xl bg-zen-100 dark:bg-zen-700 text-zen-500 dark:text-zen-300 grid place-items-center shrink-0">
                  <Upload size={18} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-zen-800 dark:text-zen-100">
                    {COPY_AR.settings.importBtn}
                  </span>
                  <span className="block text-[11px] text-zen-400">{COPY_AR.settings.importHint}</span>
                </span>
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => handleImport(e.target.files?.[0])}
              />
            </div>
          </section>

          {/* منطقة البداية الجديدة */}
          <section>
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 px-1">
              <AlertTriangle size={13} />
              {COPY_AR.settings.dangerZone}
            </h2>
            <button
              onClick={() => setResetOpen(true)}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-right"
            >
              <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-500 grid place-items-center shrink-0">
                <RotateCcw size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-rose-600 dark:text-rose-400">
                  {COPY_AR.settings.resetBtn}
                </span>
                <span className="block text-[11px] text-rose-400/90">{COPY_AR.settings.resetHint}</span>
              </span>
            </button>
          </section>

          {/* عن التطبيق */}
          <section>
            <h2 className="text-xs font-bold text-zen-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 px-1">
              <Info size={13} />
              {COPY_AR.settings.about}
            </h2>
            <div className="p-4 rounded-2xl bg-white dark:bg-zen-800/70 border border-zen-150 dark:border-zen-800">
              <p className="text-xs text-zen-500 dark:text-zen-400 leading-relaxed">
                {COPY_AR.settings.aboutBody}
              </p>
              <p className="text-[11px] text-zen-400 mt-3 font-semibold">
                بوصلة — الإصدار {APP_VERSION}
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* نافذة تعديل الملف — النموذج يُركّب فقط عند الفتح */}
      <ZenSheet open={profileOpen} onClose={() => setProfileOpen(false)} title={COPY_AR.settings.profile} closeLabel={COPY_AR.common.close}>
        {profileOpen && <ProfileForm onClose={() => setProfileOpen(false)} />}
      </ZenSheet>

      {/* تأكيد إعادة الرحلة */}
      <ZenSheet open={resetOpen} onClose={() => setResetOpen(false)} layout="center" title={COPY_AR.settings.resetConfirmTitle} closeLabel={COPY_AR.common.close}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 grid place-items-center">
            <AlertTriangle size={26} />
          </div>
          <p className="text-sm text-zen-600 dark:text-zen-300 leading-relaxed">
            {COPY_AR.settings.resetConfirmBody}
          </p>
          <div className="mt-6 space-y-2">
            <ZenButton variant="danger" size="lg" onClick={handleReset}>
              {COPY_AR.settings.resetYes}
            </ZenButton>
            <ZenButton variant="ghost" size="md" className="w-full" onClick={() => setResetOpen(false)}>
              {COPY_AR.common.cancel}
            </ZenButton>
          </div>
        </div>
      </ZenSheet>
    </div>
  );
};

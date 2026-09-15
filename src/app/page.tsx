"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useHashRoute, navigate } from "@/hooks/useHashRoute";
import { BottomNav, type TabKey } from "@/components/layout/BottomNav";
import { GlobalAddGoalModal } from "@/components/modals/GlobalAddGoalModal";
import { CompassLogo } from "@/components/common/CompassLogo";

import { IdentityScreen } from "@/components/screens/onboarding/IdentityScreen";
import { ProfileScreen } from "@/components/screens/onboarding/ProfileScreen";
import { MethodologyScreen } from "@/components/screens/onboarding/MethodologyScreen";

import { WriteGoalsScreen } from "@/components/screens/declutter/WriteGoalsScreen";
import { FilterGoalsScreen } from "@/components/screens/declutter/FilterGoalsScreen";
import { PrioritizeScreen } from "@/components/screens/declutter/PrioritizeScreen";
import { AssignLifeAreaScreen } from "@/components/screens/declutter/AssignLifeAreaScreen";
import { SummaryScreen } from "@/components/screens/declutter/SummaryScreen";

import { RulesScreen } from "@/components/screens/execution/RulesScreen";
import { SetupActiveScreen } from "@/components/screens/execution/SetupActiveScreen";

import { HomeScreen } from "@/components/screens/dashboard/HomeScreen";
import { AllGoalsScreen } from "@/components/screens/goals/AllGoalsScreen";
import { LifeBalanceScreen } from "@/components/screens/progress/LifeBalanceScreen";
import { SettingsScreen } from "@/components/screens/settings/SettingsScreen";

/** شاشة التحميل الناعمة حتى اكتمال تهيئة الخزنة المحلية */
const Splash: React.FC = () => (
  <div className="min-h-dvh bg-zen-50 dark:bg-zen-900 grid place-items-center text-zen-800 dark:text-zen-100">
    <div className="text-center animate-fade-in">
      <div className="inline-block animate-pulse-soft">
        <CompassLogo size={80} animate={false} />
      </div>
      <p className="mt-4 text-sm text-zen-400">رتّب أهدافك، تخلّص من الشتات، وابدأ.</p>
    </div>
  </div>
);

/** المسارات اليومية التي يظهر فيها شريط التنقل السفلي */
const DAILY_ROUTES = ["/home", "/goals", "/progress", "/settings"];
const ONBOARDING_ROUTES = ["/onboarding/profile", "/onboarding/methodology"];

/** كشف التركيب على العميل دون cascading renders */
const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export default function App() {
  const route = useHashRoute();
  const mounted = useMounted();
  const [addGoalOpen, setAddGoalOpen] = useState(false);

  const onboardingCompleted = useAppStore((s) => s.profile?.onboardingCompleted ?? false);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const seedDemo = useAppStore((s) => s.seedDemo);

  // إعادة التوجيه للحفاظ على تسلسل الرحلة
  useEffect(() => {
    if (!mounted || !route) return;

    if (onboardingCompleted) {
      if (route === "/" || ONBOARDING_ROUTES.includes(route)) {
        navigate("/home");
      }
    } else {
      if (DAILY_ROUTES.includes(route)) {
        navigate("/");
      }
    }
  }, [mounted, route, onboardingCompleted]);

  const handleDemo = useCallback(() => {
    seedDemo();
    navigate("/home");
  }, [seedDemo]);

  const handleJourneyComplete = useCallback(() => {
    completeOnboarding();
    navigate("/home");
  }, [completeOnboarding]);

  const handleRestart = useCallback(() => {
    navigate("/");
  }, []);

  const openAddGoal = useCallback(() => setAddGoalOpen(true), []);

  if (!mounted || !route) return <Splash />;

  // حارس: أثناء مسار التهيئة الأول نمنع الوصول اليومي (يُعالج بالتأثير أعلاه أيضاً)
  if (!onboardingCompleted && DAILY_ROUTES.includes(route)) return <Splash />;
  if (onboardingCompleted && (route === "/" || ONBOARDING_ROUTES.includes(route))) return <Splash />;

  const isDaily = DAILY_ROUTES.includes(route);
  const activeTab: TabKey =
    route === "/goals" ? "goals" : route === "/progress" ? "progress" : route === "/settings" ? "settings" : "home";

  const renderScreen = () => {
    // شاشات الاستخدام اليومي
    if (route === "/home") {
      return (
        <HomeScreen
          onNavigateGoals={() => navigate("/goals")}
          onAddGoal={openAddGoal}
          onConfigureSeats={() => navigate("/execution/setup")}
        />
      );
    }
    if (route === "/goals") return <AllGoalsScreen />;
    if (route === "/progress") return <LifeBalanceScreen />;
    if (route === "/settings") return <SettingsScreen onRestartJourney={handleRestart} />;

    // مرحلة التخلص من الشتات
    if (route === "/declutter/write") return <WriteGoalsScreen onNext={() => navigate("/declutter/filter")} />;
    if (route === "/declutter/filter") return <FilterGoalsScreen onNext={() => navigate("/declutter/prioritize")} />;
    if (route === "/declutter/prioritize")
      return <PrioritizeScreen onNext={() => navigate("/declutter/life-areas")} onBack={() => navigate("/declutter/write")} />;
    if (route === "/declutter/life-areas") return <AssignLifeAreaScreen onNext={() => navigate("/declutter/summary")} />;
    if (route === "/declutter/summary") return <SummaryScreen onNext={() => navigate("/execution/rules/1")} />;

    // قواعد التنفيذ الأربع
    const rulesMatch = route.match(/^\/execution\/rules\/([1-4])$/);
    if (rulesMatch) {
      const idx = parseInt(rulesMatch[1], 10) - 1;
      return (
        <RulesScreen
          ruleIndex={idx}
          onNext={() => navigate(idx < 3 ? `/execution/rules/${idx + 2}` : "/execution/setup")}
        />
      );
    }
    if (route === "/execution/setup") {
      return <SetupActiveScreen onNext={handleJourneyComplete} />;
    }

    // مسار التهيئة الأول
    if (route === "/onboarding/profile")
      return <ProfileScreen onNext={() => navigate("/onboarding/methodology")} onBack={() => navigate("/")} />;
    if (route === "/onboarding/methodology")
      return <MethodologyScreen onStart={() => navigate("/declutter/write")} onBack={() => navigate("/onboarding/profile")} />;

    // الافتراضي: شاشة الهوية
    return <IdentityScreen onStart={() => navigate("/onboarding/profile")} onDemo={handleDemo} />;
  };

  return (
    <div className="min-h-dvh bg-zen-50 dark:bg-zen-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {/* شريط التنقل السفلي — يختفي تماماً أثناء رحلة التهيئة لمنع التشتت */}
      {isDaily && (
        <BottomNav active={activeTab} onNavigate={(tab) => navigate(`/${tab}`)} onAddGoal={openAddGoal} />
      )}

      {/* النافذة العامة لإضافة الأهداف إلى قائمة الانتظار */}
      <GlobalAddGoalModal open={addGoalOpen} onClose={() => setAddGoalOpen(false)} />
    </div>
  );
}

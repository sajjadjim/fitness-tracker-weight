"use client";

import React, { useState } from "react";
import {
  Activity,
  Sparkles,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Scale,
  Download,
  CheckCircle,
  Moon,
  Sun,
  Lock,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { calculateBmi, getBmiCategory, getHealthyWeightRange } from "@/lib/calculations";

export function LandingPage() {
  const { loginAsDemo, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, formatNum } = useLanguage();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  // Interactive Live Preview State on Landing Page
  const [previewHeight, setPreviewHeight] = useState<number>(175);
  const [previewWeight, setPreviewWeight] = useState<number>(74);

  const previewBmi = calculateBmi(previewWeight, previewHeight);
  const previewCategory = getBmiCategory(previewBmi);
  const healthyRange = getHealthyWeightRange(previewHeight);

  const openAuth = (mode: "signin" | "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "Underweight":
        return t("underweight");
      case "Normal weight":
        return t("normalWeight");
      case "Overweight":
        return t("overweight");
      case "Obesity":
        return t("obesity");
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              {t("brand")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <LanguageToggle variant="pill" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => loginAsDemo()}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors hidden md:block"
            >
              {t("guestDemo")}
            </button>

            {/* Email / Password Sign In trigger */}
            <button
              onClick={() => openAuth("signin")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("signIn")}</span>
            </button>

            {/* Google / Account Sign Up CTA */}
            <button
              onClick={() => openAuth("signup")}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t("getStarted")}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("heroBadge")}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t("heroTitlePrefix")}{" "}
              <span className="text-gradient-emerald">{t("heroTitleGradient")}</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("heroDescription")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => openAuth("signin")}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t("signInOrCreateAccount")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => loginAsDemo()}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold rounded-2xl shadow-sm transition-all"
              >
                {t("exploreDemo")}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t("freeForever")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-teal-500" /> {t("dataIsolation")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-500" /> {t("autoKgLbs")}
              </span>
            </div>
          </div>

          {/* Interactive Hero Calculator Card */}
          <div className="mt-14 max-w-3xl mx-auto bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t("interactiveGaugeTitle")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t("interactiveGaugeDesc")}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${previewCategory.badgeClass}`}
              >
                {getCategoryLabel(previewCategory.category)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Height slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">{t("height")}:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {formatNum(previewHeight)} cm ({formatNum((previewHeight / 30.48).toFixed(1))} ft)
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="215"
                  value={previewHeight}
                  onChange={(e) => setPreviewHeight(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Weight slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">{t("weight")}:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {formatNum(previewWeight)} kg ({formatNum((previewWeight * 2.20462).toFixed(1))} lbs)
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={previewWeight}
                  onChange={(e) => setPreviewWeight(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Results Row */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  {t("calculatedBmi")}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {formatNum(previewBmi?.toFixed(1))}
                  </span>
                  <span className="text-xs text-slate-500">kg/m²</span>
                </div>
              </div>

              {healthyRange && (
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {t("normalRefRange")}
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatNum(healthyRange.minKg)} – {formatNum(healthyRange.maxKg)} kg ({formatNum(healthyRange.minLbs)} – {formatNum(healthyRange.maxLbs)} lbs)
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              {t("bmiDisclaimer")}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 border-t border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
              {t("engineeredTitle")}
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("engineeredSubtitle")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                {t("feature1Title")}
              </h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature1Desc")}
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-5">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                {t("feature2Title")}
              </h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature2Desc")}
              </p>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                {t("feature3Title")}
              </h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-10 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{t("brand")}</span>
            <span>{t("footerTagline")}</span>
          </div>
          <div>
            {t("footerBuilt")}
          </div>
        </div>
      </footer>

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}

"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface LanguageToggleProps {
  className?: string;
  variant?: "pill" | "icon" | "select";
}

export function LanguageToggle({ className = "", variant = "pill" }: LanguageToggleProps) {
  const { locale, toggleLocale, setLocale } = useLanguage();

  if (variant === "select") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            locale === "en"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLocale("bn")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            locale === "bn"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          বাংলা (Bangla)
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleLocale}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all ${className}`}
      title={locale === "en" ? "বাংলা ভাষায় পরিবর্তন করুন" : "Switch to English"}
    >
      <Languages className="w-3.5 h-3.5 text-emerald-500" />
      <span className="font-semibold tracking-wide">
        {locale === "en" ? "বাংলা" : "EN"}
      </span>
    </button>
  );
}

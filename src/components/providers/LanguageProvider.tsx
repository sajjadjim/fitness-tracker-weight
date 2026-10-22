"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations, toBengaliNumber } from "@/lib/i18n/translations";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
  formatNum: (num: number | string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => translations.en[key] || key,
  formatNum: (num) => (num !== null && num !== undefined ? String(num) : "--"),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("fittrack-locale") as Locale | null;
    if (stored === "en" || stored === "bn") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("fittrack-locale", newLocale);
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "bn" : "en";
    setLocale(next);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  const formatNum = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return "--";
    if (locale === "bn") {
      return toBengaliNumber(num);
    }
    return String(num);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, formatNum }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

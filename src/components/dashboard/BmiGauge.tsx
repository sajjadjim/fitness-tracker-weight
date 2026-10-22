"use client";

import React from "react";
import { Info, Sparkles } from "lucide-react";
import { WeightUnit } from "@/lib/calculations";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface BmiGaugeProps {
  bmi: number | null;
  bmiCategory: {
    category: string;
    color: string;
    badgeClass: string;
    description: string;
  };
  healthyRange: {
    minKg: number;
    maxKg: number;
    minLbs: number;
    maxLbs: number;
  } | null;
  preferredUnit: WeightUnit;
}

export function BmiGauge({
  bmi,
  bmiCategory,
  healthyRange,
  preferredUnit,
}: BmiGaugeProps) {
  const { t, formatNum, locale } = useLanguage();

  const minBmiScale = 15;
  const maxBmiScale = 35;
  const currentBmi = bmi || 22.0;

  const clampBmi = Math.max(minBmiScale, Math.min(maxBmiScale, currentBmi));
  const pointerPercentage = ((clampBmi - minBmiScale) / (maxBmiScale - minBmiScale)) * 100;

  const localizedCategory = () => {
    const cat = bmiCategory.category.toLowerCase();
    if (cat.includes("under")) return t("underweight");
    if (cat.includes("normal")) return t("normalWeight");
    if (cat.includes("over")) return t("overweight");
    return t("obesity");
  };

  const localizedDescription = () => {
    const cat = bmiCategory.category.toLowerCase();
    if (cat.includes("under")) return t("underweightDesc");
    if (cat.includes("normal")) return t("normalWeightDesc");
    if (cat.includes("over")) return t("overweightDesc");
    return t("obesityDesc");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
              {locale === "bn" ? "বডি ম্যাস ইনডেক্স (BMI)" : "Body Mass Index (BMI)"}
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${bmiCategory.badgeClass}`}
            >
              {localizedCategory()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {localizedDescription()}
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {bmi !== null ? formatNum(bmi.toFixed(1)) : "--"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            kg/m²
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="relative pt-4 pb-2">
        {/* Needle / Marker */}
        <div
          className="absolute -top-1 transition-all duration-700 ease-out z-10 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${pointerPercentage}%` }}
        >
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 mb-1">
            <span>{formatNum(currentBmi.toFixed(1))}</span>
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-900 dark:border-t-white" />
        </div>

        {/* 4 Colored Category Track Segments */}
        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-sky-400/80 transition-all hover:brightness-110"
            style={{ width: "17.5%" }}
            title="Underweight (< 18.5)"
          />
          <div
            className="h-full bg-emerald-500 transition-all hover:brightness-110 relative"
            style={{ width: "32.5%" }}
            title="Normal weight (18.5 - 24.9)"
          >
            <div className="absolute inset-0 bg-white/10" />
          </div>
          <div
            className="h-full bg-amber-400/90 transition-all hover:brightness-110"
            style={{ width: "25%" }}
            title="Overweight (25.0 - 29.9)"
          />
          <div
            className="h-full bg-rose-500/85 transition-all hover:brightness-110"
            style={{ width: "25%" }}
            title="Obesity (≥ 30.0)"
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-2 px-1">
          <div className="flex flex-col items-start">
            <span className="text-sky-500">&lt; {formatNum(18.5)}</span>
            <span className="text-[10px] text-slate-400">{locale === "bn" ? "কম" : "Under"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-emerald-500 font-semibold">{formatNum("18.5")} – {formatNum("24.9")}</span>
            <span className="text-[10px] text-slate-400">{locale === "bn" ? "স্বাভাবিক" : "Normal"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-amber-500">{formatNum("25.0")} – {formatNum("29.9")}</span>
            <span className="text-[10px] text-slate-400">{locale === "bn" ? "অতিরিক্ত" : "Over"}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-rose-500">≥ {formatNum("30.0")}</span>
            <span className="text-[10px] text-slate-400">{locale === "bn" ? "স্থূল" : "Obese"}</span>
          </div>
        </div>
      </div>

      {/* Adult Healthy Reference Range Box */}
      {healthyRange && (
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                {t("adultRefRange")}:
              </span>{" "}
              {preferredUnit === "lbs"
                ? `${formatNum(healthyRange.minLbs)} – ${formatNum(healthyRange.maxLbs)} lbs`
                : `${formatNum(healthyRange.minKg)} – ${formatNum(healthyRange.maxKg)} kg`}
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">
            {t("basedOnHeight")}
          </span>
        </div>
      )}

      {/* Health Disclaimer Note */}
      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <span>{t("bmiDisclaimer")}</span>
      </div>
    </div>
  );
}

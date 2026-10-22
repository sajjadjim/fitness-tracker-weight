"use client";

import React from "react";
import { Info, Sparkles } from "lucide-react";
import { WeightUnit, BMI_HEALTH_DISCLAIMER } from "@/lib/calculations";

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
  // BMI scale from 15 to 35 for visualization percentage
  // min: 15, max: 35
  const minBmiScale = 15;
  const maxBmiScale = 35;
  const currentBmi = bmi || 22.0;

  const clampBmi = Math.max(minBmiScale, Math.min(maxBmiScale, currentBmi));
  const pointerPercentage = ((clampBmi - minBmiScale) / (maxBmiScale - minBmiScale)) * 100;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
              Body Mass Index (BMI)
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${bmiCategory.badgeClass}`}
            >
              {bmiCategory.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {bmiCategory.description}
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {bmi !== null ? bmi.toFixed(1) : "--"}
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
            <span>{currentBmi.toFixed(1)}</span>
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-900 dark:border-t-white" />
        </div>

        {/* 4 Colored Category Track Segments */}
        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100 dark:bg-slate-800">
          {/* Underweight: 15 to 18.5 (17.5% width) */}
          <div
            className="h-full bg-sky-400/80 transition-all hover:brightness-110"
            style={{ width: "17.5%" }}
            title="Underweight (< 18.5)"
          />
          {/* Normal: 18.5 to 25.0 (32.5% width) */}
          <div
            className="h-full bg-emerald-500 transition-all hover:brightness-110 relative"
            style={{ width: "32.5%" }}
            title="Normal weight (18.5 - 24.9)"
          >
            <div className="absolute inset-0 bg-white/10" />
          </div>
          {/* Overweight: 25.0 to 30.0 (25% width) */}
          <div
            className="h-full bg-amber-400/90 transition-all hover:brightness-110"
            style={{ width: "25%" }}
            title="Overweight (25.0 - 29.9)"
          />
          {/* Obese: 30.0 to 35.0 (25% width) */}
          <div
            className="h-full bg-rose-500/85 transition-all hover:brightness-110"
            style={{ width: "25%" }}
            title="Obesity (≥ 30.0)"
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-2 px-1">
          <div className="flex flex-col items-start">
            <span className="text-sky-500">&lt; 18.5</span>
            <span className="text-[10px] text-slate-400">Under</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-emerald-500 font-semibold">18.5 – 24.9</span>
            <span className="text-[10px] text-slate-400">Normal</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-amber-500">25.0 – 29.9</span>
            <span className="text-[10px] text-slate-400">Over</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-rose-500">≥ 30.0</span>
            <span className="text-[10px] text-slate-400">Obese</span>
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
                Adult Reference Range:
              </span>{" "}
              {preferredUnit === "lbs"
                ? `${healthyRange.minLbs} – ${healthyRange.maxLbs} lbs`
                : `${healthyRange.minKg} – ${healthyRange.maxKg} kg`}
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">
            Based on height
          </span>
        </div>
      )}

      {/* Health Disclaimer Note */}
      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <span>{BMI_HEALTH_DISCLAIMER}</span>
      </div>
    </div>
  );
}

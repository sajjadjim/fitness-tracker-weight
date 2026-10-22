"use client";

import React from "react";
import { Scale, ArrowUpRight, ArrowDownRight, Minus, Activity, History } from "lucide-react";
import { WeightUnit, kgToLbs } from "@/lib/calculations";

interface SummaryMetricsProps {
  currentWeightKg: number | null;
  previousWeightKg: number | null;
  totalChangeKg: number;
  changeFromPreviousKg: number;
  bmi: number | null;
  bmiCategory: {
    category: string;
    badgeClass: string;
  };
  preferredUnit: WeightUnit;
  onToggleUnit: () => void;
}

export function SummaryMetrics({
  currentWeightKg,
  previousWeightKg,
  totalChangeKg,
  changeFromPreviousKg,
  bmi,
  bmiCategory,
  preferredUnit,
  onToggleUnit,
}: SummaryMetricsProps) {
  const currentWeightPrimary =
    currentWeightKg !== null
      ? preferredUnit === "lbs"
        ? kgToLbs(currentWeightKg)
        : currentWeightKg.toFixed(1)
      : "--";

  const currentWeightSecondary =
    currentWeightKg !== null
      ? preferredUnit === "lbs"
        ? `${currentWeightKg.toFixed(1)} kg`
        : `${kgToLbs(currentWeightKg)} lbs`
      : "--";

  const previousWeightDisplay =
    previousWeightKg !== null
      ? preferredUnit === "lbs"
        ? `${kgToLbs(previousWeightKg)} lbs`
        : `${previousWeightKg.toFixed(1)} kg`
      : "No prior log";

  const formattedChangePrevious =
    preferredUnit === "lbs"
      ? (changeFromPreviousKg * 2.20462).toFixed(1)
      : changeFromPreviousKg.toFixed(1);

  const formattedTotalChange =
    preferredUnit === "lbs"
      ? (totalChangeKg * 2.20462).toFixed(1)
      : totalChangeKg.toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Weight Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/40 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
          <button
            onClick={onToggleUnit}
            title="Click to toggle KG / LBS"
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            Switch to {preferredUnit === "kg" ? "LBS" : "KG"}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentWeightPrimary}
          </span>
          <span className="text-sm font-bold text-slate-500 uppercase">{preferredUnit}</span>
        </div>

        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Alternate: {currentWeightSecondary}</span>
          <Scale className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
        </div>
      </div>

      {/* 2. Previous Recorded Weight Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/40 group">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Previous Entry</span>
          <History className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {previousWeightDisplay}
          </span>
        </div>

        <div className="mt-2 text-xs flex items-center gap-1.5">
          {changeFromPreviousKg < 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {formattedChangePrevious} {preferredUnit}
            </span>
          ) : changeFromPreviousKg > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{formattedChangePrevious} {preferredUnit}
            </span>
          ) : (
            <span className="text-slate-400 font-medium flex items-center gap-0.5">
              <Minus className="w-3.5 h-3.5" /> No change
            </span>
          )}
          <span className="text-slate-400 text-[11px]">vs last entry</span>
        </div>
      </div>

      {/* 3. Total Weight Change */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/40 group">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Progress</span>
          <Activity className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {Number(formattedTotalChange) > 0 ? `+${formattedTotalChange}` : formattedTotalChange}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase">{preferredUnit}</span>
        </div>

        <div className="mt-2 text-xs text-slate-400">
          Since initial recorded baseline measurement
        </div>
      </div>

      {/* 4. Current BMI Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Current BMI</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiCategory.badgeClass}`}
          >
            {bmiCategory.category}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {bmi !== null ? bmi.toFixed(1) : "--"}
          </span>
          <span className="text-xs font-semibold text-slate-400">kg/m²</span>
        </div>

        <div className="mt-2 text-xs text-slate-400">
          WHO adult standard classification
        </div>
      </div>
    </div>
  );
}

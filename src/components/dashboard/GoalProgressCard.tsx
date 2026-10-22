"use client";

import React from "react";
import { Target, Flag, TrendingDown, TrendingUp, CheckCircle, Edit3 } from "lucide-react";
import { WeightUnit } from "@/lib/calculations";

interface GoalProgressCardProps {
  goal: {
    id: string;
    goalType: "lose" | "gain" | "maintain";
    startingWeightKg: number;
    startingWeightLbs: number;
    targetWeightKg: number;
    targetWeightLbs: number;
    progressPercent: number;
    remainingKg: number;
    remainingFormatted: string;
    achievedKg: number;
    isCompleted: boolean;
    direction: "loss" | "gain" | "maintenance";
  } | null;
  currentWeightKg: number | null;
  preferredUnit: WeightUnit;
  onEditGoal: () => void;
}

export function GoalProgressCard({
  goal,
  currentWeightKg,
  preferredUnit,
  onEditGoal,
}: GoalProgressCardProps) {
  if (!goal) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">No Goal Set Yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Set your starting and target weight to unlock real-time progress tracking.
        </p>
        <button
          onClick={onEditGoal}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          Set Fitness Goal
        </button>
      </div>
    );
  }

  const startingVal = preferredUnit === "lbs" ? goal.startingWeightLbs : goal.startingWeightKg;
  const targetVal = preferredUnit === "lbs" ? goal.targetWeightLbs : goal.targetWeightKg;
  const currentVal =
    currentWeightKg !== null
      ? preferredUnit === "lbs"
        ? (currentWeightKg * 2.20462).toFixed(1)
        : currentWeightKg.toFixed(1)
      : "--";

  const goalTypeLabels = {
    lose: "Weight Loss Goal",
    gain: "Muscle / Weight Gain Goal",
    maintain: "Weight Maintenance Goal",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            {goal.goalType === "lose" ? (
              <TrendingDown className="w-5 h-5" />
            ) : goal.goalType === "gain" ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              {goalTypeLabels[goal.goalType]}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {goal.isCompleted ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Target Achieved!
                </span>
              ) : (
                `${goal.remainingFormatted} remaining to reach target`
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onEditGoal}
          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Edit Goal"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Metric and Percentage */}
      <div className="my-5">
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {goal.progressPercent}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              completed
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {goal.goalType === "lose" ? "Cutting" : goal.goalType === "gain" ? "Bulking" : "Maintaining"}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${Math.min(100, Math.max(2, goal.progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Starting vs Current vs Target Milestones */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Starting
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {startingVal} <span className="text-[10px] font-normal text-slate-400">{preferredUnit}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            Current
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {currentVal} <span className="text-[10px] font-normal text-slate-400">{preferredUnit}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Flag className="w-2.5 h-2.5 text-teal-500" /> Target
          </div>
          <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-0.5">
            {targetVal} <span className="text-[10px] font-normal text-slate-400">{preferredUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

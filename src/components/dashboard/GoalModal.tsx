"use client";

import React, { useState, useEffect } from "react";
import { X, Target, TrendingDown, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { WeightUnit, lbsToKg, kgToLbs } from "@/lib/calculations";
import { useToast } from "@/components/ui/Toast";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preferredUnit: WeightUnit;
  currentWeightKg: number | null;
  existingGoal?: {
    id: string;
    goalType: "lose" | "gain" | "maintain";
    startingWeightKg: number;
    targetWeightKg: number;
  } | null;
}

export function GoalModal({
  isOpen,
  onClose,
  onSuccess,
  preferredUnit,
  currentWeightKg,
  existingGoal,
}: GoalModalProps) {
  const { toast } = useToast();
  const [goalType, setGoalType] = useState<"lose" | "gain" | "maintain">("lose");
  const [startingWeightInput, setStartingWeightInput] = useState<string>("");
  const [targetWeightInput, setTargetWeightInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (existingGoal) {
      setGoalType(existingGoal.goalType);
      const start =
        preferredUnit === "lbs"
          ? kgToLbs(existingGoal.startingWeightKg).toString()
          : existingGoal.startingWeightKg.toString();
      const target =
        preferredUnit === "lbs"
          ? kgToLbs(existingGoal.targetWeightKg).toString()
          : existingGoal.targetWeightKg.toString();
      setStartingWeightInput(start);
      setTargetWeightInput(target);
    } else {
      setGoalType("lose");
      const current = currentWeightKg || 75;
      const start = preferredUnit === "lbs" ? kgToLbs(current).toString() : current.toString();
      const target =
        preferredUnit === "lbs"
          ? kgToLbs(current - 5).toString()
          : (current - 5).toString();
      setStartingWeightInput(start);
      setTargetWeightInput(target);
    }
  }, [existingGoal, preferredUnit, currentWeightKg, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startVal = parseFloat(startingWeightInput);
    const targetVal = parseFloat(targetWeightInput);

    if (isNaN(startVal) || isNaN(targetVal)) {
      toast.error("Please enter valid starting and target weights");
      return;
    }

    const startKg = preferredUnit === "lbs" ? lbsToKg(startVal) : startVal;
    const targetKg = preferredUnit === "lbs" ? lbsToKg(targetVal) : targetVal;

    if (goalType === "lose" && targetKg >= startKg) {
      toast.error("For a weight loss goal, target weight must be lower than starting weight.");
      return;
    }
    if (goalType === "gain" && targetKg <= startKg) {
      toast.error("For a weight gain goal, target weight must be higher than starting weight.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType,
          startingWeightKg: Number(startKg.toFixed(2)),
          targetWeightKg: Number(targetKg.toFixed(2)),
          status: "active",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update fitness goal");
      }

      toast.success("Fitness goal updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save goal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Customize Fitness Goal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your focus and target milestone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Goal Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Goal Focus
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGoalType("lose")}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  goalType === "lose"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span>Weight Loss</span>
              </button>

              <button
                type="button"
                onClick={() => setGoalType("gain")}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  goalType === "gain"
                    ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <span>Muscle Gain</span>
              </button>

              <button
                type="button"
                onClick={() => setGoalType("maintain")}
                className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all ${
                  goalType === "maintain"
                    ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Maintain</span>
              </button>
            </div>
          </div>

          {/* Starting Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Starting Weight ({preferredUnit.toUpperCase()})
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={startingWeightInput}
              onChange={(e) => setStartingWeightInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Target Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Weight ({preferredUnit.toUpperCase()})
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

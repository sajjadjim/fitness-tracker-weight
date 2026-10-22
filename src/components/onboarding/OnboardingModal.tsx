"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Scale, Ruler, Target, CheckCircle2, Loader2 } from "lucide-react";
import { WeightUnit, lbsToKg } from "@/lib/calculations";
import { useToast } from "@/components/ui/Toast";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userEmail?: string | null;
  userName?: string | null;
}

export function OnboardingModal({
  isOpen,
  onComplete,
  userEmail: _userEmail,
  userName,
}: OnboardingModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [heightCm, setHeightCm] = useState<number>(175);
  const [currentWeight, setCurrentWeight] = useState<string>("75");
  const [goalType, setGoalType] = useState<"lose" | "gain" | "maintain">("lose");
  const [targetWeight, setTargetWeight] = useState<string>("70");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    const curVal = parseFloat(currentWeight);
    const tarVal = parseFloat(targetWeight);

    if (isNaN(curVal) || isNaN(tarVal)) {
      toast.error("Please provide valid weights");
      return;
    }

    const curKg = unit === "lbs" ? lbsToKg(curVal) : curVal;
    const tarKg = unit === "lbs" ? lbsToKg(tarVal) : tarVal;

    setSubmitting(true);
    try {
      // 1. Update user profile with height, preferredUnit
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm,
          preferredUnit: unit,
          name: userName || "Athlete",
        }),
      });

      // 2. Create initial weight entry
      await fetch("/api/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: Number(curKg.toFixed(2)),
          recordedAt: new Date().toISOString(),
          note: "Baseline onboarding measurement",
        }),
      });

      // 3. Create active fitness goal
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType,
          startingWeightKg: Number(curKg.toFixed(2)),
          targetWeightKg: Number(tarKg.toFixed(2)),
          status: "active",
        }),
      });

      toast.success("Profile setup complete! Welcome to FitTrack.");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Onboarding setup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Welcome to FitTrack
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Let&apos;s personalize your BMI and fitness goals in 3 quick steps
            </p>
          </div>
        </div>

        {/* Step Progress indicators */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Preferred Unit and Height */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUnit("kg")}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                    unit === "kg"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Kilograms (KG)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("lbs")}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                    unit === "lbs"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Pounds (LBS)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-emerald-500" /> Height (cm)
                </label>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {heightCm} cm ({(heightCm / 30.48).toFixed(1)} ft)
                </span>
              </div>
              <input
                type="range"
                min="120"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>120 cm (3.9 ft)</span>
                <span>Standard adult height</span>
                <span>230 cm (7.5 ft)</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Baseline Weight */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-500" /> Current Baseline Weight ({unit.toUpperCase()})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder={unit === "lbs" ? "165.0" : "75.0"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 uppercase">
                  {unit}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                This will be stored as your day 1 starting measurement.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Fitness Goal */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" /> Select Fitness Target
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: "lose", label: "Lose Weight" },
                  { type: "gain", label: "Gain Muscle" },
                  { type: "maintain", label: "Maintain" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setGoalType(item.type as any)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all ${
                      goalType === item.type
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Target Goal Weight ({unit.toUpperCase()})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder={unit === "lbs" ? "155.0" : "70.0"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 uppercase">
                  {unit}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Finalizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Start Tracking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

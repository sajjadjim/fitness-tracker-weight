"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, Calendar, FileText, Sparkles, Loader2 } from "lucide-react";
import { WeightUnit, lbsToKg, kgToLbs, calculateBmi, getBmiCategory } from "@/lib/calculations";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preferredUnit: WeightUnit;
  userHeightCm: number;
  initialEntry?: {
    id: string;
    weightKg: number;
    recordedAt: string | Date;
    note?: string;
  } | null;
}

export function AddWeightModal({
  isOpen,
  onClose,
  onSuccess,
  preferredUnit,
  userHeightCm,
  initialEntry,
}: AddWeightModalProps) {
  const { toast } = useToast();
  const { t, formatNum, locale } = useLanguage();
  const [weightInput, setWeightInput] = useState<string>("");
  const [recordedAt, setRecordedAt] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      const val =
        preferredUnit === "lbs"
          ? kgToLbs(initialEntry.weightKg).toString()
          : initialEntry.weightKg.toString();
      setWeightInput(val);
      const d = new Date(initialEntry.recordedAt);
      setRecordedAt(d.toISOString().slice(0, 16));
      setNote(initialEntry.note || "");
    } else {
      setWeightInput("");
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setRecordedAt(localISOTime);
      setNote("");
    }
  }, [initialEntry, preferredUnit, isOpen]);

  if (!isOpen) return null;

  // Live BMI calculation preview
  const enteredNum = parseFloat(weightInput);
  const normalizedKg = !isNaN(enteredNum) && enteredNum > 0
    ? preferredUnit === "lbs"
      ? lbsToKg(enteredNum)
      : enteredNum
    : null;

  const liveBmi = normalizedKg ? calculateBmi(normalizedKg, userHeightCm) : null;
  const liveBmiCategory = getBmiCategory(liveBmi);

  const localizedCategory = () => {
    const cat = liveBmiCategory.category.toLowerCase();
    if (cat.includes("under")) return t("underweight");
    if (cat.includes("normal")) return t("normalWeight");
    if (cat.includes("over")) return t("overweight");
    return t("obesity");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedKg || normalizedKg < 15 || normalizedKg > 450) {
      toast.error(
        locale === "bn"
          ? "অনুগ্রহ করে ১৫ থেকে ৪৫০ কেজির মধ্যে একটি বৈধ ওজন লিখুন।"
          : "Please enter a valid weight between 15 kg and 450 kg (33 - 990 lbs)"
      );
      return;
    }

    setSubmitting(true);
    try {
      const url = initialEntry ? `/api/weights/${initialEntry.id}` : "/api/weights";
      const method = initialEntry ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: Number(normalizedKg.toFixed(2)),
          recordedAt: new Date(recordedAt).toISOString(),
          note: note.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save weight measurement");
      }

      toast.success(
        initialEntry
          ? locale === "bn" ? "ওজন রেকর্ড সফলভাবে আপডেট করা হয়েছে" : "Weight measurement updated"
          : locale === "bn" ? "নতুন ওজন সফলভাবে যোগ করা হয়েছে!" : "Weight entry recorded successfully!"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong saving weight");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialEntry ? t("editWeightEntry") : t("logDailyWeight")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("modalSubtitleWeight")}
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
          {/* Weight Input Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t("currentWeight")} ({preferredUnit.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="10"
                max="999"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={preferredUnit === "lbs" ? "165.4" : "75.2"}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400 uppercase">
                {preferredUnit}
              </span>
            </div>
          </div>

          {/* Live BMI Preview Pill */}
          {liveBmi !== null && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("calculatedBmi")}:
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNum(liveBmi.toFixed(1))}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${liveBmiCategory.badgeClass}`}
              >
                {localizedCategory()}
              </span>
            </div>
          )}

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t("dateTime")}
            </label>
            <input
              type="datetime-local"
              required
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> {t("noteOptional")}
            </label>
            <input
              type="text"
              maxLength={250}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={locale === "bn" ? "যেমন: সকালের খালি পেটে, ওয়ার্কআউটের পরে..." : "e.g. Fasted morning check, post-leg-day..."}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("saving")}
                </>
              ) : initialEntry ? (
                t("updateEntry")
              ) : (
                t("saveEntry")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

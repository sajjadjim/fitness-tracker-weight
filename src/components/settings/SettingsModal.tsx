"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Ruler,
  Scale,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { WeightUnit } from "@/lib/calculations";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    heightCm: number;
    preferredUnit: WeightUnit;
    isDemoUser?: boolean;
  };
}

export function SettingsModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user.name || "");
  const [heightCm, setHeightCm] = useState(user.heightCm || 175);
  const [unit, setUnit] = useState<WeightUnit>(user.preferredUnit || "kg");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user.name || "");
    setHeightCm(user.heightCm || 175);
    setUnit(user.preferredUnit || "kg");
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          heightCm,
          preferredUnit: unit,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user profile");
      }

      toast.success("Profile and settings updated!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      toast.info("Your account and fitness data have been removed.");
      await logout();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Account deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-500">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Profile & Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Height Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-500" /> Height (cm)
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
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
          </div>

          {/* Preferred Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-500" /> Default Measurement Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUnit("kg")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  unit === "kg"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Kilograms (KG)
              </button>
              <button
                type="button"
                onClick={() => setUnit("lbs")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  unit === "lbs"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                Pounds (LBS)
              </button>
            </div>
          </div>

          {/* Dark / Light Theme Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Interface Theme
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:border-emerald-500 transition-colors"
            >
              {theme === "dark" ? "Dark Theme" : "Light Theme"} (Click to Switch)
            </button>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account and All History</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-300/60 dark:border-rose-900/40 text-xs">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4" /> Are you completely sure?
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                  All your weight records and goals will be permanently purged.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold flex items-center gap-1"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

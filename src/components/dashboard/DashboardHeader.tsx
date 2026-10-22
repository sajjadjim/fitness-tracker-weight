"use client";

import React from "react";
import {
  Activity,
  Plus,
  Moon,
  Sun,
  Settings,
  LogOut,
  Scale,
} from "lucide-react";
import { WeightUnit } from "@/lib/calculations";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardHeaderProps {
  user: {
    name?: string;
    email?: string;
    photoURL?: string;
    preferredUnit: WeightUnit;
    isDemoUser?: boolean;
  };
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleUnit: () => void;
}

export function DashboardHeader({
  user,
  onOpenAddModal,
  onOpenSettingsModal,
  onToggleUnit,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                FitTrack
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                Pro
              </span>
              {user.isDemoUser && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart Weight & BMI Tracking
            </p>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
            title="Toggle between KG and LBS"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span className="uppercase">{user.preferredUnit}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Toggle dark / light mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Add Weight CTA */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Profile & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
                {(user.name || "A")[0].toUpperCase()}
              </div>
            )}

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { Activity, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 animate-pulse">
            <Activity className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          </div>
        </div>
        <div className="mt-5 text-center">
          <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            FitTrack
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <DashboardView />;
  }

  return <LandingPage />;
}

"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "./DashboardHeader";
import { SummaryMetrics } from "./SummaryMetrics";
import { BmiGauge } from "./BmiGauge";
import { GoalProgressCard } from "./GoalProgressCard";
import { WeightChart } from "./WeightChart";
import { WeightHistoryView } from "../history/WeightHistoryView";
import { AddWeightModal } from "./AddWeightModal";
import { GoalModal } from "./GoalModal";
import { SettingsModal } from "../settings/SettingsModal";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { WeightUnit } from "@/lib/calculations";
import { Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function DashboardView() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Fetch all dashboard summary data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) {
        throw new Error("Failed to load dashboard summary");
      }
      return res.json();
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
  };

  const handleToggleUnit = async () => {
    if (!data?.user) return;
    const newUnit: WeightUnit = data.user.preferredUnit === "kg" ? "lbs" : "kg";
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredUnit: newUnit }),
      });
      handleRefresh();
      toast.info(`Switched default unit to ${newUnit.toUpperCase()}`);
    } catch {
      toast.error("Failed to switch unit");
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          Loading your personal fitness telemetry...
        </p>
        <p className="text-xs text-slate-400 mt-1">Calculating BMI and real-time milestones</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Failed to load dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {(error as Error)?.message || "An unexpected error occurred while fetching your records."}
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("fittrack_demo_active");
              window.location.reload();
            }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            Reset Session
          </button>
        </div>
      </div>
    );
  }

  const user = data.user;
  const preferredUnit: WeightUnit = user.preferredUnit || "kg";
  const userHeightCm = user.heightCm || 175;
  const showOnboarding = data.totalEntriesCount === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Dashboard Top Header */}
      <DashboardHeader
        user={user}
        onOpenAddModal={() => {
          setEditingEntry(null);
          setIsAddModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onToggleUnit={handleToggleUnit}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Welcome greeting banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-5 rounded-3xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user.name || "Athlete"}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Telemetry active • Height: {userHeightCm} cm • Preferred: {preferredUnit.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleRefresh()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:text-emerald-500 text-slate-600 dark:text-slate-400 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-emerald-500" : ""}`} />
            </button>

            <button
              onClick={() => {
                setEditingEntry(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today&apos;s Weight</span>
            </button>
          </div>
        </div>

        {/* 1. Metric Summary Cards */}
        <SummaryMetrics
          currentWeightKg={data.currentWeightKg}
          previousWeightKg={data.previousWeightKg}
          totalChangeKg={data.totalChangeKg}
          changeFromPreviousKg={data.changeFromPreviousKg}
          bmi={data.bmi}
          bmiCategory={data.bmiCategory}
          preferredUnit={preferredUnit}
          onToggleUnit={handleToggleUnit}
        />

        {/* 2. Visual Split Row: BMI Gauge & Goal Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BmiGauge
            bmi={data.bmi}
            bmiCategory={data.bmiCategory}
            healthyRange={data.healthyRange}
            preferredUnit={preferredUnit}
          />

          <GoalProgressCard
            goal={data.goal}
            currentWeightKg={data.currentWeightKg}
            preferredUnit={preferredUnit}
            onEditGoal={() => setIsGoalModalOpen(true)}
          />
        </div>

        {/* 3. Interactive Weight Chart */}
        <WeightChart
          entries={data.chartEntries}
          targetWeightKg={data.goal?.targetWeightKg}
          preferredUnit={preferredUnit}
        />

        {/* 4. Complete Measurement History & CSV Export */}
        <WeightHistoryView
          entries={data.chartEntries.slice().reverse()}
          preferredUnit={preferredUnit}
          onEdit={handleEditEntry}
          onRefresh={handleRefresh}
          onOpenAddModal={() => {
            setEditingEntry(null);
            setIsAddModalOpen(true);
          }}
        />
      </main>

      {/* Modals */}
      <AddWeightModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
        }}
        onSuccess={handleRefresh}
        preferredUnit={preferredUnit}
        userHeightCm={userHeightCm}
        initialEntry={editingEntry}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={handleRefresh}
        preferredUnit={preferredUnit}
        currentWeightKg={data.currentWeightKg}
        existingGoal={data.goal}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSuccess={handleRefresh}
        user={user}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleRefresh}
        userEmail={user.email}
        userName={user.name}
      />
    </div>
  );
}

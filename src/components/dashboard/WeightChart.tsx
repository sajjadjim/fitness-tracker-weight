"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type RangeFilter = "7d" | "30d" | "90d" | "1y" | "all";

interface WeightChartProps {
  entries: Array<{
    id: string;
    weightKg: number;
    weightLbs: number;
    recordedAt: string | Date;
    note?: string;
  }>;
  targetWeightKg?: number;
  preferredUnit: "kg" | "lbs";
}

export function WeightChart({
  entries,
  targetWeightKg,
  preferredUnit,
}: WeightChartProps) {
  const { t, formatNum } = useLanguage();
  const [range, setRange] = useState<RangeFilter>("30d");

  const filteredData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const now = new Date().getTime();
    let daysCutoff = 30;
    if (range === "7d") daysCutoff = 7;
    if (range === "30d") daysCutoff = 30;
    if (range === "90d") daysCutoff = 90;
    if (range === "1y") daysCutoff = 365;

    const filtered =
      range === "all"
        ? [...entries]
        : entries.filter((e) => {
            const time = new Date(e.recordedAt).getTime();
            return now - time <= daysCutoff * 24 * 60 * 60 * 1000;
          });

    return filtered.map((e) => {
      const d = new Date(e.recordedAt);
      const val = preferredUnit === "lbs" ? e.weightLbs : e.weightKg;
      return {
        id: e.id,
        rawDate: d,
        dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        weight: val,
        note: e.note || "",
      };
    });
  }, [entries, range, preferredUnit]);

  // Target in preferred unit
  const targetWeight = targetWeightKg
    ? preferredUnit === "lbs"
      ? Number((targetWeightKg * 2.20462).toFixed(1))
      : targetWeightKg
    : undefined;

  // Calculate min & max for Y-Axis padding
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [50, 100];
    const weights = filteredData.map((d) => d.weight);
    if (targetWeight) weights.push(targetWeight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = Math.max(1, (max - min) * 0.15);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [filteredData, targetWeight]);

  // Net change in current filtered view
  const rangeNetChange = useMemo(() => {
    if (filteredData.length < 2) return null;
    const start = filteredData[0].weight;
    const end = filteredData[filteredData.length - 1].weight;
    const diff = Number((end - start).toFixed(1));
    return diff;
  }, [filteredData]);

  const filterLabels: Record<RangeFilter, string> = {
    "7d": t("filter7d"),
    "30d": t("filter30d"),
    "90d": t("filter90d"),
    "1y": t("filter1y"),
    all: t("filterAll"),
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
              {t("weightProgression")}
            </h3>
            {rangeNetChange !== null && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  rangeNetChange <= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {rangeNetChange <= 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {rangeNetChange > 0 ? `+${formatNum(rangeNetChange)}` : formatNum(rangeNetChange)} {preferredUnit}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("chartSubtitle")}
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
          {(["7d", "30d", "90d", "1y", "all"] as RangeFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                range === tab
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {filterLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Calendar className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t("noEntriesFound")}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t("noEntriesFoundDesc")}
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />

              <XAxis
                dataKey="dateFormatted"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dy={8}
              />

              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dx={-4}
                unit={` ${preferredUnit}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs backdrop-blur-md">
                        <div className="text-slate-400 text-[11px] mb-1">{data.fullDate}</div>
                        <div className="text-base font-bold text-emerald-400">
                          {formatNum(data.weight)} {preferredUnit}
                        </div>
                        {data.note && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 max-w-[200px] truncate">
                            &ldquo;{data.note}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {targetWeight && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#14b8a6"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `${t("goalLabel")}: ${formatNum(targetWeight)} ${preferredUnit}`,
                    position: "right",
                    fill: "#14b8a6",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#weightGradient)"
                activeDot={{
                  r: 6,
                  fill: "#10b981",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

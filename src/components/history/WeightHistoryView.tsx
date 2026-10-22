"use client";

import React, { useState } from "react";
import {
  Download,
  Search,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Loader2,
  Plus,
} from "lucide-react";
import { WeightUnit } from "@/lib/calculations";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface WeightHistoryViewProps {
  entries: Array<{
    id: string;
    weightKg: number;
    weightLbs: number;
    recordedAt: string | Date;
    note?: string;
  }>;
  preferredUnit: WeightUnit;
  onEdit: (entry: any) => void;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export function WeightHistoryView({
  entries,
  preferredUnit,
  onEdit,
  onRefresh,
  onOpenAddModal,
}: WeightHistoryViewProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEntries = entries.filter((e) => {
    const noteMatch = e.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = formatDateTime(e.recordedAt).toLowerCase().includes(searchTerm.toLowerCase());
    const weightMatch = e.weightKg.toString().includes(searchTerm) || e.weightLbs.toString().includes(searchTerm);
    return noteMatch || dateMatch || weightMatch;
  });

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/weights/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete entry");
      }

      toast.success("Measurement deleted");
      setDeleteTargetId(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete weight log");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const link = document.createElement("a");
    link.href = "/api/weights/export";
    link.setAttribute("download", "fittrack_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Downloading CSV export...");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm">
      {/* Top Bar: Search, Add, CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
            Measurement History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {entries.length} total recorded entries • Complete data isolation
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-44 sm:w-56"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-colors disabled:opacity-50"
            title="Download CSV of all recorded measurements"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          {/* Add Weight button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Weight</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      {filteredEntries.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Calendar className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No weight entries match your criteria
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Log your daily weight or try adjusting your search filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Weight ({preferredUnit.toUpperCase()})</th>
                <th className="py-3 px-4">Alternate</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredEntries.map((e) => {
                const primaryVal = preferredUnit === "lbs" ? e.weightLbs : e.weightKg;
                const altVal = preferredUnit === "lbs" ? `${e.weightKg} kg` : `${e.weightLbs} lbs`;

                return (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      {formatDateTime(e.recordedAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                      {primaryVal}{" "}
                      <span className="text-[11px] font-normal text-slate-400">
                        {preferredUnit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{altVal}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {e.note || <span className="text-slate-300 dark:text-slate-600 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(e)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(e.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Weight Measurement?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              This action cannot be undone. All dashboard calculations and charts will update immediately.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { WeightEntry } from "@/lib/models/WeightEntry";
import { connectToDatabase } from "@/lib/mongodb";
import { kgToLbs } from "@/lib/calculations";
import { getFallbackWeights } from "@/lib/fallbackStore";
import mongoose from "mongoose";

export async function GET() {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let entries: any[] = [];

    if (mongoose.connection.readyState === 1) {
      entries = await WeightEntry.find({ userId: auth.user._id })
        .sort({ recordedAt: -1 })
        .exec();
    } else {
      entries = getFallbackWeights(String(auth.user._id)).sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
    }

    // Generate CSV Header & rows
    const csvRows = [
      ["Date", "Time", "Weight (kg)", "Weight (lbs)", "Note"].join(","),
    ];

    for (const entry of entries) {
      const d = new Date(entry.recordedAt);
      const dateStr = d.toISOString().split("T")[0];
      const timeStr = d.toTimeString().split(" ")[0].slice(0, 5);
      const weightKg = entry.weightKg.toFixed(2);
      const weightLbs = kgToLbs(entry.weightKg).toFixed(2);
      const noteClean = `"${(entry.note || "").replace(/"/g, '""')}"`;

      csvRows.push([dateStr, timeStr, weightKg, weightLbs, noteClean].join(","));
    }

    const csvContent = csvRows.join("\n");
    const filename = `fittrack_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/weights/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { WeightEntry } from "@/lib/models/WeightEntry";
import { WeightEntryInputSchema } from "@/lib/validations/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

import { getFallbackWeights } from "@/lib/fallbackStore";

export async function GET(request: Request) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const limitParam = searchParams.get("limit");
    const sortParam = searchParams.get("sort") || "desc"; // desc or asc

    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const query: any = { userId: auth.user._id };

      if (daysParam && daysParam !== "all") {
        const days = parseInt(daysParam, 10);
        if (!isNaN(days) && days > 0) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          query.recordedAt = { $gte: cutoff };
        }
      }

      let q = WeightEntry.find(query).sort({ recordedAt: sortParam === "asc" ? 1 : -1 });

      if (limitParam) {
        const limit = parseInt(limitParam, 10);
        if (!isNaN(limit) && limit > 0) {
          q = q.limit(limit);
        }
      }

      const entries = await q.exec();
      return NextResponse.json({ entries });
    } else {
      // In-memory fallback
      let list = [...getFallbackWeights(String(auth.user._id))];

      if (daysParam && daysParam !== "all") {
        const days = parseInt(daysParam, 10);
        if (!isNaN(days) && days > 0) {
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          list = list.filter((e) => new Date(e.recordedAt) >= cutoff);
        }
      }

      list.sort((a, b) => {
        const diff = new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
        return sortParam === "asc" ? diff : -diff;
      });

      if (limitParam) {
        const limit = parseInt(limitParam, 10);
        if (!isNaN(limit)) {
          list = list.slice(0, limit);
        }
      }

      return NextResponse.json({ entries: list });
    }
  } catch (error) {
    console.error("GET /api/weights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = WeightEntryInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { weightKg, recordedAt, note } = validation.data;
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const entry = await WeightEntry.create({
        userId: auth.user._id,
        weightKg,
        recordedAt: recordedAt || new Date(),
        note: note || "",
      });

      return NextResponse.json({ entry }, { status: 201 });
    } else {
      const newEntry = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: String(auth.user._id),
        weightKg,
        recordedAt: recordedAt || new Date(),
        note: note || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const list = getFallbackWeights(String(auth.user._id));
      list.unshift(newEntry);
      return NextResponse.json({ entry: newEntry }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/weights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { WeightEntry } from "@/lib/models/WeightEntry";
import { WeightEntryUpdateSchema } from "@/lib/validations/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { getFallbackWeights } from "@/lib/fallbackStore";
import mongoose from "mongoose";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = WeightEntryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const entry = await WeightEntry.findOne({ _id: id, userId: auth.user._id });
      if (!entry) {
        return NextResponse.json({ error: "Weight entry not found" }, { status: 404 });
      }

      if (validation.data.weightKg !== undefined) {
        entry.weightKg = validation.data.weightKg;
      }
      if (validation.data.recordedAt !== undefined) {
        entry.recordedAt = validation.data.recordedAt;
      }
      if (validation.data.note !== undefined) {
        entry.note = validation.data.note;
      }

      await entry.save();
      return NextResponse.json({ entry });
    } else {
      const list = getFallbackWeights(String(auth.user._id));
      const entry = list.find((e) => String(e._id) === id);
      if (!entry) {
        return NextResponse.json({ error: "Weight entry not found" }, { status: 404 });
      }

      if (validation.data.weightKg !== undefined) entry.weightKg = validation.data.weightKg;
      if (validation.data.recordedAt !== undefined) entry.recordedAt = validation.data.recordedAt;
      if (validation.data.note !== undefined) entry.note = validation.data.note;
      entry.updatedAt = new Date();

      return NextResponse.json({ entry });
    }
  } catch (error) {
    console.error("PATCH /api/weights/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const deleted = await WeightEntry.findOneAndDelete({ _id: id, userId: auth.user._id });
      if (!deleted) {
        return NextResponse.json({ error: "Weight entry not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Entry deleted successfully" });
    } else {
      const list = getFallbackWeights(String(auth.user._id));
      const idx = list.findIndex((e) => String(e._id) === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Weight entry not found" }, { status: 404 });
      }
      list.splice(idx, 1);
      return NextResponse.json({ success: true, message: "Entry deleted successfully" });
    }
  } catch (error) {
    console.error("DELETE /api/weights/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

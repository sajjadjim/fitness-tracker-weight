import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { FitnessGoal } from "@/lib/models/FitnessGoal";
import { connectToDatabase } from "@/lib/mongodb";
import { getFallbackGoal, setFallbackGoal } from "@/lib/fallbackStore";
import mongoose from "mongoose";
import { z } from "zod";

const GoalPatchSchema = z.object({
  goalType: z.enum(["lose", "gain", "maintain"]).optional(),
  startingWeightKg: z.number().min(15).max(450).optional(),
  targetWeightKg: z.number().min(15).max(450).optional(),
  status: z.enum(["active", "completed", "abandoned"]).optional(),
});

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
    const validation = GoalPatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const goal = await FitnessGoal.findOne({ _id: id, userId: auth.user._id });
      if (!goal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      Object.assign(goal, validation.data);
      await goal.save();
      return NextResponse.json({ goal });
    } else {
      const goal = getFallbackGoal(String(auth.user._id));
      if (!goal || String(goal._id) !== id) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }
      Object.assign(goal, validation.data);
      goal.updatedAt = new Date();
      setFallbackGoal(String(auth.user._id), goal);
      return NextResponse.json({ goal });
    }
  } catch (error) {
    console.error("PATCH /api/goals/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { FitnessGoal } from "@/lib/models/FitnessGoal";
import { FitnessGoalInputSchema } from "@/lib/validations/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { setFallbackGoal } from "@/lib/fallbackStore";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = FitnessGoalInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { goalType, startingWeightKg, targetWeightKg, status } = validation.data;
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      if (status === "active") {
        // Mark previous active goals as abandoned
        await FitnessGoal.updateMany(
          { userId: auth.user._id, status: "active" },
          { $set: { status: "abandoned" } }
        );
      }

      const goal = await FitnessGoal.create({
        userId: auth.user._id,
        goalType,
        startingWeightKg,
        targetWeightKg,
        status: status || "active",
      });

      return NextResponse.json({ goal }, { status: 201 });
    } else {
      const newGoal = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: String(auth.user._id),
        goalType,
        startingWeightKg,
        targetWeightKg,
        status: status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFallbackGoal(String(auth.user._id), newGoal);
      return NextResponse.json({ goal: newGoal }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

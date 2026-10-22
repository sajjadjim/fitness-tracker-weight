import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { FitnessGoal } from "@/lib/models/FitnessGoal";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

import { getFallbackGoal, setFallbackGoal } from "@/lib/fallbackStore";

export async function GET() {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const goal = await FitnessGoal.findOne({
        userId: auth.user._id,
        status: "active",
      }).sort({ createdAt: -1 });

      return NextResponse.json({ goal });
    } else {
      const goal = getFallbackGoal(String(auth.user._id));
      return NextResponse.json({ goal });
    }
  } catch (error) {
    console.error("GET /api/goals/current error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

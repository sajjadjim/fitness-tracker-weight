import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { WeightEntry } from "@/lib/models/WeightEntry";
import { FitnessGoal } from "@/lib/models/FitnessGoal";
import { connectToDatabase } from "@/lib/mongodb";
import {
  calculateBmi,
  getBmiCategory,
  getHealthyWeightRange,
  calculateGoalProgress,
  kgToLbs,
} from "@/lib/calculations";
import { getFallbackWeights, getFallbackGoal } from "@/lib/fallbackStore";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferredUnit = auth.user.preferredUnit || "kg";
    const heightCm = auth.user.heightCm || 175;

    await connectToDatabase();

    let entries: any[] = [];
    let goal: any = null;

    if (mongoose.connection.readyState === 1) {
      // Fetch sorted weight entries
      entries = await WeightEntry.find({ userId: auth.user._id })
        .sort({ recordedAt: -1 })
        .exec();

      // Fetch active goal
      goal = await FitnessGoal.findOne({
        userId: auth.user._id,
        status: "active",
      }).sort({ createdAt: -1 });
    } else {
      entries = getFallbackWeights(String(auth.user._id)).sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
      goal = getFallbackGoal(String(auth.user._id));
    }

    // Calculations
    const latestEntry = entries.length > 0 ? entries[0] : null;
    const previousEntry = entries.length > 1 ? entries[1] : null;
    const oldestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

    const currentWeightKg = latestEntry ? latestEntry.weightKg : null;
    const currentWeightLbs = currentWeightKg !== null ? kgToLbs(currentWeightKg) : null;

    const previousWeightKg = previousEntry ? previousEntry.weightKg : null;
    const previousWeightLbs = previousWeightKg !== null ? kgToLbs(previousWeightKg) : null;

    // Weight change from previous entry
    const changeFromPreviousKg =
      currentWeightKg !== null && previousWeightKg !== null
        ? Number((currentWeightKg - previousWeightKg).toFixed(1))
        : 0;

    // Total weight change from beginning
    const totalChangeKg =
      currentWeightKg !== null && oldestEntry
        ? Number((currentWeightKg - oldestEntry.weightKg).toFixed(1))
        : 0;

    // BMI
    const bmi = currentWeightKg !== null ? calculateBmi(currentWeightKg, heightCm) : null;
    const bmiCategory = getBmiCategory(bmi);
    const healthyRange = getHealthyWeightRange(heightCm);

    // Goal Progress
    const startingWeightKg = goal ? goal.startingWeightKg : (oldestEntry?.weightKg || currentWeightKg || 75);
    const targetWeightKg = goal ? goal.targetWeightKg : (currentWeightKg ? currentWeightKg - 5 : 70);
    const goalType = goal ? goal.goalType : "lose";

    const goalProgress = calculateGoalProgress(
      currentWeightKg || startingWeightKg,
      startingWeightKg,
      targetWeightKg,
      goalType,
      preferredUnit
    );

    // Chronological chart data (oldest to newest)
    const chartEntries = [...entries]
      .reverse()
      .map((e) => ({
        id: String(e._id),
        weightKg: e.weightKg,
        weightLbs: kgToLbs(e.weightKg),
        recordedAt: e.recordedAt,
        note: e.note || "",
      }));

    // Recent measurements (up to 10 latest)
    const recentMeasurements = entries.slice(0, 10).map((e) => ({
      id: String(e._id),
      weightKg: e.weightKg,
      weightLbs: kgToLbs(e.weightKg),
      recordedAt: e.recordedAt,
      note: e.note || "",
    }));

    return NextResponse.json({
      user: {
        id: String(auth.user._id),
        name: auth.user.name,
        email: auth.user.email,
        photoURL: auth.user.photoURL,
        heightCm,
        preferredUnit,
        timezone: auth.user.timezone || "UTC",
        isDemoUser: Boolean(auth.isDemoUser),
      },
      currentWeightKg,
      currentWeightLbs,
      previousWeightKg,
      previousWeightLbs,
      changeFromPreviousKg,
      totalChangeKg,
      bmi,
      bmiCategory,
      healthyRange,
      goal: goal
        ? {
            id: String(goal._id),
            goalType: goal.goalType,
            startingWeightKg: goal.startingWeightKg,
            startingWeightLbs: kgToLbs(goal.startingWeightKg),
            targetWeightKg: goal.targetWeightKg,
            targetWeightLbs: kgToLbs(goal.targetWeightKg),
            status: goal.status,
            ...goalProgress,
          }
        : null,
      chartEntries,
      recentMeasurements,
      totalEntriesCount: entries.length,
    });
  } catch (error) {
    console.error("GET /api/dashboard/summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

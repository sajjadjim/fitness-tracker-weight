import mongoose from "mongoose";

const fallbackWeights = new Map<string, any[]>();
const fallbackGoals = new Map<string, any>();

export function getFallbackWeights(userIdStr: string) {
  if (!fallbackWeights.has(userIdStr)) {
    // Generate realistic sample weight history for immediate visualization
    const now = new Date();
    const samples: any[] = [];
    const baseWeight = 78.5; // kg

    for (let i = 28; i >= 0; i -= 2) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const randomNoise = (Math.random() - 0.5) * 0.4;
      const trend = (28 - i) * 0.12; // gradual weight loss
      samples.push({
        _id: new mongoose.Types.ObjectId().toString(),
        userId: userIdStr,
        weightKg: Number((baseWeight - trend + randomNoise).toFixed(1)),
        recordedAt: d,
        note: i === 0 ? "Morning weigh-in after workout" : i === 14 ? "Mid-month check-in" : "",
        createdAt: d,
        updatedAt: d,
      });
    }
    fallbackWeights.set(userIdStr, samples);
  }
  return fallbackWeights.get(userIdStr)!;
}

export function getFallbackGoal(userIdStr: string) {
  if (!fallbackGoals.has(userIdStr)) {
    fallbackGoals.set(userIdStr, {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: userIdStr,
      goalType: "lose",
      startingWeightKg: 80.0,
      targetWeightKg: 72.0,
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }
  return fallbackGoals.get(userIdStr);
}

export function setFallbackGoal(userIdStr: string, goal: any) {
  fallbackGoals.set(userIdStr, goal);
}

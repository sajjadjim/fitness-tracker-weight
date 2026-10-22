export const KG_TO_LBS = 2.20462262185;

export type WeightUnit = "kg" | "lbs";

export interface BmiCategoryInfo {
  category: "Underweight" | "Normal weight" | "Overweight" | "Obesity";
  color: string;
  badgeClass: string;
  description: string;
  minBmi: number;
  maxBmi: number;
}

export function kgToLbs(kg: number): number {
  return Number((kg * KG_TO_LBS).toFixed(1));
}

export function lbsToKg(lbs: number): number {
  return Number((lbs / KG_TO_LBS).toFixed(2));
}

export function formatWeight(
  kg: number | null | undefined,
  unit: WeightUnit = "kg",
  includeUnit = true
): string {
  if (kg === null || kg === undefined || isNaN(kg)) return "--";
  const val = unit === "lbs" ? kgToLbs(kg) : Number(kg.toFixed(1));
  return includeUnit ? `${val} ${unit}` : `${val}`;
}

/**
 * Calculates BMI from weight in kg and height in cm.
 * Formula: weight (kg) / [height (m)]^2
 */
export function calculateBmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

export function getBmiCategory(bmi: number | null): BmiCategoryInfo {
  if (bmi === null || isNaN(bmi)) {
    return {
      category: "Normal weight",
      color: "#10b981",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "BMI calculation requires height and weight.",
      minBmi: 18.5,
      maxBmi: 24.9,
    };
  }

  if (bmi < 18.5) {
    return {
      category: "Underweight",
      color: "#38bdf8", // Sky blue
      badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      description: "Below the standard healthy weight range for adults.",
      minBmi: 0,
      maxBmi: 18.4,
    };
  } else if (bmi <= 24.9) {
    return {
      category: "Normal weight",
      color: "#10b981", // Emerald green
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Within the healthy reference weight range for adults.",
      minBmi: 18.5,
      maxBmi: 24.9,
    };
  } else if (bmi <= 29.9) {
    return {
      category: "Overweight",
      color: "#f59e0b", // Amber
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "Moderately above the recommended reference weight range.",
      minBmi: 25.0,
      maxBmi: 29.9,
    };
  } else {
    return {
      category: "Obesity",
      color: "#ef4444", // Red
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      description: "Substantially above recommended adult weight guidelines.",
      minBmi: 30.0,
      maxBmi: 50.0,
    };
  }
}

/**
 * Calculates the WHO reference healthy weight range for a given height in cm.
 * Healthy BMI is 18.5 to 24.9.
 */
export function getHealthyWeightRange(heightCm: number): {
  minKg: number;
  maxKg: number;
  minLbs: number;
  maxLbs: number;
} | null {
  if (!heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const heightSq = heightM * heightM;
  const minKg = Number((18.5 * heightSq).toFixed(1));
  const maxKg = Number((24.9 * heightSq).toFixed(1));
  return {
    minKg,
    maxKg,
    minLbs: kgToLbs(minKg),
    maxLbs: kgToLbs(maxKg),
  };
}

export interface GoalProgressResult {
  progressPercent: number;
  remainingKg: number;
  remainingFormatted: string;
  achievedKg: number;
  isCompleted: boolean;
  direction: "loss" | "gain" | "maintenance";
}

/**
 * Computes progress toward goal
 */
export function calculateGoalProgress(
  currentKg: number,
  startingKg: number,
  targetKg: number,
  goalType: "lose" | "gain" | "maintain",
  unit: WeightUnit = "kg"
): GoalProgressResult {
  if (!currentKg || !startingKg || !targetKg) {
    return {
      progressPercent: 0,
      remainingKg: 0,
      remainingFormatted: formatWeight(0, unit),
      achievedKg: 0,
      isCompleted: false,
      direction: goalType === "lose" ? "loss" : goalType === "gain" ? "gain" : "maintenance",
    };
  }

  if (goalType === "lose") {
    const totalToLose = Math.max(0.1, startingKg - targetKg);
    const lostSoFar = startingKg - currentKg;
    const remainingKg = Math.max(0, currentKg - targetKg);
    const progressPercent = Math.min(100, Math.max(0, Math.round((lostSoFar / totalToLose) * 100)));
    const isCompleted = currentKg <= targetKg;

    return {
      progressPercent,
      remainingKg: Number(remainingKg.toFixed(2)),
      remainingFormatted: formatWeight(remainingKg, unit),
      achievedKg: Number(lostSoFar.toFixed(2)),
      isCompleted,
      direction: "loss",
    };
  }

  if (goalType === "gain") {
    const totalToGain = Math.max(0.1, targetKg - startingKg);
    const gainedSoFar = currentKg - startingKg;
    const remainingKg = Math.max(0, targetKg - currentKg);
    const progressPercent = Math.min(100, Math.max(0, Math.round((gainedSoFar / totalToGain) * 100)));
    const isCompleted = currentKg >= targetKg;

    return {
      progressPercent,
      remainingKg: Number(remainingKg.toFixed(2)),
      remainingFormatted: formatWeight(remainingKg, unit),
      achievedKg: Number(gainedSoFar.toFixed(2)),
      isCompleted,
      direction: "gain",
    };
  }

  // maintain
  const diffFromTarget = Math.abs(currentKg - targetKg);
  // within 1.5 kg is considered 100% on track
  const progressPercent = diffFromTarget <= 1.5 ? 100 : Math.max(0, Math.round(100 - diffFromTarget * 15));
  return {
    progressPercent,
    remainingKg: Number(diffFromTarget.toFixed(2)),
    remainingFormatted: `${formatWeight(diffFromTarget, unit)} from target`,
    achievedKg: 0,
    isCompleted: diffFromTarget <= 1.0,
    direction: "maintenance",
  };
}

export const BMI_HEALTH_DISCLAIMER =
  "BMI is a screening tool based on adult height and weight (WHO standards). It does not directly assess body fat percentage, bone density, muscle mass, or health outcomes for athletes, pregnant individuals, or specific demographics. Consult a certified healthcare professional for medical advice.";

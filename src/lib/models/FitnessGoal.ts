import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFitnessGoal extends Document {
  userId: mongoose.Types.ObjectId;
  goalType: "lose" | "gain" | "maintain";
  startingWeightKg: number;
  targetWeightKg: number;
  status: "active" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const FitnessGoalSchema = new Schema<IFitnessGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalType: {
      type: String,
      enum: ["lose", "gain", "maintain"],
      required: true,
    },
    startingWeightKg: {
      type: Number,
      required: true,
      min: [10, "Weight must be at least 10 kg"],
      max: [500, "Weight must be under 500 kg"],
    },
    targetWeightKg: {
      type: Number,
      required: true,
      min: [10, "Weight must be at least 10 kg"],
      max: [500, "Weight must be under 500 kg"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FitnessGoalSchema.index({ userId: 1, status: 1 });

export const FitnessGoal: Model<IFitnessGoal> =
  mongoose.models.FitnessGoal ||
  mongoose.model<IFitnessGoal>("FitnessGoal", FitnessGoalSchema);

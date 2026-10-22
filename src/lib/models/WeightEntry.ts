import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeightEntry extends Document {
  userId: mongoose.Types.ObjectId;
  weightKg: number;
  recordedAt: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightEntrySchema = new Schema<IWeightEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: [10, "Weight must be at least 10 kg"],
      max: [500, "Weight must be under 500 kg"],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      default: "",
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user time-series querying
WeightEntrySchema.index({ userId: 1, recordedAt: -1 });

export const WeightEntry: Model<IWeightEntry> =
  mongoose.models.WeightEntry ||
  mongoose.model<IWeightEntry>("WeightEntry", WeightEntrySchema);

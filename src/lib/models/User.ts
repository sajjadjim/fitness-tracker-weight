import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  photoURL?: string;
  heightCm?: number;
  preferredUnit: "kg" | "lbs";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    heightCm: {
      type: Number,
      default: 170,
    },
    preferredUnit: {
      type: String,
      enum: ["kg", "lbs"],
      default: "kg",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true,
    collection: "user",
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

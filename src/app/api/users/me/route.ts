import { NextResponse } from "next/server";
import { verifyAuthUser } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { WeightEntry } from "@/lib/models/WeightEntry";
import { FitnessGoal } from "@/lib/models/FitnessGoal";
import { UserProfileUpdateSchema } from "@/lib/validations/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: auth.user._id,
        firebaseUid: auth.user.firebaseUid,
        name: auth.user.name,
        email: auth.user.email,
        photoURL: auth.user.photoURL,
        heightCm: auth.user.heightCm,
        preferredUnit: auth.user.preferredUnit || "kg",
        timezone: auth.user.timezone || "UTC",
        createdAt: auth.user.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UserProfileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.format() },
        { status: 400 }
      );
    }

    const updates = validation.data;
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      const updatedUser = await User.findByIdAndUpdate(
        auth.user._id,
        { $set: updates },
        { new: true }
      );
      return NextResponse.json({ user: updatedUser });
    } else {
      // In-memory fallback
      Object.assign(auth.user, updates);
      return NextResponse.json({ user: auth.user });
    }
  } catch (error) {
    console.error("PATCH /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await verifyAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      // Cascade delete user data
      await WeightEntry.deleteMany({ userId: auth.user._id });
      await FitnessGoal.deleteMany({ userId: auth.user._id });
      await User.findByIdAndDelete(auth.user._id);
    }

    return NextResponse.json({ success: true, message: "Account and data deleted" });
  } catch (error) {
    console.error("DELETE /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

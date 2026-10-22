import { cookies, headers } from "next/headers";
import { getAdminAuth, isAdminConfigured } from "./firebase/admin";
import { connectToDatabase } from "./mongodb";
import { User, IUser } from "./models/User";
import mongoose from "mongoose";

export interface AuthenticatedContext {
  user: IUser;
  firebaseUid: string;
  isDemoUser?: boolean;
}

// In-memory store for fallback demo mode if MongoDB is not connected
const fallbackDemoUsers = new Map<string, any>();

function getOrCreateFallbackUser(uid: string, email: string, name?: string): IUser {
  if (!fallbackDemoUsers.has(uid)) {
    fallbackDemoUsers.set(uid, {
      _id: new mongoose.Types.ObjectId(),
      firebaseUid: uid,
      name: name || "FitTrack Athlete",
      email: email || "athlete@example.com",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&q=80",
      heightCm: 178,
      preferredUnit: "kg",
      timezone: "UTC",
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() {
        return { ...this };
      },
    });
  }
  return fallbackDemoUsers.get(uid);
}

export async function verifyAuthUser(): Promise<AuthenticatedContext | null> {
  const cookieStore = await cookies();
  const headersList = await headers();

  const authHeader = headersList.get("authorization");
  let token: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    token = cookieStore.get("__session")?.value || cookieStore.get("fittrack_token")?.value || null;
  }

  // 1. Check for Demo Token / Demo Mode
  const demoCookie = cookieStore.get("fittrack_demo_mode")?.value;
  const isDemoExplicit = token?.startsWith("demo_") || demoCookie === "true" || headersList.get("x-demo-user") === "true";

  if (isDemoExplicit || (!isAdminConfigured && !token)) {
    // Return or create local demo user
    const demoUid = token?.startsWith("demo_") ? token : "demo-athlete-uid-123";
    await connectToDatabase();

    try {
      if (mongoose.connection.readyState === 1) {
        let user = await User.findOne({ firebaseUid: demoUid });
        if (!user) {
          user = await User.create({
            firebaseUid: demoUid,
            name: "Alex Hunter (Demo)",
            email: "alex.demo@fittrack.app",
            photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&q=80",
            heightCm: 178,
            preferredUnit: "kg",
            timezone: "UTC",
          });
        }
        return { user, firebaseUid: demoUid, isDemoUser: true };
      }
    } catch (err) {
      console.warn("MongoDB connection unavailable for demo, using in-memory demo user", err);
    }

    const fallbackUser = getOrCreateFallbackUser(demoUid, "alex.demo@fittrack.app", "Alex Hunter (Demo)");
    return { user: fallbackUser, firebaseUid: demoUid, isDemoUser: true };
  }

  if (!token) {
    return null;
  }

  // 2. Real Firebase Admin verification
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // If token was provided but Admin SDK is not configured, warn and allow if token is a dev mock
    if (token.startsWith("test_") || token.startsWith("demo_")) {
      const fallbackUser = getOrCreateFallbackUser(token, `${token}@example.com`);
      return { user: fallbackUser, firebaseUid: token, isDemoUser: true };
    }
    return null;
  }

  try {
    let decodedToken;
    try {
      // First try as session cookie
      decodedToken = await adminAuth.verifySessionCookie(token, true);
    } catch {
      // If not a session cookie, try as ID token
      decodedToken = await adminAuth.verifyIdToken(token);
    }

    const { uid, email, name, picture } = decodedToken;
    await connectToDatabase();

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        user = await User.create({
          firebaseUid: uid,
          email: email || `${uid}@fittrack.internal`,
          name: name || "FitTrack User",
          photoURL: picture || "",
          heightCm: 170,
          preferredUnit: "kg",
          timezone: "UTC",
        });
      }
      return { user, firebaseUid: uid };
    } else {
      const fallbackUser = getOrCreateFallbackUser(uid, email || `${uid}@user.com`, name);
      return { user: fallbackUser, firebaseUid: uid };
    }
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
}

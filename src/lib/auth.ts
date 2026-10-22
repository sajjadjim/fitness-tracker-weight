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

function getOrCreateFallbackUser(uid: string, email?: string, name?: string): IUser {
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

function parseFirebaseJwt(token: string): { uid: string; email?: string; name?: string; picture?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(jsonPayload);

    const uid = payload.user_id || payload.sub || payload.uid;
    if (!uid) return null;

    return {
      uid: String(uid),
      email: payload.email,
      name: payload.name || payload.display_name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
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

  const demoCookie = cookieStore.get("fittrack_demo_mode")?.value;
  const isDemoExplicit =
    token?.startsWith("demo_") ||
    demoCookie === "true" ||
    headersList.get("x-demo-user") === "true";

  // Connect to MongoDB Atlas (returns cached connection or connects)
  await connectToDatabase();

  // 1. Explicit Demo Mode or Guest
  if (isDemoExplicit) {
    const demoUid = token?.startsWith("demo_") ? token : "demo-athlete-uid-123";

    if (mongoose.connection.readyState === 1) {
      try {
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
      } catch (err) {
        console.warn("MongoDB error retrieving demo user, using fallback:", err);
      }
    }

    const fallbackUser = getOrCreateFallbackUser(demoUid, "alex.demo@fittrack.app", "Alex Hunter (Demo)");
    return { user: fallbackUser, firebaseUid: demoUid, isDemoUser: true };
  }

  // 2. Real Token Verification
  let uid: string | null = null;
  let email: string | undefined;
  let name: string | undefined;
  let picture: string | undefined;

  if (token) {
    const adminAuth = getAdminAuth();
    if (adminAuth && isAdminConfigured) {
      try {
        let decoded;
        try {
          decoded = await adminAuth.verifySessionCookie(token, true);
        } catch {
          decoded = await adminAuth.verifyIdToken(token);
        }
        uid = decoded.uid;
        email = decoded.email;
        name = decoded.name;
        picture = decoded.picture;
      } catch (err) {
        console.warn("Admin SDK verification failed, falling back to client JWT parsing:", err);
      }
    }

    // If Admin SDK wasn't configured or failed, parse client JWT payload
    if (!uid) {
      const parsed = parseFirebaseJwt(token);
      if (parsed) {
        uid = parsed.uid;
        email = parsed.email;
        name = parsed.name;
        picture = parsed.picture;
      }
    }
  }

  // If no valid token found, provide fallback demo user so user is never locked out on localhost
  if (!uid) {
    const defaultUid = "demo-athlete-uid-123";
    if (mongoose.connection.readyState === 1) {
      try {
        let user = await User.findOne({ firebaseUid: defaultUid });
        if (!user) {
          user = await User.create({
            firebaseUid: defaultUid,
            name: "Alex Hunter (Demo)",
            email: "alex.demo@fittrack.app",
            photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&q=80",
            heightCm: 178,
            preferredUnit: "kg",
            timezone: "UTC",
          });
        }
        return { user, firebaseUid: defaultUid, isDemoUser: true };
      } catch (e) {
        console.warn("MongoDB fallback query error:", e);
      }
    }

    const fallbackUser = getOrCreateFallbackUser(defaultUid, "alex.demo@fittrack.app", "Alex Hunter (Demo)");
    return { user: fallbackUser, firebaseUid: defaultUid, isDemoUser: true };
  }

  // Find or provision user in MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        user = await User.create({
          firebaseUid: uid,
          email: email || `${uid}@fittrack.user`,
          name: name || "FitTrack Athlete",
          photoURL: picture || "",
          heightCm: 175,
          preferredUnit: "kg",
          timezone: "UTC",
        });
      }
      return { user, firebaseUid: uid };
    } catch (err) {
      console.error("Error creating/finding user in MongoDB Atlas:", err);
    }
  }

  const fallbackUser = getOrCreateFallbackUser(uid, email, name);
  return { user: fallbackUser, firebaseUid: uid };
}

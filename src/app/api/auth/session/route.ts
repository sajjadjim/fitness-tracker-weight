import { NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, isDemo } = body;

    const cookieStore = await cookies();

    // If demo mode is activated
    if (isDemo) {
      cookieStore.set("fittrack_demo_mode", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return NextResponse.json({ status: "success", mode: "demo" });
    }

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth || !isAdminConfigured) {
      // Admin SDK not configured on server: fallback to setting client token in secure cookie
      cookieStore.set("__session", idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 5, // 5 days
        path: "/",
      });
      return NextResponse.json({ status: "success", mode: "token" });
    }

    // Standard Firebase Admin createSessionCookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookieStore.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "success", mode: "session" });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  cookieStore.delete("fittrack_demo_mode");
  cookieStore.delete("fittrack_token");

  return NextResponse.json({ status: "success", message: "Logged out" });
}

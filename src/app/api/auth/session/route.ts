import { NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken, isDemo } = body || {};

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
      const response = NextResponse.json({ status: "success", mode: "demo" });
      response.cookies.set("fittrack_demo_mode", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    let adminAuth = null;
    try {
      if (isAdminConfigured) {
        adminAuth = getAdminAuth();
      }
    } catch {
      adminAuth = null;
    }

    if (!adminAuth || !isAdminConfigured) {
      // Admin SDK not configured on server: fallback to setting client token in secure cookie
      cookieStore.set("__session", idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 5, // 5 days
        path: "/",
      });
      const response = NextResponse.json({ status: "success", mode: "token" });
      response.cookies.set("__session", idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 5,
        path: "/",
      });
      return response;
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

    const response = NextResponse.json({ status: "success", mode: "session" });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
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

  const response = NextResponse.json({ status: "success", message: "Logged out" });
  response.cookies.delete("__session");
  response.cookies.delete("fittrack_demo_mode");
  response.cookies.delete("fittrack_token");

  return response;
}

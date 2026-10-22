"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client";

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  loginAsDemo: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token to server session cookie
  const syncSession = useCallback(async (idToken: string | null, isDemo = false) => {
    try {
      if (isDemo) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDemo: true }),
        });
        return;
      }

      if (idToken) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
    } catch (e) {
      console.error("Session sync failed:", e);
    }
  }, []);

  useEffect(() => {
    // Check if demo mode was previously active in localStorage or cookies
    const storedDemo = typeof window !== "undefined" && localStorage.getItem("fittrack_demo_active") === "true";

    if (storedDemo) {
      setUser({
        uid: "demo-athlete-uid-123",
        email: "alex.demo@fittrack.app",
        displayName: "Alex Hunter (Demo)",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&q=80",
        isDemo: true,
      });
      syncSession(null, true);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        await syncSession(token, false);

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isDemo: false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncSession]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured || !auth || !googleProvider) {
        await loginAsDemo();
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await syncSession(token, false);

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isDemo: false,
      });
      localStorage.removeItem("fittrack_demo_active");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured || !auth) {
        await loginAsDemo();
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      await syncSession(token, false);

      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        isDemo: false,
      });
      localStorage.removeItem("fittrack_demo_active");
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured || !auth) {
        await loginAsDemo();
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName });
      }

      const token = await cred.user.getIdToken();
      await syncSession(token, false);

      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || cred.user.displayName,
        photoURL: cred.user.photoURL,
        isDemo: false,
      });
      localStorage.removeItem("fittrack_demo_active");
    } catch (error: any) {
      console.error("Sign-up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    await sendPasswordResetEmail(auth, email);
  };

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      localStorage.setItem("fittrack_demo_active", "true");
      await syncSession(null, true);

      setUser({
        uid: "demo-athlete-uid-123",
        email: "alex.demo@fittrack.app",
        displayName: "Alex Hunter (Demo)",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&q=80",
        isDemo: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (auth && isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
      localStorage.removeItem("fittrack_demo_active");
      await fetch("/api/auth/session", { method: "DELETE" });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loginAsDemo } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const getFriendlyError = (err: any): string => {
    const code = err?.code || "";
    if (code === "auth/popup-closed-by-user") return "Google sign-in popup was closed.";
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized in Firebase Console. Please add localhost to Firebase Authentication -> Settings -> Authorized Domains.";
    }
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "Invalid email or password. Please double check your credentials.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account with this email already exists. Try signing in instead.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters long.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    return err?.message || "An authentication error occurred. Please try again.";
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
      onClose();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        const msg = getFriendlyError(err);
        setAuthError(msg);
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        toast.success("Welcome back to FitTrack!");
        onClose();
      } else if (mode === "signup") {
        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters");
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, name.trim());
        toast.success("Account created successfully!");
        onClose();
      } else if (mode === "forgot") {
        await resetPassword(email.trim());
        setResetSent(true);
        toast.success("Password reset instructions sent to your email!");
      }
    } catch (err: any) {
      const msg = getFriendlyError(err);
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setSubmitting(true);
    try {
      await loginAsDemo();
      toast.info("Logged in as Demo Athlete");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Top glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {mode === "signin"
              ? t("welcomeTitle")
              : mode === "signup"
              ? t("createAccount")
              : t("resetPassword")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "signin"
              ? t("signInToAccount")
              : mode === "signup"
              ? t("signUpSubtitle")
              : t("forgotSubtitle")}
          </p>
        </div>

        {/* Google Sign In One-Click CTA */}
        {mode !== "forgot" && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t("continueWithGoogle")}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
                {t("orWithEmail")}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {authError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{authError}</div>
          </div>
        )}

        {/* Reset Confirmation Notice */}
        {mode === "forgot" && resetSent && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 text-center animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold">Password Reset Email Dispatched</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">
              Check your inbox for <b>{email}</b> to reset your password.
            </p>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" /> {t("fullName")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Hunter"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-500" /> {t("emailAddress")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> {t("password")}
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setAuthError(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t("forgotPassword")}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("processing")}
              </>
            ) : mode === "signin" ? (
              <>
                <span>{t("signIn")}</span> <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === "signup" ? (
              <>
                <span>{t("createFitTrackAccount")}</span> <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{t("sendResetLink")}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "signin" ? (
            <p>
              {t("dontHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAuthError(null);
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t("signUpFree")}
              </button>
            </p>
          ) : mode === "signup" ? (
            <p>
              {t("alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setAuthError(null);
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t("signIn")}
              </button>
            </p>
          ) : (
            <p>
              {t("rememberPassword")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setAuthError(null);
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t("backToSignIn")}
              </button>
            </p>
          )}

          {/* Quick Demo Mode button */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
            >
              {t("guestPreviewExplore")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { isHebrew } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const text = isHebrew
    ? {
        title: "איפוס סיסמה",
        subtitle: "בחר סיסמה חדשה לחשבון שלך.",
        helper:
          "אם החשבון שלך נוצר עם Google, הסיסמה שתגדיר כאן תאפשר לך להתחבר גם עם Google וגם עם שם משתמש וסיסמה.",
        newPassword: "סיסמה חדשה",
        confirmPassword: "אימות סיסמה חדשה",
        submit: "עדכן סיסמה",
        submitting: "מעדכן...",
        invalidLink: "קישור האיפוס לא תקין או חסר.",
        mismatch: "הסיסמאות לא תואמות.",
        success: "הסיסמה עודכנה בהצלחה. אפשר להתחבר עם הסיסמה החדשה.",
        failed: "איפוס הסיסמה נכשל.",
        passwordIssuesTitle: "הסיסמה החדשה צריכה עוד שיפור",
        backToLogin: "חזרה להתחברות",
      }
    : {
        title: "Reset Password",
        subtitle: "Choose a new password for your account.",
        helper:
          "If your account was created with Google, the password you set here will let you sign in with either Google or username and password.",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        submit: "Update Password",
        submitting: "Updating...",
        invalidLink: "The reset link is invalid or incomplete.",
        mismatch: "Passwords do not match.",
        success: "Password updated successfully. You can now log in with your new password.",
        failed: "Password reset failed.",
        passwordIssuesTitle: "Your new password needs a few adjustments",
        backToLogin: "Back to login",
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails([]);
    setSuccess("");

    if (!uid || !token) {
      setError(text.invalidLink);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(text.mismatch);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
      });
      setSuccess(res.data.detail || text.success);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      let message = text.failed;
      let details: string[] = [];

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null
      ) {
        const data = err.response.data as Record<string, unknown>;

        if ("detail" in data && typeof data.detail === "string") {
          message = data.detail;
        }

        if ("new_password" in data && Array.isArray(data.new_password)) {
          details = data.new_password.filter((item): item is string => typeof item === "string");
          if (details.length > 0) {
            message = text.passwordIssuesTitle;
          }
        }
      }

      setError(message);
      setErrorDetails(details);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-black text-stone-100">{text.title}</h1>
        <p className="mt-3 text-stone-400">{text.subtitle}</p>
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
          <p className="text-sm leading-6 text-stone-300">{text.helper}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={text.newPassword}
            className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={text.confirmPassword}
            className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-amber-500 p-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? text.submitting : text.submit}
          </button>
        </form>

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
            <p className="text-sm leading-6 text-emerald-300">{success}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-4">
            <p className="text-sm font-semibold text-red-300">{error}</p>
            {errorDetails.length > 0 ? (
              <div className="mt-3 space-y-2">
                {errorDetails.map((detail) => (
                  <div
                    key={detail}
                    className="rounded-xl border border-red-500/12 bg-zinc-950/60 px-3 py-2 text-sm leading-6 text-red-100/90"
                  >
                    {detail}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6">
          <Link href="/login" className="text-sm font-medium text-amber-300 hover:text-amber-200">
            {text.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}

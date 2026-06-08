"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function ForgotPasswordPage() {
  const { isHebrew } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const text = isHebrew
    ? {
        title: "שחזור סיסמה",
        subtitle:
          "הזן את האימייל שלך ונשלח אליך קישור לאיפוס או להגדרת סיסמה חדשה לחשבון.",
        helper:
          "אם נרשמת עם Google, אפשר להשתמש בתהליך הזה כדי להגדיר סיסמה רגילה בנוסף להתחברות עם Google.",
        email: "אימייל",
        submit: "שלח קישור איפוס",
        sending: "שולח...",
        success: "אם קיים חשבון עם האימייל הזה, נשלח אליו קישור לאיפוס סיסמה.",
        failed: "שליחת בקשת האיפוס נכשלה.",
        backToLogin: "חזרה להתחברות",
      }
    : {
        title: "Forgot Password",
        subtitle: "Enter your email and we will send you a link to reset or set a password.",
        helper:
          "If you signed up with Google, you can also use this flow to add a regular password to your account.",
        email: "Email",
        submit: "Send Reset Link",
        sending: "Sending...",
        success: "If an account exists for this email, a password reset link was sent.",
        failed: "Failed to send the reset request.",
        backToLogin: "Back to login",
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("password-reset/request/", { email });
      setSuccess(res.data.detail || text.success);
    } catch {
      setError(text.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-black text-stone-100">{text.title}</h1>
        <p className="mt-3 text-stone-400">{text.subtitle}</p>
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <p className="text-sm leading-6 text-amber-100/85">{text.helper}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={text.email}
            className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-amber-500 p-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {submitting ? text.sending : text.submit}
          </button>
        </form>

        {success ? <p className="mt-4 text-emerald-400">{success}</p> : null}
        {error ? <p className="mt-4 text-red-400">{error}</p> : null}

        <div className="mt-6">
          <Link href="/login" className="text-sm font-medium text-amber-300 hover:text-amber-200">
            {text.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import api from "@/app/lib/axios";
import GoogleAuthButton from "@/app/Components/GoogleAuthButton";
import InlineAlert from "@/app/Components/InlineAlert";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, completeLogin } = useAuth();
  const { isHebrew } = useLanguage();

  const text = isHebrew
    ? {
        eyebrow: "חזרה למערכת",
        title: "התחברות",
        subtitle: "המשך לעקוב אחרי אימונים, סשנים והתקדמות במקום אחד מסודר.",
        username: "שם משתמש",
        password: "סיסמה",
        submit: "התחבר",
        googleLogin: "המשך עם Google",
        googleHint: "התחברות מהירה עם חשבון Google שלך",
        divider: "או התחבר עם שם משתמש וסיסמה",
        failed: "ההתחברות נכשלה",
        googleFailed: "התחברות עם Google נכשלה",
        forgotPassword: "שכחת סיסמה?",
        createAccount: "אין לך חשבון עדיין?",
        createAccountLink: "ליצירת חשבון",
        helper: "התחבר כדי להמשיך ישירות לאזור האימונים וההתקדמות שלך.",
      }
    : {
        eyebrow: "Welcome Back",
        title: "Login",
        subtitle: "Jump back into your workouts, session tracking, and progress in one clean place.",
        username: "Username",
        password: "Password",
        submit: "Login",
        googleLogin: "Continue with Google",
        googleHint: "Fast sign-in with your Google account",
        divider: "Or continue with username and password",
        failed: "Login failed",
        googleFailed: "Google login failed",
        forgotPassword: "Forgot password?",
        createAccount: "Don&apos;t have an account yet?",
        createAccountLink: "Create one",
        helper: "Sign in to continue straight into your workouts and progress hub.",
      };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      router.push("/");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
          : text.failed;
      setError(message);
    }
  };

  const handleGoogleLogin = async (code: string) => {
    setError("");

    try {
      const res = await api.post("login/google/", { code });
      await completeLogin(res.data.access);
      router.push("/");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "detail" in err.response.data &&
        typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : text.googleFailed;
      setError(message);
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-10 md:px-6 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-amber-500/14 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-zinc-700/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-stone-200/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-[2.2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
          <div className="border-b border-zinc-800 px-6 py-6 text-center md:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300/80">
              {text.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-stone-100 md:text-5xl">
              {text.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-400">
              {text.helper}
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
            <GoogleAuthButton
              label={text.googleLogin}
              hint={text.googleHint}
              onCodeReceived={handleGoogleLogin}
            />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-800" />
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{text.divider}</p>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder={text.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-2xl border border-zinc-700 bg-zinc-950/85 p-4 text-stone-100 outline-none transition focus:border-amber-400"
                required
              />
              <input
                type="password"
                placeholder={text.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl border border-zinc-700 bg-zinc-950/85 p-4 text-stone-100 outline-none transition focus:border-amber-400"
                required
              />
              <button
                type="submit"
                className="mt-2 rounded-2xl bg-amber-500 p-4 font-semibold text-zinc-950 transition hover:bg-amber-400"
              >
                {text.submit}
              </button>
            </form>

            <div className="flex items-center justify-between gap-4 text-sm">
              <Link href="/forgot-password" className="font-medium text-amber-300 transition hover:text-amber-200">
                {text.forgotPassword}
              </Link>
              <p className="text-stone-400">
                {text.createAccount}{" "}
                <Link href="/register" className="font-semibold text-amber-300 hover:text-amber-200">
                  {text.createAccountLink}
                </Link>
              </p>
            </div>

            {error ? <InlineAlert message={error} /> : null}
          </div>
        </section>

      </div>
    </div>
  );
}

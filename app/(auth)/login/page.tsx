"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const { isHebrew } = useLanguage();

  const text = isHebrew
    ? {
        eyebrow: "חזרה למערכת",
        title: "התחברות",
        subtitle: "המשך לעקוב אחרי אימונים, סשנים והתקדמות במקום אחד מסודר.",
        username: "שם משתמש",
        password: "סיסמה",
        submit: "התחבר",
        failed: "ההתחברות נכשלה",
        createAccount: "אין לך חשבון עדיין?",
        createAccountLink: "ליצירת חשבון",
        highlightsTitle: "מה מחכה לך בפנים",
        highlights: [
          "מעקב פשוט אחרי סשנים, אחוזים ומגמות לאורך זמן",
          "אימונים שמגיעים מהמאמן שלך ונשמרים במקום אחד",
          "תצוגה ברורה של התקדמות, תבניות ויעדים לכל שחקן",
        ],
        statOneLabel: "אימונים",
        statOneValue: "חכמים",
        statTwoLabel: "מעקב",
        statTwoValue: "יומי",
      }
    : {
        eyebrow: "Welcome Back",
        title: "Login",
        subtitle: "Jump back into your workouts, session tracking, and progress in one clean place.",
        username: "Username",
        password: "Password",
        submit: "Login",
        failed: "Login failed",
        createAccount: "Don&apos;t have an account yet?",
        createAccountLink: "Create one",
        highlightsTitle: "What you get inside",
        highlights: [
          "Simple tracking for sessions, percentages, and long-term trends",
          "Coach-assigned workouts organized in one focused workspace",
          "A clearer view of progress, templates, and training goals",
        ],
        statOneLabel: "Workouts",
        statOneValue: "Focused",
        statTwoLabel: "Tracking",
        statTwoValue: "Daily",
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

  return (
    <div className="relative overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-zinc-700/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300/80">
            {text.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-stone-100 md:text-5xl">
            {text.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-400">
            {text.subtitle}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <p className="text-sm text-stone-500">{text.statOneLabel}</p>
              <p className="mt-2 text-3xl font-black text-amber-300">{text.statOneValue}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <p className="text-sm text-stone-500">{text.statTwoLabel}</p>
              <p className="mt-2 text-3xl font-black text-stone-100">{text.statTwoValue}</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/8 p-6">
            <h2 className="text-lg font-semibold text-stone-100">{text.highlightsTitle}</h2>
            <div className="mt-4 space-y-3">
              {text.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
                >
                  <span className="mt-1 text-amber-300">●</span>
                  <p className="text-sm leading-6 text-stone-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-lg shadow-black/30">
          <h2 className="text-2xl font-semibold text-stone-100">{text.title}</h2>
          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder={text.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
              required
            />
            <input
              type="password"
              placeholder={text.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
              required
            />
            <button
              type="submit"
              className="mt-2 rounded-xl bg-amber-500 p-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              {text.submit}
            </button>
          </form>

          {error && <p className="mt-3 text-red-400">{error}</p>}

          <p className="mt-6 text-sm text-stone-400">
            {text.createAccount}{" "}
            <Link href="/register" className="font-semibold text-amber-300 hover:text-amber-200">
              {text.createAccountLink}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import api from "@/app/lib/axios";
import { uploadProfileImageToCloudinary, validateProfileImageFile } from "@/app/lib/cloudinary";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { isHebrew } = useLanguage();

  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<"PLAYER" | "COACH" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [position, setPosition] = useState("PG");
  const [height, setHeight] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const text = isHebrew
    ? {
        eyebrow: "הצטרפות למערכת",
        title: "יצירת חשבון",
        choose: "בחר איך תרצה להירשם",
        subtitle: "פתח חשבון חדש וקבל סביבת אימון מסודרת לשחקנים ולמאמנים.",
        player: "הירשם כשחקן",
        coach: "הירשם כמאמן",
        back: "חזרה",
        registeringAs: "נרשם בתור",
        username: "שם משתמש",
        password: "סיסמה",
        dateOfBirth: "תאריך לידה",
        height: "גובה (ס\"מ)",
        create: "צור חשבון",
        failed: "ההרשמה נכשלה",
        haveAccount: "כבר יש לך חשבון?",
        haveAccountLink: "להתחברות",
        playerCardTitle: "לשחקנים",
        playerCardText: "מעקב אחרי אימונים, סשנים, אחוזים ותהליך התקדמות ברור לאורך זמן.",
        coachCardTitle: "למאמנים",
        coachCardText: "ניהול שחקנים, תבניות ואימונים מותאמים מתוך סביבת עבודה אחת.",
        positions: {
          PG: "רכז",
          SG: "קלע",
          SF: "סמול פורוורד",
          PF: "פאוור פורוורד",
          C: "סנטר",
        },
        profilePhoto: "תמונת פרופיל",
        profilePhotoHint: "בחר תמונה עד 10MB",
        profilePhotoRemove: "הסר תמונה",
        creating: "יוצר חשבון...",
      }
    : {
        eyebrow: "Join The Platform",
        title: "Create Account",
        choose: "Choose how you want to register",
        subtitle: "Open a new account and step into a cleaner training experience for players and coaches.",
        player: "Sign up as Player",
        coach: "Sign up as Coach",
        back: "Back",
        registeringAs: "Registering as",
        username: "Username",
        password: "Password",
        dateOfBirth: "Date of Birth",
        height: "Height (cm)",
        create: "Create Account",
        failed: "Registration failed",
        haveAccount: "Already have an account?",
        haveAccountLink: "Log in",
        playerCardTitle: "For Players",
        playerCardText: "Track workouts, sessions, percentages, and progress with more clarity over time.",
        coachCardTitle: "For Coaches",
        coachCardText: "Manage players, templates, and workout assignments from one focused workspace.",
        positions: {
          PG: "Point Guard",
          SG: "Shooting Guard",
          SF: "Small Forward",
          PF: "Power Forward",
          C: "Center",
        },
        profilePhoto: "Profile Photo",
        profilePhotoHint: "Choose an image up to 10MB",
        profilePhotoRemove: "Remove photo",
        creating: "Creating account...",
      };

  const handleProfilePhotoChange = (file: File | null) => {
    if (!file) {
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      return;
    }

    try {
      validateProfileImageFile(file);
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      setError("");
    } catch (err) {
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      setError(err instanceof Error ? err.message : text.failed);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let profilePhotoUrl: string | null = null;

      if (profilePhotoFile) {
        profilePhotoUrl = await uploadProfileImageToCloudinary(profilePhotoFile);
      }

      const body: {
        username: string;
        password: string;
        role: "PLAYER" | "COACH" | null;
        date_of_birth: string | null;
        profile_photo_url?: string | null;
        position?: string;
        height_cm?: number | null;
      } = {
        username,
        password,
        role,
        date_of_birth: dateOfBirth || null,
        profile_photo_url: profilePhotoUrl,
      };

      if (role === "PLAYER") {
        body.position = position;
        body.height_cm = height ? Number(height) : null;
      }

      await api.post("/register/", body);
      await login(username, password);
      router.push("/");
    } catch {
      setError(text.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-zinc-700/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-amber-500/25 bg-amber-500/8 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                {text.playerCardTitle}
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-300">{text.playerCardText}</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-200">
                {text.coachCardTitle}
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-400">{text.coachCardText}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 text-stone-100 shadow-lg shadow-black/30">
          <h2 className="text-2xl font-semibold text-stone-100">{text.title}</h2>

          {step === "choose" && (
            <div className="mt-6 flex flex-col gap-4">
              <p className="text-stone-400">{text.choose}</p>

              <button
                onClick={() => {
                  setRole("PLAYER");
                  setStep("form");
                }}
                className="rounded-2xl border border-amber-500/40 bg-amber-500 p-5 text-lg font-semibold text-zinc-950 transition hover:bg-amber-400"
              >
                {text.player}
              </button>

              <button
                onClick={() => {
                  setRole("COACH");
                  setStep("form");
                }}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 p-5 text-lg font-semibold text-amber-300 transition hover:bg-zinc-700"
              >
                {text.coach}
              </button>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="mb-1 text-left text-sm text-stone-400 hover:text-amber-300"
              >
                {text.back}
              </button>

              <p className="text-sm text-stone-400">
                {text.registeringAs} <span className="font-semibold">{role === "PLAYER" ? text.player : text.coach}</span>
              </p>

              <input
                placeholder={text.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
              />

              <input
                type="password"
                placeholder={text.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
              />

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm font-medium text-stone-300">{text.profilePhoto}</p>
                <p className="mt-1 text-xs text-stone-500">{text.profilePhotoHint}</p>

                <div className="mt-4 flex items-center gap-4">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Profile photo preview"
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-amber-500/60"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-amber-300">
                      {username.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfilePhotoChange(e.target.files?.[0] ?? null)}
                      className="block text-sm text-stone-400 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-semibold file:text-zinc-950 hover:file:bg-amber-400"
                    />
                    {profilePhotoPreview ? (
                      <button
                        type="button"
                        onClick={() => handleProfilePhotoChange(null)}
                        className="text-left text-sm text-stone-400 hover:text-amber-300"
                      >
                        {text.profilePhotoRemove}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <input
                type="date"
                aria-label={text.dateOfBirth}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
              />

              {role === "PLAYER" && (
                <>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                  >
                    <option value="PG">{text.positions.PG}</option>
                    <option value="SG">{text.positions.SG}</option>
                    <option value="SF">{text.positions.SF}</option>
                    <option value="PF">{text.positions.PF}</option>
                    <option value="C">{text.positions.C}</option>
                  </select>

                  <input
                    type="number"
                    placeholder={text.height}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                  />
                </>
              )}

              <button
                disabled={submitting}
                className="mt-2 rounded-xl bg-amber-500 p-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? text.creating : text.create}
              </button>
            </form>
          )}

          {error && <p className="mt-3 text-red-400">{error}</p>}

          <p className="mt-6 text-sm text-stone-400">
            {text.haveAccount}{" "}
            <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
              {text.haveAccountLink}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import api from "@/app/lib/axios";
import { uploadProfileImageToCloudinary, validateProfileImageFile } from "@/app/lib/cloudinary";
import GoogleAuthButton from "@/app/Components/GoogleAuthButton";
import InlineAlert from "@/app/Components/InlineAlert";

type Role = "PLAYER" | "COACH";
type WizardStepKey =
  | "username"
  | "email"
  | "firstName"
  | "lastName"
  | "phoneNumber"
  | "password"
  | "profilePhoto"
  | "dateOfBirth"
  | "position"
  | "height";

type WizardStep = {
  key: WizardStepKey;
  title: string;
  hint: string;
  required: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login, completeLogin } = useAuth();
  const { isHebrew } = useLanguage();

  const [screen, setScreen] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [googleSignupToken, setGoogleSignupToken] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState("");
  const [authMethod, setAuthMethod] = useState<"choose" | "manual" | "google">("choose");
  const [wizardStepIndex, setWizardStepIndex] = useState(0);
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
        manualTrack: "הרשמה רגילה",
        googleTrack: "הרשמה עם Google",
        chooseMethodTitle: "בחר מסלול הרשמה",
        chooseMethodHint: "שני המסלולים מובילים לאותו חשבון, אבל הדרך שונה לגמרי.",
        manualMethodTitle: "הרשמה רגילה עם סיסמה",
        manualMethodText: "תיצור חשבון עם שם משתמש וסיסמה, ואז תתקדם באונבורדינג המודרך.",
        googleMethodTitle: "הרשמה עם Google",
        googleMethodText: "Google תאמת את הזהות שלך קודם, ואז תשלים רק את הפרטים שחסרים בתוך HoopProgress.",
        chooseThisPath: "בחר במסלול הזה",
        wizardReady: "תהליך הרשמה קצר, מדויק ומקצועי. כל פעם מתמקדים רק בפרט אחד.",
        googleReady: "Google כבר אישרה את הזהות שלך. עכשיו נשלים את הפרופיל באותו קצב נקי ומסודר.",
        username: "שם משתמש",
        email: "אימייל",
        firstName: "שם פרטי",
        lastName: "שם משפחה",
        phoneNumber: "מספר טלפון",
        password: "סיסמה",
        continueWithGoogle: "המשך עם Google",
        googleHint: "התחל עם Google, ואז המשך לאותו מסלול הרשמה מודרך ומדויק.",
        finishGoogleSignup: "השלם הרשמה עם Google",
        finishManualSignup: "צור חשבון",
        googleConnectedTitle: "Google חיבר את החשבון שלך",
        googleConnectedText: "עכשיו נשאר רק להשלים את הפרטים שהופכים את החשבון שלך לשלך.",
        googleProgress: "השלמת הרשמה",
        googleStep: "שלב",
        next: "הבא",
        previous: "הקודם",
        skip: "דלג לעכשיו",
        usernameStepTitle: "בחר שם משתמש מקצועי",
        usernameStepHint: "זה השם שהשחקנים והמאמנים יראו בתוך HoopProgress.",
        usernameStepRequired: "צריך לבחור שם משתמש כדי להמשיך.",
        emailStepTitle: "מה האימייל שלך?",
        emailStepHint: "האימייל ישמש אותך לשחזור סיסמה ולהתראות חשובות בעתיד.",
        emailStepRequired: "צריך להזין אימייל כדי להמשיך.",
        firstNameStepTitle: "איך נרצה לקרוא לך?",
        firstNameStepHint: "שם פרטי טוב גורם לפרופיל להרגיש אישי ומדויק יותר.",
        lastNameStepTitle: "ועכשיו סוגרים את השם",
        lastNameStepHint: "שם משפחה נותן לחשבון מראה רשמי ואמין יותר.",
        phoneStepTitle: "מה מספר הטלפון שלך?",
        phoneStepHint: "שדה אופציונלי, אבל נוח שיהיה חלק מהפרופיל ליצירת קשר מהירה.",
        passwordStepTitle: "בחר סיסמה חזקה",
        passwordStepHint: "רק עוד שכבת אבטחה אחת ואתה בפנים.",
        passwordStepRequired: "צריך לבחור סיסמה כדי להמשיך.",
        photoStepTitle: "הוסף תמונת פרופיל",
        photoStepHint: "לא חובה, אבל זה נותן לחשבון מראה שלם ובטוח יותר.",
        dobStepTitle: "מתי נולדת?",
        dobStepHint: "אפשר להשאיר את זה כהשלמה רכה של הפרופיל.",
        positionStepTitle: "מה העמדה שלך?",
        positionStepHint: "זה עוזר לאימונים ולהקשרים סביבך להרגיש יותר מותאמים.",
        heightStepTitle: "מה הגובה שלך?",
        heightStepHint: "אפשר גם לדלג ולחזור לזה אחר כך.",
        dateOfBirth: "תאריך לידה",
        height: "גובה (ס\"מ)",
        failed: "ההרשמה נכשלה",
        googleFailed: "הרשמה עם Google נכשלה",
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
        connectedEmail: "אימייל מחובר",
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
        manualTrack: "Classic Signup",
        googleTrack: "Google Signup",
        chooseMethodTitle: "Choose your signup path",
        chooseMethodHint: "Both paths lead to the same account, but the experience is intentionally different.",
        manualMethodTitle: "Classic signup with password",
        manualMethodText: "Create an account with a username and password, then move through the guided onboarding.",
        googleMethodTitle: "Sign up with Google",
        googleMethodText: "Google verifies your identity first, then you only complete the missing HoopProgress details.",
        chooseThisPath: "Choose this path",
        wizardReady: "A tighter, more focused signup flow. One detail at a time, with less noise.",
        googleReady: "Google already handled identity. Now we finish the rest with the same clean guided flow.",
        username: "Username",
        email: "Email",
        firstName: "First Name",
        lastName: "Last Name",
        phoneNumber: "Phone Number",
        password: "Password",
        continueWithGoogle: "Continue with Google",
        googleHint: "Start with Google, then continue through the same guided signup flow.",
        finishGoogleSignup: "Finish Google Signup",
        finishManualSignup: "Create Account",
        googleConnectedTitle: "Google already verified you",
        googleConnectedText: "Now we only need the details that make this HoopProgress account truly yours.",
        googleProgress: "Signup Progress",
        googleStep: "Step",
        next: "Next",
        previous: "Previous",
        skip: "Skip for now",
        usernameStepTitle: "Choose a strong username",
        usernameStepHint: "This is the name coaches and players will see inside HoopProgress.",
        usernameStepRequired: "Choose a username to continue.",
        emailStepTitle: "What is your email?",
        emailStepHint: "Your email will be used for password recovery and important account messages.",
        emailStepRequired: "Enter an email to continue.",
        firstNameStepTitle: "What should we call you?",
        firstNameStepHint: "A clear first name makes the account feel warmer and more personal.",
        lastNameStepTitle: "Now finish the name",
        lastNameStepHint: "A last name gives the profile a more polished and recognizable feel.",
        phoneStepTitle: "What is your phone number?",
        phoneStepHint: "Optional, but useful to keep on the profile for quick contact when needed.",
        passwordStepTitle: "Create a strong password",
        passwordStepHint: "One more layer of security, then you are in.",
        passwordStepRequired: "Choose a password to continue.",
        photoStepTitle: "Add a profile photo",
        photoStepHint: "Optional, but it makes the account feel much more complete and trustworthy.",
        dobStepTitle: "When were you born?",
        dobStepHint: "You can treat this as a softer profile-completion step.",
        positionStepTitle: "What position do you play?",
        positionStepHint: "This helps training context feel more tailored around you.",
        heightStepTitle: "What is your height?",
        heightStepHint: "You can skip this and come back to it later.",
        dateOfBirth: "Date of Birth",
        height: "Height (cm)",
        failed: "Registration failed",
        googleFailed: "Google signup failed",
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
        connectedEmail: "Connected email",
      };

  const isGoogleFlow = Boolean(googleSignupToken);

  const wizardSteps: WizardStep[] = (() => {
    const baseSteps: WizardStep[] = [
      { key: "username", title: text.usernameStepTitle, hint: text.usernameStepHint, required: true },
      { key: "email", title: text.emailStepTitle, hint: text.emailStepHint, required: true },
      { key: "firstName", title: text.firstNameStepTitle, hint: text.firstNameStepHint, required: false },
      { key: "lastName", title: text.lastNameStepTitle, hint: text.lastNameStepHint, required: false },
      { key: "phoneNumber", title: text.phoneStepTitle, hint: text.phoneStepHint, required: false },
    ];

    if (!isGoogleFlow) {
      baseSteps.push({
        key: "password",
        title: text.passwordStepTitle,
        hint: text.passwordStepHint,
        required: true,
      });
    }

    baseSteps.push(
      { key: "profilePhoto", title: text.photoStepTitle, hint: text.photoStepHint, required: false },
      { key: "dateOfBirth", title: text.dobStepTitle, hint: text.dobStepHint, required: false }
    );

    if (role === "PLAYER") {
      baseSteps.push(
        { key: "position", title: text.positionStepTitle, hint: text.positionStepHint, required: true },
        { key: "height", title: text.heightStepTitle, hint: text.heightStepHint, required: false }
      );
    }

    return baseSteps;
  })();

  const activeStep = wizardSteps[Math.min(wizardStepIndex, wizardSteps.length - 1)];
  const isLastStep = wizardStepIndex === wizardSteps.length - 1;
  const progressPercent = ((wizardStepIndex + 1) / wizardSteps.length) * 100;

  const resetGoogleFlow = () => {
    setGoogleSignupToken(null);
    setGoogleEmail("");
  };

  const resetFormState = () => {
    setWizardStepIndex(0);
    setError("");
    setAuthMethod("choose");
    resetGoogleFlow();
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

  const finalizeRegistration = async () => {
    setSubmitting(true);

    try {
      let profilePhotoUrl: string | null = null;
      let profilePhotoPublicId: string | null = null;

      if (profilePhotoFile) {
        const uploadedImage = await uploadProfileImageToCloudinary(profilePhotoFile);
        profilePhotoUrl = uploadedImage.secureUrl;
        profilePhotoPublicId = uploadedImage.publicId;
      }

      const body: {
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
        phone_number?: string;
        password?: string;
        signup_token?: string;
        role: Role | null;
        date_of_birth: string | null;
        profile_photo_url?: string | null;
        profile_photo_public_id?: string | null;
        position?: string;
        height_cm?: number | null;
      } = {
        username,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
        role,
        date_of_birth: dateOfBirth || null,
        profile_photo_url: profilePhotoUrl,
        profile_photo_public_id: profilePhotoPublicId,
      };

      if (role === "PLAYER") {
        body.position = position;
        body.height_cm = height ? Number(height) : null;
      }

      if (isGoogleFlow) {
        body.signup_token = googleSignupToken!;
        const res = await api.post("/register/google/", body);
        await completeLogin(res.data.access);
      } else {
        body.password = password;
        await api.post("/register/", body);
        await login(username, password);
      }

      router.push("/");
    } catch {
      setError(text.failed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleWizardKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") {
      return;
    }

    const target = e.target as HTMLElement | null;
    const tagName = target?.tagName ?? "";
    if (tagName === "BUTTON" || tagName === "TEXTAREA") {
      return;
    }

    e.preventDefault();

    if (submitting) {
      return;
    }

    if (isLastStep) {
      void finalizeRegistration();
      return;
    }

    handleNextStep();
  };

  const handleGoogleRegister = async (code: string) => {
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("/register/google/context/", { code });
      setGoogleSignupToken(res.data.signup_token);
      setEmail((current) => current || res.data.email || "");
      setGoogleEmail(res.data.email ?? "");
      setFirstName((current) => current || res.data.first_name || "");
      setLastName((current) => current || res.data.last_name || "");
      setAuthMethod("google");
      setWizardStepIndex(0);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (activeStep.key === "username" && !username.trim()) {
      setError(text.usernameStepRequired);
      return;
    }

    if (activeStep.key === "email" && !email.trim()) {
      setError(text.emailStepRequired);
      return;
    }

    if (activeStep.key === "password" && !password.trim()) {
      setError(text.passwordStepRequired);
      return;
    }

    setError("");
    setWizardStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1));
  };

  const handlePreviousStep = () => {
    setError("");
    setWizardStepIndex((current) => Math.max(current - 1, 0));
  };

  const renderWizardField = () => {
    switch (activeStep.key) {
      case "username":
        return (
          <input
            autoFocus
            placeholder={text.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "email":
        return (
          <input
            autoFocus
            type="email"
            placeholder={text.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "firstName":
        return (
          <input
            autoFocus
            placeholder={text.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "lastName":
        return (
          <input
            autoFocus
            placeholder={text.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "phoneNumber":
        return (
          <input
            autoFocus
            type="tel"
            placeholder={text.phoneNumber}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "password":
        return (
          <input
            autoFocus
            type="password"
            placeholder={text.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "profilePhoto":
        return (
          <div className="rounded-[1.6rem] border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="flex flex-col items-center gap-5 md:flex-row">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile photo preview"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-amber-500/40"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-amber-300 text-3xl font-black text-zinc-950 shadow-[0_18px_40px_rgba(245,158,11,0.22)]">
                  {(firstName.trim().charAt(0) || username.trim().charAt(0) || "?").toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <p className="mb-3 text-sm text-stone-400">{text.profilePhotoHint}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProfilePhotoChange(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-semibold file:text-zinc-950 hover:file:bg-amber-400"
                />
                {profilePhotoPreview ? (
                  <button
                    type="button"
                    onClick={() => handleProfilePhotoChange(null)}
                    className="mt-3 text-sm text-stone-400 transition hover:text-amber-300"
                  >
                    {text.profilePhotoRemove}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      case "dateOfBirth":
        return (
          <input
            autoFocus
            type="date"
            aria-label={text.dateOfBirth}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      case "position":
        return (
          <select
            autoFocus
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          >
            <option value="PG">{text.positions.PG}</option>
            <option value="SG">{text.positions.SG}</option>
            <option value="SF">{text.positions.SF}</option>
            <option value="PF">{text.positions.PF}</option>
            <option value="C">{text.positions.C}</option>
          </select>
        );
      case "height":
        return (
          <input
            autoFocus
            type="number"
            placeholder={text.height}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 text-lg text-stone-100 outline-none transition focus:border-amber-400"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-8 md:px-6 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-zinc-700/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-stone-200/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8">

        <section className="mx-auto w-full max-w-4xl rounded-[2.2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-stone-100 shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:p-8 xl:p-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300/80">
              {text.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-stone-100 md:text-5xl">
              {text.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-stone-400 md:text-xl">
              {text.subtitle}
            </p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-amber-500/25 bg-amber-500/8 p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                  {text.playerCardTitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-300">{text.playerCardText}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-200">
                  {text.coachCardTitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-400">{text.coachCardText}</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-stone-100 md:text-3xl">{text.title}</h2>
          </div>

          {screen === "choose" && (
            <div className="mt-6 grid gap-4">
              <p className="text-stone-400">{text.choose}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => {
                    setRole("PLAYER");
                    setScreen("form");
                    resetFormState();
                  }}
                  className="rounded-[1.8rem] border border-amber-500/35 bg-linear-to-br from-amber-500 to-amber-400 p-6 text-left text-zinc-950 shadow-[0_20px_60px_rgba(245,158,11,0.18)] transition hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-300"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-800/70">
                    {text.playerCardTitle}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{text.player}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-900/80">{text.playerCardText}</p>
                </button>

                <button
                  onClick={() => {
                    setRole("COACH");
                    setScreen("form");
                    resetFormState();
                  }}
                  className="rounded-[1.8rem] border border-zinc-700 bg-linear-to-br from-zinc-900 to-zinc-800 p-6 text-left text-stone-100 transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:from-zinc-800 hover:to-zinc-700"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                    {text.coachCardTitle}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{text.coach}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-400">{text.coachCardText}</p>
                </button>
              </div>
            </div>
          )}

          {screen === "form" && role && (
            <form onSubmit={handleFormSubmit} onKeyDown={handleWizardKeyDown} className="mt-6 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setScreen("choose");
                  resetFormState();
                }}
                className="mb-1 text-left text-sm text-stone-400 hover:text-amber-300"
              >
                {text.back}
              </button>

              <p className="text-sm text-stone-400">
                {text.registeringAs} <span className="font-semibold">{role === "PLAYER" ? text.player : text.coach}</span>
              </p>

              {authMethod === "choose" ? (
                <div className="grid gap-4">
                  <div className="rounded-[1.8rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
                      {text.chooseMethodTitle}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-stone-400">{text.chooseMethodHint}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.7rem] border border-zinc-800 bg-zinc-950/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                        {text.manualTrack}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-stone-100">{text.manualMethodTitle}</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-400">{text.manualMethodText}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod("manual");
                          setWizardStepIndex(0);
                          setError("");
                        }}
                        className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-amber-400 hover:bg-zinc-800"
                      >
                        {text.chooseThisPath}
                      </button>
                    </div>

                    <div className="rounded-[1.7rem] border border-amber-500/30 bg-amber-500/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                        {text.googleTrack}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-stone-100">{text.googleMethodTitle}</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-300">{text.googleMethodText}</p>
                      <div className="mt-5">
                        <GoogleAuthButton
                          label={text.continueWithGoogle}
                          hint={text.googleHint}
                          onCodeReceived={handleGoogleRegister}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {authMethod !== "choose" ? (
              <div className="overflow-hidden rounded-[1.8rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
                        {text.googleProgress}
                      </p>
                      <p className="mt-2 text-sm text-stone-400">
                        {isGoogleFlow ? text.googleReady : text.wizardReady}
                      </p>
                    </div>
                    <div className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-stone-200">
                      {isGoogleFlow ? text.googleTrack : text.manualTrack}
                    </div>
                  </div>

                  {isGoogleFlow ? (
                    <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <p className="text-sm font-semibold text-stone-100">{text.googleConnectedTitle}</p>
                      <p className="mt-2 text-xs leading-6 text-stone-400">{text.googleConnectedText}</p>
                      {googleEmail ? (
                        <p className="mt-2 text-xs text-amber-300">
                          {text.connectedEmail}: {googleEmail}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-1 gap-2">
                      {wizardSteps.map((wizardStep, index) => (
                        <div
                          key={wizardStep.key}
                          className={`h-2 flex-1 rounded-full transition ${
                            index <= wizardStepIndex ? "bg-amber-400" : "bg-zinc-800"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="ml-4 text-xs text-stone-500">
                      {text.googleStep} {wizardStepIndex + 1}/{wizardSteps.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 p-5">
                  <div className="rounded-[1.6rem] border border-zinc-800 bg-zinc-900/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                      {role === "PLAYER" ? text.player : text.coach}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-stone-100">{activeStep.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-stone-400">{activeStep.hint}</p>
                  </div>

                  {renderWizardField()}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      disabled={wizardStepIndex === 0}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-stone-300 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {text.previous}
                    </button>

                    <div className="flex items-center gap-3">
                      {!activeStep.required && !isLastStep ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="text-sm text-stone-400 transition hover:text-amber-300"
                        >
                          {text.skip}
                        </button>
                      ) : null}

                      {!isLastStep ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
                        >
                          {text.next}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            void finalizeRegistration();
                          }}
                          disabled={submitting}
                          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting
                            ? text.creating
                            : isGoogleFlow
                              ? text.finishGoogleSignup
                              : text.finishManualSignup}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ) : null}
            </form>
          )}

          {error ? <div className="mt-4"><InlineAlert message={error} /></div> : null}

          <p className="mt-6 text-center text-sm text-stone-400">
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import api from "@/app/lib/axios";
import { uploadProfileImageToCloudinary, validateProfileImageFile } from "@/app/lib/cloudinary";
import GoogleAuthButton from "@/app/Components/GoogleAuthButton";
import InlineAlert from "@/app/Components/InlineAlert";

type Role = "PLAYER" | "COACH";
type SignupMethod = "manual" | "google";
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

  const [screen, setScreen] = useState<"role" | "method" | "wizard">("role");
  const [role, setRole] = useState<Role | null>(null);
  const [signupMethod, setSignupMethod] = useState<SignupMethod | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [googleSignupToken, setGoogleSignupToken] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState("");
  const [wizardStepIndex, setWizardStepIndex] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [position, setPosition] = useState("PG");
  const [height, setHeight] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  const [error, setError] = useState("");
  const [stepFeedback, setStepFeedback] = useState("");

  const text = useMemo(
    () =>
      isHebrew
        ? {
        eyebrow: "הצטרפות למערכת",
        title: "יצירת חשבון",
        subtitle: "בחר סוג חשבון, אחר כך בחר איך להירשם, ואז השלם את הפרטים צעד אחר צעד.",
        chooseRole: "בחר סוג חשבון",
        chooseMethod: "בחר איך להירשם",
        player: "הירשם כשחקן",
        coach: "הירשם כמאמן",
        playerCardText: "מעקב אישי אחרי אימונים, סשנים, אחוזים והתקדמות.",
        coachCardText: "ניהול שחקנים, תבניות ואימונים במקום אחד.",
        signup: "הרשמה רגילה",
        signupText: "הרשמה עם אימייל, שם משתמש וסיסמה, ואז השלמת פרופיל בשלבים פשוטים.",
        signupWithGoogle: "הרשמה עם Google",
        signupWithGoogleText: "Google יאמת את הזהות שלך קודם, ואז תשלים את שאר הפרטים בתהליך קצר.",
        back: "חזרה",
        registeringAs: "נרשם בתור",
        wizardReady: "תהליך הרשמה פשוט וברור. בכל שלב מתקדמים רק עם פרט אחד.",
        googleReady: "Google כבר חיבר את החשבון. עכשיו משלימים את שאר הפרטים באותו תהליך ברור.",
        googleConnectedTitle: "Google חיבר את החשבון שלך",
        googleConnectedText: "עכשיו נשאר רק להשלים את שאר הפרטים ולסיים את ההרשמה.",
        connectedEmail: "אימייל מחובר",
        progress: "התקדמות",
        step: "שלב",
        next: "הבא",
        previous: "הקודם",
        skip: "דלג לעכשיו",
        username: "שם משתמש",
        email: "אימייל",
        firstName: "שם פרטי",
        lastName: "שם משפחה",
        phoneNumber: "מספר טלפון",
        password: "סיסמה",
        dateOfBirth: "תאריך לידה",
        height: "גובה (ס\"מ)",
        profilePhotoHint: "בחר תמונה עד 10MB",
        profilePhotoRemove: "הסר תמונה",
        finishManualSignup: "צור חשבון",
        finishGoogleSignup: "השלם הרשמה עם Google",
        creating: "יוצר חשבון...",
        validating: "בודק...",
        failed: "ההרשמה נכשלה",
        googleFailed: "הרשמה עם Google נכשלה",
        usernameStepTitle: "בחר שם משתמש",
        usernameStepHint: "זה השם שיופיע באפליקציה.",
        usernameStepRequired: "צריך לבחור שם משתמש כדי להמשיך.",
        usernameStepTooShort: "שם המשתמש צריך להכיל לפחות 3 תווים.",
        usernameStepInvalid: "אפשר להשתמש רק באותיות, מספרים, נקודה, קו תחתון ומקף.",
        usernameTaken: "שם המשתמש הזה כבר תפוס.",
        usernameAvailable: "שם המשתמש הזה פנוי.",
        emailStepTitle: "מה האימייל שלך?",
        emailStepHint: "האימייל ישמש להתחברות ולהודעות חשובות.",
        emailStepRequired: "צריך להזין אימייל כדי להמשיך.",
        emailStepInvalid: "צריך להזין כתובת אימייל תקינה.",
        emailTaken: "כתובת האימייל הזו כבר קיימת במערכת.",
        emailAvailable: "כתובת האימייל נראית תקינה ופנויה.",
        firstNameStepTitle: "שם פרטי",
        firstNameStepHint: "אפשר להשאיר ריק אם תרצה להשלים אחר כך.",
        lastNameStepTitle: "שם משפחה",
        lastNameStepHint: "גם זה שדה שאפשר להשלים בהמשך.",
        phoneStepTitle: "מספר טלפון",
        phoneStepHint: "אופציונלי, למקרה שתרצה לשתף בפרופיל.",
        passwordStepTitle: "בחר סיסמה",
        passwordStepHint: "רק עוד שלב אחד של אבטחה ואתה בפנים.",
        passwordStepRequired: "צריך לבחור סיסמה כדי להמשיך.",
        passwordStepTooShort: "הסיסמה צריכה להכיל לפחות 8 תווים.",
        photoStepTitle: "תמונת פרופיל",
        photoStepHint: "לא חובה, אבל נותן לפרופיל מראה שלם יותר.",
        dobStepTitle: "מתי נולדת?",
        dobStepHint: "אפשר גם להשאיר להמשך.",
        positionStepTitle: "מה העמדה שלך?",
        positionStepHint: "עוזר להתאים את חוויית האימון.",
        heightStepTitle: "מה הגובה שלך?",
        heightStepHint: "גם זה שדה שאפשר להשלים אחר כך.",
        haveAccount: "כבר יש לך חשבון?",
        haveAccountLink: "להתחברות",
        positions: {
          PG: "רכז",
          SG: "קלע",
          SF: "סמול פורוורד",
          PF: "פאוור פורוורד",
          C: "סנטר",
        },
      }
        : {
        eyebrow: "Join The Platform",
        title: "Create Account",
        subtitle: "Choose your account type, then choose how to sign up, and finish the details step by step.",
        chooseRole: "Choose account type",
        chooseMethod: "Choose how to sign up",
        player: "Sign up as Player",
        coach: "Sign up as Coach",
        playerCardText: "Track workouts, sessions, percentages, and progress clearly.",
        coachCardText: "Manage players, templates, and assigned workouts in one place.",
        signup: "Sign up",
        signupText: "Create an account with email, username, and password, then complete your profile step by step.",
        signupWithGoogle: "Sign up with Google",
        signupWithGoogleText: "Google verifies your identity first, then you finish the rest in a short guided flow.",
        back: "Back",
        registeringAs: "Registering as",
        wizardReady: "A simple and clear signup flow. One detail at a time.",
        googleReady: "Google already connected your account. Now finish the rest in the same clear flow.",
        googleConnectedTitle: "Google connected your account",
        googleConnectedText: "Now just complete the remaining details and finish signing up.",
        connectedEmail: "Connected email",
        progress: "Progress",
        step: "Step",
        next: "Next",
        previous: "Previous",
        skip: "Skip for now",
        username: "Username",
        email: "Email",
        firstName: "First Name",
        lastName: "Last Name",
        phoneNumber: "Phone Number",
        password: "Password",
        dateOfBirth: "Date of Birth",
        height: "Height (cm)",
        profilePhotoHint: "Choose an image up to 10MB",
        profilePhotoRemove: "Remove photo",
        finishManualSignup: "Create Account",
        finishGoogleSignup: "Finish Google Signup",
        creating: "Creating account...",
        validating: "Checking...",
        failed: "Registration failed",
        googleFailed: "Google signup failed",
        usernameStepTitle: "Choose a username",
        usernameStepHint: "This is the name shown inside the app.",
        usernameStepRequired: "Choose a username to continue.",
        usernameStepTooShort: "Username must be at least 3 characters long.",
        usernameStepInvalid: "Use only letters, numbers, dots, underscores, and hyphens.",
        usernameTaken: "This username is already taken.",
        usernameAvailable: "This username is available.",
        emailStepTitle: "What is your email?",
        emailStepHint: "Your email will be used for sign in and important account messages.",
        emailStepRequired: "Enter an email to continue.",
        emailStepInvalid: "Enter a valid email address.",
        emailTaken: "This email is already registered.",
        emailAvailable: "This email looks valid and available.",
        firstNameStepTitle: "First name",
        firstNameStepHint: "You can leave this for later if you want.",
        lastNameStepTitle: "Last name",
        lastNameStepHint: "This can also be completed later.",
        phoneStepTitle: "Phone number",
        phoneStepHint: "Optional, if you want it on the profile.",
        passwordStepTitle: "Create a password",
        passwordStepHint: "One more security step and you are in.",
        passwordStepRequired: "Choose a password to continue.",
        passwordStepTooShort: "Password must be at least 8 characters long.",
        photoStepTitle: "Profile photo",
        photoStepHint: "Optional, but it makes the profile feel more complete.",
        dobStepTitle: "When were you born?",
        dobStepHint: "You can also leave this for later.",
        positionStepTitle: "What position do you play?",
        positionStepHint: "Helps tailor the training experience.",
        heightStepTitle: "What is your height?",
        heightStepHint: "This can also be completed later.",
        haveAccount: "Already have an account?",
        haveAccountLink: "Log in",
        positions: {
          PG: "Point Guard",
          SG: "Shooting Guard",
          SF: "Small Forward",
          PF: "Power Forward",
          C: "Center",
        },
      },
    [isHebrew]
  );

  const isGoogleFlow = signupMethod === "google";

  const wizardSteps = useMemo<WizardStep[]>(() => {
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
  }, [isGoogleFlow, role, text]);

  const activeStep = wizardSteps[Math.min(wizardStepIndex, wizardSteps.length - 1)];
  const isLastStep = wizardStepIndex === wizardSteps.length - 1;
  const progressPercent = ((wizardStepIndex + 1) / wizardSteps.length) * 100;

  const resetGoogleFlow = () => {
    setGoogleSignupToken(null);
    setGoogleEmail("");
  };

  const resetFormState = () => {
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setPassword("");
    setDateOfBirth("");
    setPosition("PG");
    setHeight("");
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    setWizardStepIndex(0);
    setError("");
    setStepFeedback("");
    resetGoogleFlow();
  };

  const parseErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === "object" && err !== null && "response" in err) {
      const response = err.response;
      if (typeof response === "object" && response !== null && "data" in response) {
        const data = response.data;
        if (typeof data === "string") {
          return data;
        }

        if (typeof data === "object" && data !== null) {
          if ("detail" in data && typeof data.detail === "string") {
            return data.detail;
          }

          const firstEntry = Object.values(data).find((value) =>
            typeof value === "string" || (Array.isArray(value) && typeof value[0] === "string")
          );

          if (typeof firstEntry === "string") {
            return firstEntry;
          }

          if (Array.isArray(firstEntry) && typeof firstEntry[0] === "string") {
            return firstEntry[0];
          }
        }
      }
    }

    return fallback;
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidUsername = (value: string) => /^[A-Za-z0-9._-]+$/.test(value);

  const checkAvailability = async (field: "username" | "email", value: string) => {
    try {
      const res = await api.get("/register/validate/", {
        params: { [field]: value },
      });

      const data = res.data as Record<string, unknown>;
      const isAvailable =
        typeof data.available === "boolean"
          ? data.available
          : typeof data[`${field}_available`] === "boolean"
            ? (data[`${field}_available`] as boolean)
            : true;

      return { supported: true, available: isAvailable };
    } catch (err: unknown) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "status" in err.response &&
        typeof err.response.status === "number"
          ? err.response.status
          : null;

      if (status === 400 || status === 409) {
        return { supported: true, available: false };
      }

      if (status === 404 || status === 405 || status === 501) {
        return { supported: false, available: true };
      }

      throw err;
    }
  };

  const validateCurrentStep = async () => {
    if (activeStep.key === "username") {
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        setError(text.usernameStepRequired);
        return false;
      }

      if (trimmedUsername.length < 3) {
        setError(text.usernameStepTooShort);
        return false;
      }

      if (!isValidUsername(trimmedUsername)) {
        setError(text.usernameStepInvalid);
        return false;
      }

      setValidatingStep(true);

      try {
        const result = await checkAvailability("username", trimmedUsername);

        if (!result.available) {
          setError(text.usernameTaken);
          return false;
        }

        setUsername(trimmedUsername);
        setError("");
        setStepFeedback(result.supported ? text.usernameAvailable : "");
        return true;
      } catch (err) {
        setError(parseErrorMessage(err, text.failed));
        return false;
      } finally {
        setValidatingStep(false);
      }
    }

    if (activeStep.key === "email") {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setError(text.emailStepRequired);
        return false;
      }

      if (!isValidEmail(trimmedEmail)) {
        setError(text.emailStepInvalid);
        return false;
      }

      setValidatingStep(true);

      try {
        const result = await checkAvailability("email", trimmedEmail);

        if (!result.available) {
          setError(text.emailTaken);
          return false;
        }

        setEmail(trimmedEmail);
        setError("");
        setStepFeedback(result.supported ? text.emailAvailable : "");
        return true;
      } catch (err) {
        setError(parseErrorMessage(err, text.failed));
        return false;
      } finally {
        setValidatingStep(false);
      }
    }

    if (activeStep.key === "password") {
      if (!password.trim()) {
        setError(text.passwordStepRequired);
        return false;
      }

      if (password.length < 8) {
        setError(text.passwordStepTooShort);
        return false;
      }
    }

    setError("");
    setStepFeedback("");
    return true;
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
      setScreen("wizard");
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
    } catch (err) {
      setError(parseErrorMessage(err, text.failed));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    const isStepValid = await validateCurrentStep();
    if (!isStepValid) {
      return;
    }

    setWizardStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1));
  };

  const handlePreviousStep = () => {
    setError("");
    setStepFeedback("");
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
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
              setStepFeedback("");
            }}
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
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setStepFeedback("");
            }}
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
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setStepFeedback("");
            }}
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

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8">
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
          </div>

          {screen === "role" ? (
            <div className="mt-6 grid gap-4">
              <p className="text-center text-stone-400">{text.chooseRole}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => {
                    setRole("PLAYER");
                    setScreen("method");
                    resetFormState();
                  }}
                  className="rounded-[1.8rem] border border-amber-500/35 bg-linear-to-br from-amber-500 to-amber-400 p-6 text-left text-zinc-950 shadow-[0_20px_60px_rgba(245,158,11,0.18)] transition hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-300"
                >
                  <h3 className="text-2xl font-bold">{text.player}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-900/80">{text.playerCardText}</p>
                </button>
                <button
                  onClick={() => {
                    setRole("COACH");
                    setScreen("method");
                    resetFormState();
                  }}
                  className="rounded-[1.8rem] border border-zinc-700 bg-linear-to-br from-zinc-900 to-zinc-800 p-6 text-left text-stone-100 transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:from-zinc-800 hover:to-zinc-700"
                >
                  <h3 className="text-2xl font-bold">{text.coach}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-400">{text.coachCardText}</p>
                </button>
              </div>
            </div>
          ) : null}

          {screen === "method" && role ? (
            <div className="mt-6 space-y-5">
              <button
                type="button"
                onClick={() => {
                  setScreen("role");
                  setRole(null);
                  resetFormState();
                }}
                className="text-left text-sm text-stone-400 hover:text-amber-300"
              >
                {text.back}
              </button>

              <p className="text-center text-sm text-stone-400">
                {text.registeringAs}{" "}
                <span className="font-semibold">{role === "PLAYER" ? text.player : text.coach}</span>
              </p>

              <p className="text-center text-stone-400">{text.chooseMethod}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod("manual");
                    setScreen("wizard");
                    setWizardStepIndex(0);
                    setError("");
                  }}
                  className="rounded-[1.8rem] border border-zinc-700 bg-zinc-900/85 p-6 text-left transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-zinc-800"
                >
                  <h3 className="text-2xl font-bold text-stone-100">{text.signup}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-400">{text.signupText}</p>
                </button>
                <GoogleAuthButton
                  label={text.signupWithGoogle}
                  hint=""
                  onCodeReceived={async (code) => {
                    setSignupMethod("google");
                    await handleGoogleRegister(code);
                  }}
                  disabled={submitting}
                  className="h-full min-h-[144px] rounded-[1.8rem] border-amber-500/30 bg-linear-to-br from-amber-500/10 via-zinc-950 to-zinc-900 px-6 py-6 hover:border-amber-400 hover:from-amber-500/15 hover:via-zinc-900 hover:to-zinc-800"
                />
              </div>

              {error ? <InlineAlert message={error} /> : null}
            </div>
          ) : null}

          {screen === "wizard" && role && signupMethod ? (
            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setScreen("method");
                  setSignupMethod(null);
                  resetFormState();
                }}
                className="text-left text-sm text-stone-400 hover:text-amber-300"
              >
                {text.back}
              </button>

              <p className="text-center text-sm text-stone-400">
                {text.registeringAs}{" "}
                <span className="font-semibold">{role === "PLAYER" ? text.player : text.coach}</span>
              </p>

              <div className="overflow-hidden rounded-[1.8rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
                        {text.progress}
                      </p>
                      <p className="mt-2 text-sm text-stone-400">
                        {isGoogleFlow ? text.googleReady : text.wizardReady}
                      </p>
                    </div>
                    {isGoogleFlow ? (
                      <div className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-stone-200">
                        {text.signupWithGoogle}
                      </div>
                    ) : null}
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
                      {text.step} {wizardStepIndex + 1}/{wizardSteps.length}
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

                  {error ? <InlineAlert message={error} /> : null}
                  {stepFeedback ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      {stepFeedback}
                    </div>
                  ) : null}

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
                          onClick={() => {
                            void handleNextStep();
                          }}
                          disabled={validatingStep}
                          className="text-sm text-stone-400 transition hover:text-amber-300"
                        >
                          {text.skip}
                        </button>
                      ) : null}

                      {!isLastStep ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleNextStep();
                          }}
                          disabled={validatingStep}
                          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {validatingStep ? text.validating : text.next}
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
            </div>
          ) : null}

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

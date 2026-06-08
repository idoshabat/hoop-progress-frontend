"use client";

import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";

const publicHighlights = [
  {
    title: "Build smarter shooting habits",
    description:
      "Track sessions, watch trends, and turn every workout into measurable progress.",
  },
  {
    title: "Coach-player connection",
    description:
      "Assign plans, follow development, and keep training focused on what matters most.",
  },
  {
    title: "One place for momentum",
    description:
      "Workouts, sessions, stats, and accountability all live in the same flow.",
  },
];

const playerActions = [
  {
    href: "/workouts",
    title: "My Workouts",
    description: "See what is active, what is completed, and what your coaches assigned.",
  },
  {
    href: "/stats",
    title: "Performance Stats",
    description: "Review percentages, streaks, and how your consistency is evolving.",
  },
  {
    href: "/my-coaches",
    title: "Coach Hub",
    description: "View your coaches, their assigned workouts, and your current connections.",
  },
  {
    href: "/player-calendar",
    title: "Session Calendar",
    description: "Open a calendar view and review every session you logged on a specific date.",
  },
];

const coachActions = [
  {
    href: "/coach-dashboard",
    title: "Player Dashboard",
    description: "Check your players, open their workout plans, and follow their progress.",
  },
  {
    href: "/coach-dashboard/manage",
    title: "Manage Requests",
    description: "Handle player requests and grow your coaching circle with less friction.",
  },
  {
    href: "/coach-profile",
    title: "Coach Profile",
    description: "Keep your account details updated and ready for players to find.",
  },
  {
    href: "/coach-calendar",
    title: "Team Calendar",
    description: "Review all player sessions by date and spot who hit the goal line.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const { isHebrew } = useLanguage();

  const publicHighlightsText = isHebrew
    ? [
        {
          title: "בונים הרגלי קליעה חכמים יותר",
          description:
            "עוקבים אחרי סשנים, רואים מגמות, והופכים כל אימון להתקדמות מדידה.",
        },
        {
          title: "חיבור בין מאמן לשחקן",
          description:
            "מחלקים תוכניות, עוקבים אחרי התפתחות, ושומרים את האימונים ממוקדים במה שחשוב.",
        },
        {
          title: "מקום אחד למומנטום",
          description:
            "אימונים, סשנים, סטטיסטיקות ואחריות אישית חיים באותו זרם עבודה.",
        },
      ]
    : publicHighlights;

  const playerActionsText = isHebrew
    ? [
        {
          href: "/workouts",
          title: "האימונים שלי",
          description: "בדוק מה פעיל, מה הושלם, ומה המאמנים שלך הקצו לך.",
        },
        {
          href: "/stats",
          title: "סטטיסטיקות ביצועים",
          description: "סקור אחוזים, רצפים, ואיך העקביות שלך מתפתחת לאורך זמן.",
        },
        {
          href: "/my-coaches",
          title: "מרכז מאמנים",
          description: "צפה במאמנים שלך, באימונים שהוקצו לך ובקשרים הפעילים שלך.",
        },
        {
          href: "/player-calendar",
          title: "יומן סשנים",
          description: "פתח תצוגת יומן ועבור על כל סשן שתיעדת לפי תאריך.",
        },
      ]
    : playerActions;

  const coachActionsText = isHebrew
    ? [
        {
          href: "/coach-dashboard",
          title: "לוח שחקנים",
          description: "בדוק את השחקנים שלך, פתח את תוכניות האימון שלהם ועקוב אחרי ההתקדמות.",
        },
        {
          href: "/coach-dashboard/manage",
          title: "ניהול בקשות",
          description: "טפל בבקשות משחקנים והרחב את מעגל האימון שלך בפחות חיכוך.",
        },
        {
          href: "/coach-profile",
          title: "פרופיל מאמן",
          description: "שמור את פרטי החשבון שלך מעודכנים ומוכנים לשחקנים שמחפשים אותך.",
        },
        {
          href: "/coach-calendar",
          title: "יומן קבוצה",
          description: "סקור את כל סשני השחקנים לפי תאריך וראה מי הגיע ליעד.",
        },
      ]
    : coachActions;

  const text = isHebrew
    ? {
        loading: "טוען...",
        publicBadge: "HoopProgress לשחקנים ולמאמנים",
        publicTitle: "לכל חזרה מגיע סיפור.",
        publicDescription:
          "HoopProgress הופכת אימונים לציר זמן חי של התקדמות. שחקנים נשארים מחויבים, מאמנים נשארים מחוברים, והתקדמות הופכת למשהו שאפשר ממש לראות.",
        createAccount: "צור חשבון",
        login: "התחבר",
        liveFocus: "פוקוס חי",
        trainWithStructure: "מתאמנים עם מבנה",
        active: "פעיל",
        currentBlock: "בלוק נוכחי",
        sessionsLogged: "סשנים שתועדו",
        currentAvg: "ממוצע נוכחי",
        coachMode: "מצב מאמן",
        playerMode: "מצב שחקן",
        welcomeBack: "ברוך שובך",
        coachWelcome:
          "הובל את השחקנים שלך בבהירות. עקוב אחרי בקשות, פתח תוכניות אימון ושמור על התקדמות גלויה.",
        playerWelcome:
          "הישאר קרוב להתקדמות שלך. עבור על המשימות שהמאמנים נתנו לך, תעד סשנים ושמור על קצב אימון חזק.",
        openDashboard: "פתח לוח בקרה",
        openWorkouts: "פתח אימונים",
        managePlayers: "נהל שחקנים",
        viewCoaches: "צפה במאמנים",
        todayEnergy: "האנרגיה של היום",
        lead: "להוביל",
        compete: "להתחרות",
        coachEnergy:
          "פתח בקשות, סקור שחקנים והקצה את האתגר הבא.",
        playerEnergy:
          "בחר את האימון הבא, תעד סשנים ושמור על המומנטום חי.",
        focus: "פוקוס",
        players: "שחקנים",
        progress: "התקדמות",
        quickDirection: "ניווט מהיר",
      }
    : {
        loading: "Loading...",
        publicBadge: "HoopProgress for players and coaches",
        publicTitle: "Every rep deserves a story.",
        publicDescription:
          "HoopProgress turns workouts into a living training timeline. Players stay locked in, coaches stay connected, and progress becomes something you can actually see.",
        createAccount: "Create account",
        login: "Login",
        liveFocus: "Live Focus",
        trainWithStructure: "Train with structure",
        active: "Active",
        currentBlock: "Current block",
        sessionsLogged: "Sessions logged",
        currentAvg: "Current avg",
        coachMode: "Coach Mode",
        playerMode: "Player Mode",
        welcomeBack: "Welcome back",
        coachWelcome:
          "Guide your players with clarity. Track requests, open player workout plans, and keep development visible.",
        playerWelcome:
          "Stay close to your progress. Review coach-assigned work, log sessions, and keep your training rhythm strong.",
        openDashboard: "Open dashboard",
        openWorkouts: "Open workouts",
        managePlayers: "Manage players",
        viewCoaches: "View coaches",
        todayEnergy: "Today's Energy",
        lead: "Lead",
        compete: "Compete",
        coachEnergy:
          "Open requests, review players, and assign the next challenge.",
        playerEnergy:
          "Choose the next workout, log sessions, and keep momentum alive.",
        focus: "Focus",
        players: "Players",
        progress: "Progress",
        quickDirection: "Quick Direction",
      };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">{text.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="relative overflow-hidden px-6 py-16">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-zinc-950/75" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-10 top-56 h-56 w-56 rounded-full bg-amber-300/8 blur-3xl" />
          <div className="absolute bottom-12 left-12 h-48 w-48 rounded-full bg-zinc-700/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-300">
                {text.publicBadge}
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-stone-100 md:text-6xl">
                {text.publicTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-400">
                {text.publicDescription}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                >
                  {text.createAccount}
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-zinc-800"
                >
                  {text.login}
                </Link>
              </div>
            </div>

            <div className="rounded-4xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30">
              <div className="rounded-4xl border border-zinc-800 bg-linear-to-br from-zinc-950 to-zinc-900 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                      {text.liveFocus}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-stone-100">
                      {text.trainWithStructure}
                    </h2>
                  </div>
                  <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                    {text.active}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-sm text-stone-400">{text.currentBlock}</p>
                    <p className="mt-1 text-lg font-semibold text-stone-100">
                      {isHebrew ? "עקביות מחצי מרחק" : "Mid-range consistency"}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-[72%] rounded-full bg-linear-to-r from-amber-500 to-amber-300" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                      <p className="text-sm text-stone-400">{text.sessionsLogged}</p>
                      <p className="mt-2 text-3xl font-bold text-stone-100">18</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                      <p className="text-sm text-stone-400">{text.currentAvg}</p>
                      <p className="mt-2 text-3xl font-bold text-amber-300">74.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 grid gap-6 md:grid-cols-3">
            {publicHighlightsText.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/85 p-6 shadow-lg shadow-black/20"
              >
                <h3 className="text-xl font-semibold text-stone-100">{item.title}</h3>
                <p className="mt-3 leading-7 text-stone-400">{item.description}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    );
  }

  const isCoach = user.role === "COACH";
  const preferredName = user.first_name?.trim() || user.username;
  const actions = isCoach ? coachActionsText : playerActionsText;

  return (
    <main className="relative overflow-hidden px-6 py-14">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-zinc-950/80" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-zinc-700/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-4xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-black/30">
            <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-300">
              {isCoach ? text.coachMode : text.playerMode}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight text-stone-100 md:text-5xl">
              {text.welcomeBack}, {preferredName}.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
              {isCoach
                ? text.coachWelcome
                : text.playerWelcome}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={isCoach ? "/coach-dashboard" : "/workouts"}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
              >
                {isCoach ? text.openDashboard : text.openWorkouts}
              </Link>
              <Link
                href={isCoach ? "/coach-dashboard/manage" : "/my-coaches"}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-zinc-800"
              >
                {isCoach ? text.managePlayers : text.viewCoaches}
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                {text.todayEnergy}
              </p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-stone-100">
                    {isCoach ? text.lead : text.compete}
                  </p>
                  <p className="mt-2 text-stone-400">
                    {isCoach
                      ? text.coachEnergy
                      : text.playerEnergy}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-right text-amber-300">
                  <p className="text-xs uppercase tracking-[0.25em]">{text.focus}</p>
                  <p className="mt-1 text-xl font-bold">
                    {isCoach ? text.players : text.progress}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                {text.quickDirection}
              </p>
              <div className="mt-4 space-y-3">
                {actions.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 hover:border-amber-500/40 hover:bg-zinc-900"
                  >
                    <h2 className="text-lg font-semibold text-stone-100">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <PendingRequestsBanner />
        </div>
      </div>
    </main>
  );
}

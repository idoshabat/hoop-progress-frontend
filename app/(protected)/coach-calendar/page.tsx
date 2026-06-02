"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import InlineCalendar from "@/app/Components/InlineCalendar";
import { Session } from "@/app/types";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWorkoutName(session: Session) {
  if (session.workout_name) return session.workout_name;
  if (typeof session.workout === "object" && "name" in session.workout && session.workout.name) {
    return session.workout.name;
  }
  const workoutId =
    typeof session.workout === "object" ? session.workout.id : session.workout;
  return `Workout #${workoutId}`;
}

function getWorkoutId(session: Session) {
  return typeof session.workout === "object" ? session.workout.id : session.workout;
}

function getRateClasses(session: Session) {
  if (typeof session.workout_goal_percentage !== "number") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return session.success_rate > session.workout_goal_percentage
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : "border-red-500/30 bg-red-500/10 text-red-300";
}

export default function CoachCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { isHebrew, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text = useMemo(
    () =>
      isHebrew
        ? {
            failedLoad: "טעינת הסשנים של השחקנים לתאריך הזה נכשלה.",
            loading: "טוען יומן...",
            loginRequired: "יש להתחבר כדי לצפות ביומן שלך.",
            accessDenied: "אין גישה. למאמנים בלבד.",
            activity: "פעילות קבוצה",
            title: "יומן מאמן",
            intro:
              "סקור את כל הסשנים שהשחקנים שלך תיעדו ביום מסוים וראה במהירות מי עבר את היעד.",
            dayView: "תצוגת יום",
            noSessionsForDate: "לא תועדו סשנים של שחקנים בתאריך הזה.",
            sessionsFound: "סשנים של שחקנים נמצאו",
            openDashboard: "פתח לוח בקרה",
            noneLogged: "אף אחד מהשחקנים שלך לא תיעד סשן בתאריך הזה.",
            playerFallback: "שחקן",
            makes: "קליעות",
          }
        : {
            failedLoad: "Failed to load player sessions for this date.",
            loading: "Loading calendar...",
            loginRequired: "Please log in to view your calendar.",
            accessDenied: "Access denied. Coaches only.",
            activity: "Team Activity",
            title: "Coach Calendar",
            intro:
              "Review all sessions logged by your players on a specific day and quickly spot who beat the goal.",
            dayView: "Day View",
            noSessionsForDate: "No player sessions were recorded on this date.",
            sessionsFound: "player sessions found",
            openDashboard: "Open dashboard",
            noneLogged: "None of your players logged a session on this date.",
            playerFallback: "Player",
            makes: "Makes",
          },
    [isHebrew]
  );

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("sessions/my-players/by-date/", {
        params: { date: selectedDate },
      });
      setSessions(res.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setSessions([]);
      setError(text.failedLoad);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, text.failedLoad]);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadSessions();
  }, [authLoading, user, loadSessions]);

  const formattedDate = useMemo(
    () =>
      new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
        language === "he" ? "he-IL" : "en-US",
        {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [language, selectedDate]
  );

  if (authLoading || loading) {
    return <p className="p-6 text-stone-400">{text.loading}</p>;
  }

  if (!user) {
    return <p className="p-6 text-stone-400">{text.loginRequired}</p>;
  }

  if (user.role !== "COACH") {
    return <p className="p-6 text-red-500">{text.accessDenied}</p>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300/80">
              {text.activity}
            </p>
            <h1 className="mt-3 text-4xl font-black text-stone-100">{text.title}</h1>
            <p className="mt-4 text-lg leading-8 text-stone-400">
              {text.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <InlineCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300/80">{text.dayView}</p>
            <h2 className="mt-2 text-2xl font-bold text-stone-100">{formattedDate}</h2>
            <p className="mt-2 text-stone-400">
              {sessions.length === 0
                ? text.noSessionsForDate
                : isHebrew
                  ? `${sessions.length} ${text.sessionsFound}`
                  : `${sessions.length} player session${sessions.length === 1 ? "" : "s"} found`}
            </p>
          </div>
          <Link
            href="/coach-dashboard"
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-semibold text-amber-300 hover:border-amber-500/40 hover:bg-zinc-800"
          >
            {text.openDashboard}
          </Link>
        </div>

        {error ? <p className="mt-6 text-red-400">{error}</p> : null}

        {sessions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-stone-500">
            {text.noneLogged}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/workouts/${getWorkoutId(session)}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 transition hover:border-amber-500/40 hover:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm font-semibold text-stone-300">
                      {session.player_username || text.playerFallback}
                    </div>
                    <h3 className="text-xl font-semibold text-stone-100">{getWorkoutName(session)}</h3>
                    <p className="text-stone-400">
                      {text.makes}: {session.makes}/{session.attempts}
                    </p>
                  </div>
                  <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${getRateClasses(session)}`}>
                    {session.success_rate.toFixed(1)}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>
    </main>
  );
}

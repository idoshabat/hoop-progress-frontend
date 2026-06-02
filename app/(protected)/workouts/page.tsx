"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { Workout } from "@/app/types";
import WorkoutsSkeleton from "@/app/Components/WorkoutSkeleton";
import WorkoutGroup from "@/app/Components/WorkoutGroup";
import EmptyState from "@/app/Components/EmptyState";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function WorkoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const [assignedByMe, setAssignedByMe] = useState<Workout[]>([]);
    const [assignedByMyCoaches, setAssignedByMyCoaches] = useState<Workout[]>([]);
    const [selectedSource, setSelectedSource] = useState<"me" | "coaches">("me");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const text = isHebrew
        ? {
              failed: "טעינת האימונים נכשלה",
              emptyTitle: "עדיין אין אימונים",
              emptyDescription:
                  "התחל את האימון הראשון שלך כדי לעקוב אחרי התקדמות, סשנים וביצועים לאורך זמן.",
              emptyAction: "+ צור את האימון הראשון שלך",
              title: "האימונים שלי",
              subtitle: "האימונים שלך מאורגנים לפי מי שהקצה כל אימון.",
              addWorkout: "+ הוסף אימון",
              assignedByMe: "הוקצו על ידי",
              assignedByMeDescription: "אימונים שיצרת עבור תוכנית האימון האישית שלך.",
              assignedByCoach: "הוקצו על ידי המאמנים שלי",
              assignedByCoachDescription: "אימונים שניתנו לך על ידי אחד המאמנים שלך.",
              assignedByCoachLabel: "הוקצה על ידי מאמן",
          }
        : {
              failed: "Failed to load workouts",
              emptyTitle: "No workouts yet",
              emptyDescription:
                  "Start your first workout to track progress, sessions, and performance over time.",
              emptyAction: "+ Create your first workout",
              title: "My Workouts",
              subtitle: "Your training is organized by who assigned each workout.",
              addWorkout: "+ Add Workout",
              assignedByMe: "Assigned by me",
              assignedByMeDescription: "Workouts you created for your own training plan.",
              assignedByCoach: "Assigned by my coaches",
              assignedByCoachDescription: "Workouts given to you by one of your coaches.",
              assignedByCoachLabel: "Assigned by coach",
          };

    const loadWorkouts = useCallback(async () => {
        try {
            const [assignedByMeRes, assignedByMyCoachesRes] = await Promise.all([
                api.get("workouts/assigned-by-me/"),
                api.get("workouts/assigned-by-my-coaches/"),
            ]);

            setAssignedByMe(assignedByMeRes.data);
            setAssignedByMyCoaches(assignedByMyCoachesRes.data);
        } catch (err) {
            console.error(err);
            setError(isHebrew ? "טעינת האימונים נכשלה" : "Failed to load workouts");
        } finally {
            setLoading(false);
        }
    }, [isHebrew]);

    useEffect(() => {
        if (authLoading || !user) return;
        void loadWorkouts();
    }, [authLoading, user, loadWorkouts]);

    if (authLoading || loading) {
        return <WorkoutsSkeleton />;
    }

    if (error) {
        return <p className="mt-10 text-center text-red-500">{error}</p>;
    }

    const assignedByMeInProgress = assignedByMe.filter((workout) => !workout.is_completed);
    const assignedByMeCompleted = assignedByMe.filter((workout) => workout.is_completed);
    const assignedByMyCoachesInProgress = assignedByMyCoaches.filter(
        (workout) => !workout.is_completed
    );
    const assignedByMyCoachesCompleted = assignedByMyCoaches.filter(
        (workout) => workout.is_completed
    );
    const selectedGroup =
        selectedSource === "me"
            ? {
                  title: text.assignedByMe,
                  description: text.assignedByMeDescription,
                  inProgress: assignedByMeInProgress,
                  completed: assignedByMeCompleted,
                  sourceLabel: text.assignedByMe,
                  sourceTone: "bg-amber-500/15 text-amber-300",
              }
            : {
                  title: text.assignedByCoach,
                  description: text.assignedByCoachDescription,
                  inProgress: assignedByMyCoachesInProgress,
                  completed: assignedByMyCoachesCompleted,
                  sourceLabel: text.assignedByCoachLabel,
                  sourceTone: "bg-zinc-800 text-amber-300",
              };

    if (assignedByMe.length + assignedByMyCoaches.length === 0) {
        return (
            <div className="mx-auto mt-10 max-w-3xl p-4">
                <EmptyState
                    title={text.emptyTitle}
                    description={text.emptyDescription}
                    actionLabel={text.emptyAction}
                    actionHref="/workouts/create"
                />
            </div>
        );
    }

    return (
        <div className="mx-auto mt-10 max-w-4xl space-y-8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{text.title}</h1>
                    <p className="mt-1 text-sm text-stone-400">
                        {text.subtitle}
                    </p>
                </div>

                <Link
                    href="/workouts/create"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    {text.addWorkout}
                </Link>
            </div>

            <div className="inline-flex w-full rounded-xl border border-zinc-800 bg-zinc-900 p-1 sm:w-auto">
                <button
                    type="button"
                    onClick={() => setSelectedSource("me")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none cursor-pointer ${
                        selectedSource === "me"
                            ? "bg-amber-500 text-zinc-950 shadow-sm"
                            : "text-stone-400 hover:text-stone-100"
                    }`}
                >
                    {text.assignedByMe} ({assignedByMe.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedSource("coaches")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none cursor-pointer ${
                        selectedSource === "coaches"
                            ? "bg-amber-500 text-zinc-950 shadow-sm"
                            : "text-stone-400 hover:text-stone-100"
                    }`}
                >
                    {text.assignedByCoach} ({assignedByMyCoaches.length})
                </button>
            </div>

            <WorkoutGroup
                title={selectedGroup.title}
                description={selectedGroup.description}
                inProgress={selectedGroup.inProgress}
                completed={selectedGroup.completed}
                sourceLabel={selectedGroup.sourceLabel}
                sourceTone={selectedGroup.sourceTone}
            />
        </div>
    );
}

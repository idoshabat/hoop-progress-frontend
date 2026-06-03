"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Workout } from "@/app/types";
import WorkoutsSkeleton from "@/app/Components/WorkoutSkeleton";
import WorkoutGroup from "@/app/Components/WorkoutGroup";
import EmptyState from "@/app/Components/EmptyState";
import PageHero from "@/app/Components/PageHero";
import StatCard from "@/app/Components/StatCard";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import { createRetryWorkout } from "@/app/lib/retryWorkout";

export default function WorkoutsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [assignedByMe, setAssignedByMe] = useState<Workout[]>([]);
    const [assignedByMyCoaches, setAssignedByMyCoaches] = useState<Workout[]>([]);
    const [selectedSource, setSelectedSource] = useState<"me" | "coaches">("me");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryingWorkoutId, setRetryingWorkoutId] = useState<number | null>(null);

    const text = isHebrew
        ? {
              failed: "טעינת האימונים נכשלה",
              emptyTitle: "עדיין אין אימונים",
              emptyDescription:
                  "התחל את האימון הראשון שלך כדי לעקוב אחרי התקדמות, סשנים וביצועים לאורך זמן.",
              emptyAction: "+ צור את האימון הראשון שלך",
              title: "האימונים שלי",
              subtitle: "האימונים שלך מאורגנים לפי מי שהקצה כל אימון.",
              heroEyebrow: "מרכז הביצועים",
              addWorkout: "+ הוסף אימון",
              assignedByMe: "הוקצו על ידי",
              assignedByMeDescription: "אימונים שיצרת עבור תוכנית האימון האישית שלך.",
              assignedByCoach: "הוקצו על ידי המאמנים שלי",
              assignedByCoachDescription: "אימונים שניתנו לך על ידי אחד המאמנים שלך.",
              assignedByCoachLabel: "הוקצה על ידי מאמן",
              totalWorkouts: "סה\"כ אימונים",
              inProgress: "פעילים כרגע",
              completed: "הושלמו",
              coachAssigned: "מהמאמנים שלי",
              retrySuccessTitle: "האימון נוצר מחדש",
              retrySuccessMessage: "נוצר עבורך אימון חדש עם אותם היעדים והמבנה.",
              retryFailed: "יצירת ניסיון חוזר לאימון נכשלה",
              badge: "Workouts",
          }
        : {
              failed: "Failed to load workouts",
              emptyTitle: "No workouts yet",
              emptyDescription:
                  "Start your first workout to track progress, sessions, and performance over time.",
              emptyAction: "+ Create your first workout",
              title: "My Workouts",
              subtitle: "Your training is organized by who assigned each workout.",
              heroEyebrow: "Performance Hub",
              addWorkout: "+ Add Workout",
              assignedByMe: "Assigned by me",
              assignedByMeDescription: "Workouts you created for your own training plan.",
              assignedByCoach: "Assigned by my coaches",
              assignedByCoachDescription: "Workouts given to you by one of your coaches.",
              assignedByCoachLabel: "Assigned by coach",
              totalWorkouts: "Total Workouts",
              inProgress: "In Progress",
              completed: "Completed",
              coachAssigned: "Coach Assigned",
              retrySuccessTitle: "Workout recreated",
              retrySuccessMessage: "A new workout was created for you with the same structure and goals.",
              retryFailed: "Failed to create a retry workout",
              badge: "Workouts",
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

    const handleRetryWorkout = async (workout: Workout) => {
        try {
            setRetryingWorkoutId(workout.id);
            const recreatedWorkout = await createRetryWorkout(workout);
            showSuccess({
                title: text.retrySuccessTitle,
                message: text.retrySuccessMessage,
            });
            router.push(`/workouts/${recreatedWorkout.id}`);
        } catch (err) {
            console.error(err);
            setError(text.retryFailed);
        } finally {
            setRetryingWorkoutId(null);
        }
    };

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
    const totalWorkouts = assignedByMe.length + assignedByMyCoaches.length;
    const totalInProgress = assignedByMeInProgress.length + assignedByMyCoachesInProgress.length;
    const totalCompleted = assignedByMeCompleted.length + assignedByMyCoachesCompleted.length;
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
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <PageHero
                eyebrow={text.heroEyebrow}
                title={text.title}
                description={text.subtitle}
                badge={text.badge}
                action={
                    <Link
                        href="/workouts/create"
                        className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                    >
                        {text.addWorkout}
                    </Link>
                }
            >
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label={text.totalWorkouts} value={totalWorkouts} />
                    <StatCard label={text.inProgress} value={totalInProgress} accent />
                    <StatCard label={text.completed} value={totalCompleted} />
                    <StatCard label={text.coachAssigned} value={assignedByMyCoaches.length} />
                </div>
            </PageHero>

            <div className="inline-flex w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5 sm:w-auto">
                <button
                    type="button"
                    onClick={() => setSelectedSource("me")}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:flex-none cursor-pointer ${
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
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:flex-none cursor-pointer ${
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
                showRetryButton={selectedSource === "coaches"}
                onRetry={handleRetryWorkout}
                retryingWorkoutId={retryingWorkoutId}
            />
        </div>
    );
}

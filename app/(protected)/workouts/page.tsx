"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { Workout } from "@/app/types";
import WorkoutsSkeleton from "@/app/Components/WorkoutSkeleton";
import WorkoutGroup from "@/app/Components/WorkoutGroup";
import EmptyState from "@/app/Components/EmptyState";
import { useAuth } from "@/app/Context/AuthContext";

export default function WorkoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const [assignedByMe, setAssignedByMe] = useState<Workout[]>([]);
    const [assignedByMyCoaches, setAssignedByMyCoaches] = useState<Workout[]>([]);
    const [selectedSource, setSelectedSource] = useState<"me" | "coaches">("me");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchWorkouts = async () => {
            try {
                const [assignedByMeRes, assignedByMyCoachesRes] = await Promise.all([
                    api.get("workouts/assigned-by-me/"),
                    api.get("workouts/assigned-by-my-coaches/"),
                ]);

                setAssignedByMe(assignedByMeRes.data);
                setAssignedByMyCoaches(assignedByMyCoachesRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load workouts");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, [authLoading, user]);

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
                  title: "Assigned by me",
                  description: "Workouts you created for your own training plan.",
                  inProgress: assignedByMeInProgress,
                  completed: assignedByMeCompleted,
                  sourceLabel: "Assigned by me",
                  sourceTone: "bg-amber-500/15 text-amber-300",
              }
            : {
                  title: "Assigned by my coaches",
                  description: "Workouts given to you by one of your coaches.",
                  inProgress: assignedByMyCoachesInProgress,
                  completed: assignedByMyCoachesCompleted,
                  sourceLabel: "Assigned by coach",
                  sourceTone: "bg-zinc-800 text-amber-300",
              };

    if (assignedByMe.length + assignedByMyCoaches.length === 0) {
        return (
            <div className="mx-auto mt-10 max-w-3xl p-4">
                <EmptyState
                    title="No workouts yet"
                    description="Start your first workout to track progress, sessions, and performance over time."
                    actionLabel="+ Create your first workout"
                    actionHref="/workouts/create"
                />
            </div>
        );
    }

    return (
        <div className="mx-auto mt-10 max-w-4xl space-y-8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Workouts</h1>
                    <p className="mt-1 text-sm text-stone-400">
                        Your training is organized by who assigned each workout.
                    </p>
                </div>

                <Link
                    href="/workouts/create"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    + Add Workout
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
                    Assigned by me ({assignedByMe.length})
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
                    Assigned by my coaches ({assignedByMyCoaches.length})
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

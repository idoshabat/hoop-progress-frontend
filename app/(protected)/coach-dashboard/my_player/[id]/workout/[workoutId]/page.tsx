"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/app/lib/axios";
import EmptyState from "@/app/Components/EmptyState";
import ProgressBar from "@/app/Components/ProgressBar";
import { useAuth } from "@/app/Context/AuthContext";
import { Workout } from "@/app/types";

export default function CoachPlayerWorkoutDetailsPage() {
    const params = useParams<{ id: string; workoutId: string }>();
    const { user, loading: authLoading } = useAuth();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchWorkout = async () => {
            try {
                const res = await api.get(`workouts/assigned-by-me/player/${params.id}/`);
                const workouts = res.data || [];
                const matchedWorkout = workouts.find(
                    (item: Workout) => item.id === Number(params.workoutId)
                );

                if (!matchedWorkout) {
                    setError("Workout not found for this player.");
                    return;
                }

                setWorkout(matchedWorkout);
            } catch (err) {
                console.error(err);
                setError("Failed to load workout details.");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [authLoading, params.id, params.workoutId, user]);

    if (authLoading || loading) {
        return <p className="p-6">Loading workout details...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to view this page.</p>;
    }

    if (user.role !== "COACH") {
        return <p className="p-6 text-red-500">Access denied. Coaches only.</p>;
    }

    if (error || !workout) {
        return <p className="p-6 text-red-500">{error || "Workout not found."}</p>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6 text-stone-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-200">{workout.name}</h1>
                    {workout.description && (
                        <p className="mt-2 text-gray-600">{workout.description}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                        Created at: {new Date(workout.created_at).toLocaleString()}
                    </p>
                </div>

                <Link
                    href={`/coach-dashboard/my_player/${params.id}`}
                    className="text-amber-300 hover:text-amber-200 hover:underline"
                >
                    Back to Player Workouts
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-gray-500">Goal Percentage</p>
                    <p className="mt-1 text-lg font-semibold">{workout.goal_percentage}%</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-gray-500">Attempts</p>
                    <p className="mt-1 text-lg font-semibold">
                        {workout.total_makes}/{workout.total_attempts}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-gray-500">Sessions</p>
                    <p className="mt-1 text-lg font-semibold">
                        {workout.num_of_sessions}/{workout.target_sessions}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-gray-500">Average Percentage</p>
                    <p className="mt-1 text-lg font-semibold">
                        {workout.average_percentage.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Status</h2>
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            workout.is_completed
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-500/15 text-amber-300"
                        }`}
                    >
                        {workout.is_completed ? "Completed" : "In Progress"}
                    </span>
                </div>

                <p className="mt-3 font-medium">
                    {workout.is_completed
                        ? workout.is_successful
                            ? "Goal achieved"
                            : "Goal not achieved"
                        : "Workout still in progress"}
                </p>

                <div className="mt-4">
                    <ProgressBar
                        goal={workout.target_sessions}
                        current={workout.num_of_sessions}
                    />
                </div>
            </div>

            <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
                <h2 className="text-2xl font-semibold">Sessions</h2>

                {workout.sessions.length === 0 ? (
                    <EmptyState
                        title="No sessions yet"
                        description="This workout does not have any logged sessions yet."
                    />
                ) : (
                    <div className="mt-4 space-y-3">
                        {workout.sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {new Date(session.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Makes / Attempts: {session.makes}/{session.attempts}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Success Rate</p>
                                    <p className="font-semibold">
                                        {session.success_rate.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

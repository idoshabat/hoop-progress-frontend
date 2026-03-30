"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/app/lib/axios";
import EmptyState from "@/app/Components/EmptyState";
import { useAuth } from "@/app/Context/AuthContext";
import { Workout } from "@/app/types";

export default function CoachPlayerWorkoutsPage() {
    const params = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchPlayerWorkouts = async () => {
            try {
                const res = await api.get(`workouts/assigned-by-me/player/${params.id}/`);
                setWorkouts(res.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load this player's workouts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerWorkouts();
    }, [authLoading, params.id, user]);

    if (authLoading || loading) {
        return <p className="p-6">Loading player workouts...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to view this page.</p>;
    }

    if (user.role !== "COACH") {
        return <p className="p-6 text-red-500">Access denied. Coaches only.</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Player Workouts</h1>
                    <p className="mt-1 text-gray-500">
                        Select a workout to view its full stats and sessions.
                    </p>
                </div>

                <Link
                    href="/coach-dashboard"
                    className="text-amber-300 hover:text-amber-200 hover:underline"
                >
                    Back to Coach Dashboard
                </Link>
                <Link
                    href={`/workouts/create?player_id=${params.id}`}
                    className="rounded-md bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    Create New Workout ➕
                </Link>
            </div>

            {workouts.length === 0 ? (
                <EmptyState
                    title="No workouts assigned yet"
                    description="This player does not have any workouts assigned by you yet."
                />
            ) : (
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <Link
                            key={workout.id}
                            href={`/coach-dashboard/my_player/${params.id}/workout/${workout.id}`}
                            className="block rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-stone-100 shadow-sm transition-shadow hover:border-amber-500/40 hover:shadow-md"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{workout.name}</h2>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Created at: {new Date(workout.created_at).toLocaleString()}
                                    </p>
                                </div>

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

                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-sm text-gray-500">Sessions</p>
                                    <p className="font-semibold">
                                        {workout.num_of_sessions}/{workout.target_sessions}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Average</p>
                                    <p className="font-semibold">
                                        {workout.average_percentage.toFixed(1)}%
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Attempts</p>
                                    <p className="font-semibold">
                                        {workout.total_makes}/{workout.total_attempts}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

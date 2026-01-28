"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import Link from "next/link";

interface Workout {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    target_attempts: number;
    target_sessions: number;
    total_makes: number;
    goal_percentage: number;
    total_attempts: number;
    num_of_sessions: number;
    average_percentage: number;
    is_successful: boolean;
}

export default function WorkoutsPage() {
    const { user } = useAuth();

    const [inProgress, setInProgress] = useState<Workout[]>([]);
    const [completed, setCompleted] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchWorkouts = async () => {
            try {
                const [inProgressRes, completedRes] = await Promise.all([
                    api.get("workouts/?status=in_progress"),
                    api.get("workouts/?status=completed"),
                ]);

                setInProgress(inProgressRes.data);
                setCompleted(completedRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load workouts. Are you logged in?");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, [user]);

    if (!user) {
        return <p className="text-center mt-10">Please log in to view your workouts.</p>;
    }

    if (loading) {
        return <p className="text-center mt-10">Loading workouts...</p>;
    }

    const renderCompletedWorkouts = (workout: Workout) => (
        <Link
            key={workout.id}
            href={`/workouts/${workout.id}`}
            className="block border p-4 rounded hover:shadow-md transition-shadow"
        >
            <h3 className="text-lg  font-semibold">{workout.name}</h3>

            {workout.description && (
                <p className="text-gray-700">{workout.description}</p>
            )}


            <p className="text-gray-400 text-sm mt-1">
                Created at: {new Date(workout.created_at).toLocaleString()}
            </p>

            <p className="mt-2">
                Attempts: {workout.total_makes}/{workout.total_attempts}
            </p>

            <p className="mt-2">
                Goal percentage: {workout.goal_percentage}%
            </p>

            <p className="mt-2">
                Final percentage: {workout.average_percentage.toFixed(1)}%    
            </p>

            <p className="mt-2">
                Result - {workout.is_successful ? "Goal Achieved ✅" : "Goal Not Achieved ❌"}
            </p>
        </Link>
    );

    const renderInProgressWorkouts = (workout: Workout) => (
        <Link
            key={workout.id}
            href={`/workouts/${workout.id}`}
            className="block border p-4 rounded hover:shadow-md transition-shadow"
        >
            <h3 className="text-lg font-semibold">{workout.name}</h3>

            {workout.description && (
                <p className="text-gray-700">{workout.description}</p>
            )}

            <p className="text-gray-400 text-sm mt-1">
                Created at: {new Date(workout.created_at).toLocaleString()}
            </p>

            <p className="mt-2">
                Attempts: {workout.total_makes}/{workout.total_attempts}
            </p>

            <p>
                Goal percentage: {workout.goal_percentage}%
            </p>
            <p>
                Sessions: {workout.num_of_sessions}/{workout.target_sessions}
            </p>
            <p>
                Current percentage: {workout.average_percentage.toFixed(1)}%
            </p>
        </Link>
    );

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Workouts</h1>
                <Link
                    href="/workouts/create"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Add Workout
                </Link>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* In Progress */}
            <section>
                <h2 className="text-xl font-bold mb-4">🏃 Workouts in Progress</h2>

                {inProgress.length === 0 ? (
                    <p className="text-gray-500">No workouts in progress.</p>
                ) : (
                    <div className="space-y-4">
                        {inProgress.map(renderInProgressWorkouts)}
                    </div>
                )}
            </section>

            {/* Completed */}
            <section>
                <h2 className="text-xl font-bold mb-4">✅ Completed Workouts</h2>

                {completed.length === 0 ? (
                    <p className="text-gray-500">No completed workouts yet.</p>
                ) : (
                    <div className="space-y-4">
                        {completed.map(renderCompletedWorkouts)}
                    </div>
                )}
            </section>
        </div>
    );
}

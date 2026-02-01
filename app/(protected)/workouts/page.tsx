"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import Link from "next/link";
import { Workout } from "@/app/types";
import WorkoutsSkeleton from "@/app/Components/WorkoutSkeleton";
import EmptyState from "@/app/Components/EmptyState";

export default function WorkoutsPage() {
    const [inProgress, setInProgress] = useState<Workout[]>([]);
    const [completed, setCompleted] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
                setError("Failed to load workouts");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, []);

    if (loading) {
        return <WorkoutsSkeleton />;
    }

    if (error) {
        return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    if (!loading && inProgress.length === 0 && completed.length === 0) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-4">
                <EmptyState
                    title="No workouts yet 💪"
                    description="Start your first workout to track progress, sessions, and performance over time."
                    actionLabel="+ Create your first workout"
                    actionHref="/workouts/create"
                />
            </div>
        );
    }


    const renderCompletedWorkout = (workout: Workout) => (
        <Link
            key={workout.id}
            href={`/workouts/${workout.id}`}
            className="block border p-4 rounded hover:shadow-md transition-shadow"
        >
            <h3 className="text-lg font-semibold">{workout.name}</h3>

            <p className="text-gray-400 text-sm mt-1">
                Created at: {new Date(workout.created_at).toLocaleString()}
            </p>

            <p className="mt-2">
                Attempts: {workout.total_makes}/{workout.total_attempts}
            </p>

            <p className="mt-1">
                Goal: {workout.goal_percentage}%
            </p>

            <p className="mt-1">
                Final: {workout.average_percentage.toFixed(1)}%
            </p>

            <p className="mt-2 font-semibold">
                Result:{" "}
                {workout.is_successful ? (
                    <span className="text-green-600">Goal Achieved ✅</span>
                ) : (
                    <span className="text-red-500">Goal Not Achieved ❌</span>
                )}
            </p>
        </Link>
    );

    const renderInProgressWorkout = (workout: Workout) => (
        <Link
            key={workout.id}
            href={`/workouts/${workout.id}`}
            className="block border p-4 rounded hover:shadow-md transition-shadow"
        >
            <h3 className="text-lg font-semibold">{workout.name}</h3>

            <p className="text-gray-400 text-sm mt-1">
                Created at: {new Date(workout.created_at).toLocaleString()}
            </p>

            <p className="mt-2">
                Attempts: {workout.total_makes}/{workout.total_attempts}
            </p>

            <p className="mt-1">
                Sessions: {workout.num_of_sessions}/{workout.target_sessions}
            </p>

            <p className="mt-1">
                Current Avg: {workout.average_percentage.toFixed(1)}%
            </p>
        </Link>
    );

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Workouts</h1>
                <Link
                    href="/workouts/create"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Add Workout
                </Link>
            </div>

            {/* In Progress */}
            <section>
                <h2 className="text-xl font-bold mb-4">🏃 Workouts in Progress</h2>

                {inProgress.length === 0 ? (
                    <p className="text-gray-500">No workouts in progress.</p>
                ) : (
                    <div className="space-y-4">
                        {inProgress.map(renderInProgressWorkout)}
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
                        {completed.map(renderCompletedWorkout)}
                    </div>
                )}
            </section>
        </div>
    );
}

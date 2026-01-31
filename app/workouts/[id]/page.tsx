"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import ProgressBar from "@/app/Components/ProgressBar";
import { Workout } from "@/app/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function WorkoutDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ Fetch workout ONLY after auth is ready
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchWorkout = async () => {
            try {
                const res = await api.get(`workouts/${id}/`);
                setWorkout(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load workout");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [id, authLoading, user]);

    // ---- Loading / Error states ----
    if (authLoading || loading) {
        return <p className="p-6">Loading workout...</p>;
    }

    if (error || !workout) {
        return (
            <p className="p-6 text-red-500">
                {error || "Workout not found"}
            </p>
        );
    }

    // ---- Chart Data ----
    const chartData = workout.sessions.map((s) => ({
        date: new Date(s.date).toLocaleDateString(),
        "Success %": Number(s.success_rate.toFixed(1)),
        Goal: workout.goal_percentage,
    }));

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{workout.name}</h1>
                <button
                    onClick={() => router.push("/workouts")}
                    className="text-blue-500 hover:underline"
                >
                    ← Back
                </button>
            </div>

            {/* Workout Info */}
            <div className="grid grid-cols-2 gap-4 border p-4 rounded mb-6">
                <div>
                    <p className="text-gray-500">Target Attempts</p>
                    <p className="font-semibold">{workout.target_attempts}</p>
                </div>

                <div>
                    <p className="text-gray-500">Goal Percentage</p>
                    <p className="font-semibold">{workout.goal_percentage}%</p>
                </div>

                <div>
                    <p className="text-gray-500">Average Percentage</p>
                    <p className="font-semibold">
                        {workout.average_percentage?.toFixed(1) ?? 0}%
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">Status</p>
                    {workout.num_of_sessions >= workout.target_sessions ? (
                        <>
                            <p className="font-semibold text-green-600">
                                Workout completed ✅
                            </p>
                            {workout.is_successful ? (
                                <p className="font-semibold text-green-600">
                                    Goal Achieved ✅
                                </p>
                            ) : (
                                <p className="font-semibold text-red-500">
                                    Goal Not Achieved ❌
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="font-semibold text-orange-500">
                            In Progress 📈
                        </p>
                    )}
                </div>
            </div>

            {/* Sessions Progress */}
            <h2 className="text-2xl font-semibold mb-3">
                Sessions {workout.num_of_sessions}/{workout.target_sessions}
            </h2>

            <ProgressBar
                goal={workout.target_sessions}
                current={workout.num_of_sessions}
            />

            {workout.num_of_sessions < workout.target_sessions && (
                <Link
                    href={`/workouts/${workout.id}/add-session`}
                    className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add Session
                </Link>
            )}

            {/* Sessions List */}
            {workout.sessions.length === 0 ? (
                <p className="text-gray-500 mt-6">No sessions yet</p>
            ) : (
                <div className="space-y-6 mt-6">
                    {workout.sessions.map((session) => (
                        <div
                            key={session.id}
                            className="border p-4 rounded flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">
                                    {new Date(session.date).toLocaleDateString()}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {session.makes} / {session.attempts} shots
                                </p>
                            </div>
                            <div className="font-bold">
                                {session.success_rate.toFixed(1)}%
                            </div>
                        </div>
                    ))}

                    {/* Graph */}
                    <div className="mt-8 border p-4 rounded">
                        <h3 className="text-xl font-semibold mb-4">
                            Progress Graph
                        </h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="Success %"
                                    stroke="#3b82f6"
                                    dot={{ r: 5 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="Goal"
                                    stroke="#22c55e"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

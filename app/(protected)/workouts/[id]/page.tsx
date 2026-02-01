"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";
import ProgressBar from "@/app/Components/ProgressBar";
import WorkoutDetailsSkeleton from "@/app/Components/WorkoutDetailsSkeleton";
import EmptyState from "@/app/Components/EmptyState";
import ConfirmModal from "@/app/Components/ConfirmModal";
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

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);


    // ✅ Fetch immediately – auth is guaranteed by layout
    useEffect(() => {
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
    }, [id]);

    // ---- Loading / Error states ----
    if (loading) {
        return <WorkoutDetailsSkeleton />;
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

    const handleDeleteWorkout = async () => {
        setDeleting(true);

        try {
            await api.delete(`workouts/${workout.id}/`);
            router.push("/workouts");
        } catch (err) {
            console.error(err);
            alert("Failed to delete workout");
            setDeleting(false);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (!confirm("Delete this session?")) return;

        try {
            await api.delete(`sessions/${sessionId}/`);
            setWorkout((prev) =>
                prev
                    ? {
                        ...prev,
                        sessions: prev.sessions.filter(
                            (s) => s.id !== sessionId
                        ),
                        num_of_sessions: prev.num_of_sessions - 1,
                    }
                    : prev
            );
        } catch (err: any) {
            alert(
                err.response?.data?.detail ??
                "Failed to delete session"
            );
        }
    };



    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{workout.name}</h1>

                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/workouts")}
                        className="text-blue-500 hover:underline"
                    >
                        ← Back
                    </button>

                    {workout.num_of_sessions < workout.target_sessions && (
                        <Link
                            href={`/workouts/${workout.id}/edit`}
                            className="text-yellow-600 hover:underline"
                        >
                            Edit ✏️
                        </Link>
                    )}




                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-600 hover:underline"
                    >
                        Delete 🗑
                    </button>
                </div>
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



            {/* Sessions List */}
            {workout.sessions.length === 0 ? (
                <EmptyState
                    title="No sessions yet 🏀"
                    description="Log your first session to start tracking your performance and progress."
                    actionLabel="Add first session"
                    actionHref={`/workouts/${workout.id}/add-session`}
                />
            ) : (
                <div className="space-y-6 mt-6">
                    {workout.num_of_sessions < workout.target_sessions && (
                        <Link
                            href={`/workouts/${workout.id}/add-session`}
                            className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Add Session
                        </Link>
                    )}
                    {workout.sessions.map((session) => {
                        const canEdit = workout.num_of_sessions < workout.target_sessions;

                        return (
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

                                <div className="flex items-center gap-4">
                                    <span className="font-bold">
                                        {session.success_rate.toFixed(1)}%
                                    </span>

                                    {canEdit && (
                                        <>
                                            <Link
                                                href={`/workouts/${workout.id}/edit-session/${session.id}/`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </Link>                                         

                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}


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
            {showDeleteModal && (
                <ConfirmModal
                    title="Delete workout?"
                    message="This action cannot be undone. All sessions and progress will be permanently deleted."
                    confirmText="Yes, delete"
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteWorkout}
                    loading={deleting}
                />
            )}

        </div>
    );
}

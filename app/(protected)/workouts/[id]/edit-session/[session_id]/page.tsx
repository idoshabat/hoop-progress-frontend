"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { Session } from "@/app/types";



export default function EditSessionPage() {
    const { session_id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [session, setSession] = useState<Session | null>(null);
    const [makes, setMakes] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ---------- FETCH SESSION ---------- */
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchSession = async () => {
            try {
                const res = await api.get(`sessions/${session_id}/`);
                setSession(res.data);
                setMakes(res.data.makes);
                setAttempts(res.data.attempts);
            } catch (err) {
                console.error(err);
                setError("Failed to load session");
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [session_id, authLoading, user]);

    /* ---------- LOADING / ERROR ---------- */
    if (authLoading || loading) {
        return <p className="p-6">Loading session...</p>;
    }

    if (error || !session) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    /* ---------- BUSINESS RULE GUARD ---------- */
    const isWorkoutCompleted =
        session.workout.num_of_sessions >=
        session.workout.target_sessions;

    if (isWorkoutCompleted) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">
                    Session Locked 🔒
                </h1>
                <p className="text-gray-600 mb-6">
                    Sessions of a completed workout cannot be edited.
                </p>
                <button
                    onClick={() =>
                        router.push(`/workouts/${session.workout.id}`)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Back to Workout
                </button>
            </div>
        );
    }

    /* ---------- SUBMIT ---------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.patch(`sessions/${session_id}/`, {
                makes,
                attempts,
            });

            router.push(`/workouts/${session.workout}`);
        } catch (err: any) {
            alert(
                err.response?.data?.detail ??
                    "Failed to update session"
            );
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                Edit Session ✏️
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label className="block text-sm text-gray-600">
                        Makes
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={makes}
                        onChange={(e) =>
                            setMakes(Number(e.target.value))
                        }
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600">
                        Attempts
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={attempts}
                        onChange={(e) =>
                            setAttempts(Number(e.target.value))
                        }
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Save Changes
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                `/workouts/${session.workout.id}`
                            )
                        }
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

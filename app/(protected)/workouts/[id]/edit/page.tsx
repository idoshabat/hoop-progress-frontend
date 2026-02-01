"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Workout } from "@/app/types";
import { useAuth } from "@/app/Context/AuthContext";

export default function EditWorkoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        target_attempts: 0,
        target_sessions: 0,
        goal_percentage: 0,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ---------- FETCH WORKOUT ---------- */
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchWorkout = async () => {
            try {
                const res = await api.get(`workouts/${id}/`);
                setWorkout(res.data);
                setForm({
                    name: res.data.name,
                    description: res.data.description || "",
                    target_attempts: res.data.target_attempts,
                    target_sessions: res.data.target_sessions,
                    goal_percentage: res.data.goal_percentage,
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load workout");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [id, authLoading, user]);

    /* ---------- HANDLERS ---------- */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name.includes("target") || name === "goal_percentage"
                ? Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.patch(`workouts/${id}/`, form);
            router.push(`/workouts/${id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to update workout");
            setSaving(false);
        }
    };

    /* ---------- STATES ---------- */
    if (loading || authLoading) {
        return <p className="p-6">Loading workout...</p>;
    }

    if (error || !workout) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    if (
        workout &&
        workout.num_of_sessions >= workout.target_sessions
    ) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">
                    This workout is completed
                </h1>
                <p className="text-gray-600 mb-6">
                    Completed workouts cannot be edited.
                </p>
                <button
                    onClick={() => router.push(`/workouts/${workout.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Back to Workout
                </button>
            </div>
        );
    }


    /* ---------- UI ---------- */
    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Edit Workout ✏️</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Name
                    </label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Target Attempts */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Target Attempts
                    </label>
                    <input
                        type="number"
                        name="target_attempts"
                        value={form.target_attempts}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Target Sessions */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Target Sessions
                    </label>
                    <input
                        type="number"
                        name="target_sessions"
                        value={form.target_sessions}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Goal Percentage */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Goal Percentage
                    </label>
                    <input
                        type="number"
                        name="goal_percentage"
                        value={form.goal_percentage}
                        onChange={handleChange}
                        min={1}
                        max={100}
                        required
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="border px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";

type CreateWorkoutBody = {
    name: string;
    description: string;
    goal_percentage: string;
    target_attempts: string;
    target_sessions: string;
    player?: number;
};

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "detail" in error.response.data &&
        typeof error.response.data.detail === "string"
    ) {
        return error.response.data.detail;
    }

    return fallback;
}

export default function CreateWorkoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [goalPercentage, setGoalPercentage] = useState("");
    const [targetAttempts, setTargetAttempts] = useState("");
    const [targetSessions, setTargetSessions] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const playerIdParam = searchParams.get("player_id");
    const parsedPlayerId =
        playerIdParam && Number.isInteger(Number(playerIdParam))
            ? Number(playerIdParam)
            : null;
    const isCoachCreatingForPlayer = user?.role === "COACH";

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isCoachCreatingForPlayer && !parsedPlayerId) {
            setError("A coach must open this page for a specific player.");
            return;
        }

        const body: CreateWorkoutBody = {
            name,
            description,
            goal_percentage: goalPercentage,
            target_attempts: targetAttempts,
            target_sessions: targetSessions,
        };

        if (isCoachCreatingForPlayer && parsedPlayerId) {
            body.player = parsedPlayerId;
        }

        try {
            setSaving(true);
            await api.post("workouts/", body);
            setName("");
            setDescription("");
            setGoalPercentage("");
            setTargetAttempts("");
            setTargetSessions("");

            if (isCoachCreatingForPlayer && parsedPlayerId) {
                router.push(`/coach-dashboard/my_player/${parsedPlayerId}`);
            } else {
                router.push("/workouts");
            }
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Failed to create workout."));
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to create a workout.</p>;
    }

    return (
        <div className="mx-auto mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/30">
            <h1 className="mb-2 text-2xl">Create Workout</h1>
            <p className="mb-4 text-sm text-stone-400">
                {isCoachCreatingForPlayer
                    ? "This workout will be assigned to the selected player."
                    : "Create a workout for your own training plan."}
            </p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Workout Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    rows={4}
                />
                <input
                    type="number"
                    placeholder="Goal Percentage"
                    value={goalPercentage}
                    min={0}
                    max={100}
                    onChange={(e) => setGoalPercentage(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <input
                    type="number"
                    placeholder="Target Attempts"
                    value={targetAttempts}
                    onChange={(e) => setTargetAttempts(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <input
                    type="number"
                    placeholder="Target Sessions"
                    value={targetSessions}
                    onChange={(e) => setTargetSessions(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-amber-500 p-2 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                >
                    {saving ? "Creating..." : "Create"}
                </button>
            </form>

            {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
    );
}

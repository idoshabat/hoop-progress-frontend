"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";

export default function CreateWorkoutPage() {
    const router = useRouter();
    const { user } = useAuth(); // currently logged in user

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [goalPercentage, setGoalPercentage] = useState("");
    const [targetAttempts, setTargetAttempts] = useState("");
    const [targetSessions, setTargetSessions] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await api.post("workouts/", {
                name,
                description,
                goal_percentage: goalPercentage,
                target_attempts: targetAttempts,
                target_sessions: targetSessions,
            });
            setSuccess("Workout created successfully!");
            setName("");
            setDescription("");
            router.push("/workouts"); // redirect to workouts list
        } catch (err: any) {
            console.error(err);
            setError("Failed to create workout. Make sure you're logged in.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h1 className="text-2xl mb-4">Create Workout</h1>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Workout Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 rounded"
                    rows={4}
                />
                <input
                    type="number"
                    placeholder="Goal Percentage"
                    value={goalPercentage}
                    min={0}
                    max={100}
                    onChange={(e) => setGoalPercentage(e.target.value)}
                    className="border p-2"
                />
                <input
                    type="number"
                    placeholder="Target Attempts"
                    value={targetAttempts}
                    onChange={(e) => setTargetAttempts(e.target.value)}
                    className="border p-2"
                />
                <input
                    type="number"
                    placeholder="Target Sessions"
                    value={targetSessions}
                    onChange={(e) => setTargetSessions(e.target.value)}
                    className="border p-2"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Create
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { CoachProfile } from "@/app/types";

export default function MyCoachesPage() {
    const { user, loading: authLoading } = useAuth();
    const [coaches, setCoaches] = useState<CoachProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const loadCoaches = async () => {
            try {
                const playerRes = await api.get("me/");
                setCoaches(playerRes.data.coaches || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load coaches.");
            } finally {
                setLoading(false);
            }
        };

        loadCoaches();
    }, [authLoading, user]);

    if (authLoading || loading) {
        return <p className="p-6">Loading coaches...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to view your coaches.</p>;
    }

    if (user.role !== "PLAYER") {
        return <p className="p-6 text-red-500">Access denied. Players only.</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold">My Coaches</h1>
                    <p className="text-gray-500">
                        Your current coaches and the workouts they assigned to you.
                    </p>
                </div>

                <Link
                    href="/my-coaches/manage"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    Manage Coaches
                </Link>
            </div>

            <section>
                <h2 className="mb-4 text-2xl font-semibold">Current Coaches</h2>

                {coaches.length === 0 ? (
                    <p className="text-gray-500">No coaches assigned yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {coaches.map((coach) => (
                            <li
                                key={coach.id}
                                className="rounded-lg border border-gray-200 p-4"
                            >
                                <Link
                                    href={`/coach-profile/${coach.id}`}
                                    className="text-xl font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {coach.username}
                                </Link>
                                <p className="mt-1 text-gray-500">
                                    Date of birth: {coach.date_of_birth || "N/A"}
                                </p>
                                <Link
                                    href={`/my-coaches/${coach.id}`}
                                    className="mt-4 inline-block text-amber-300 hover:text-amber-200 hover:underline"
                                >
                                    View assigned workouts
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

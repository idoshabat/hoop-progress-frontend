"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";
import { PlayerProfile } from "@/app/types";

export default function CoachDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const loadPlayers = async () => {
            try {
                const coachRes = await api.get("me/");
                setPlayers(coachRes.data.players || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load players.");
            } finally {
                setLoading(false);
            }
        };

        loadPlayers();
    }, [authLoading, user]);

    if (authLoading || loading) {
        return <p className="p-6">Loading dashboard...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to view your dashboard.</p>;
    }

    if (user.role !== "COACH") {
        return <p className="p-6 text-red-500">Access denied. Coaches only.</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold">Coach Dashboard</h1>
                    <p className="text-gray-500">
                        Your current players and the workouts you assigned to them.
                    </p>
                </div>

                <Link
                    href="/coach-dashboard/manage"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    Manage Players
                </Link>
            </div>

            <PendingRequestsBanner />

            <section>
                <h2 className="mb-4 text-2xl font-semibold">My Players</h2>

                {players.length === 0 ? (
                    <p className="text-gray-500">No players assigned yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {players.map((player) => (
                            <li key={player.id} className="rounded-lg border border-gray-200 p-4">
                                <Link
                                    href={`/player-profile/${player.id}`}
                                    className="text-xl font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {player.username}
                                </Link>
                                <p className="mt-1 text-gray-500">
                                    Date of birth: {player.date_of_birth || "N/A"}
                                </p>
                                <p className="mt-1 text-gray-500">
                                    Position: {player.position}
                                </p>
                                <p className="mt-1 text-gray-500">
                                    Height: {player.height_cm ? `${player.height_cm} cm` : "N/A"}
                                </p>
                                <Link
                                    href={`/coach-dashboard/my_player/${player.id}`}
                                    className="mt-4 inline-block text-amber-300 hover:text-amber-200 hover:underline"
                                >
                                    View workouts
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

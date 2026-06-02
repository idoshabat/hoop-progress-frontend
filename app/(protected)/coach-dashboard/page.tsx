"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import EmptyState from "@/app/Components/EmptyState";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";
import { PlayerProfile } from "@/app/types";

export default function CoachDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const text = useMemo(
        () =>
            isHebrew
                ? {
                      failedLoad: "טעינת השחקנים נכשלה.",
                      loading: "טוען לוח מאמן...",
                      loginRequired: "יש להתחבר כדי לצפות בלוח המאמן שלך.",
                      accessDenied: "אין גישה. למאמנים בלבד.",
                      title: "לוח מאמן",
                      subtitle: "השחקנים הנוכחיים שלך והאימונים שהקצית להם.",
                      managePlayers: "ניהול שחקנים",
                      myPlayers: "השחקנים שלי",
                      emptyEyebrow: "אזור המאמן",
                      emptyTitle: "עדיין אין שחקנים מחוברים",
                      emptyDescription:
                          "הלוח שלך מוכן. ברגע ששחקנים יתחברו אליך, הם יופיעו כאן עם גישה מהירה לאימונים, לפרופילים ולהתקדמות שלהם.",
                      dateOfBirth: "תאריך לידה",
                      position: "עמדה",
                      height: "גובה",
                      viewWorkouts: "צפה באימונים",
                      notAvailable: "לא זמין",
                  }
                : {
                      failedLoad: "Failed to load players.",
                      loading: "Loading dashboard...",
                      loginRequired: "Please log in to view your dashboard.",
                      accessDenied: "Access denied. Coaches only.",
                      title: "Coach Dashboard",
                      subtitle: "Your current players and the workouts you assigned to them.",
                      managePlayers: "Manage Players",
                      myPlayers: "My Players",
                      emptyEyebrow: "Coach Space",
                      emptyTitle: "No players assigned yet",
                      emptyDescription:
                          "Your dashboard is ready. Once players connect with you, they will show up here with quick access to their workouts, profiles, and progress.",
                      dateOfBirth: "Date of birth",
                      position: "Position",
                      height: "Height",
                      viewWorkouts: "View workouts",
                      notAvailable: "N/A",
                  },
        [isHebrew]
    );

    const loadPlayers = useCallback(async () => {
        try {
            const coachRes = await api.get("me/");
            setPlayers(coachRes.data.players || []);
        } catch (err) {
            console.error(err);
            setError(text.failedLoad);
        } finally {
            setLoading(false);
        }
    }, [text.failedLoad]);

    useEffect(() => {
        if (authLoading || !user) return;
        void loadPlayers();
    }, [authLoading, user, loadPlayers]);

    if (authLoading || loading) {
        return <p className="p-6">{text.loading}</p>;
    }

    if (!user) {
        return <p className="p-6">{text.loginRequired}</p>;
    }

    if (user.role !== "COACH") {
        return <p className="p-6 text-red-500">{text.accessDenied}</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold">{text.title}</h1>
                    <p className="text-gray-500">
                        {text.subtitle}
                    </p>
                </div>

                <Link
                    href="/coach-dashboard/manage"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    {text.managePlayers}
                </Link>
            </div>

            <PendingRequestsBanner />

            <section>
                <h2 className="mb-4 text-2xl font-semibold">{text.myPlayers}</h2>

                {players.length === 0 ? (
                    <EmptyState
                        eyebrow={text.emptyEyebrow}
                        icon="👥"
                        title={text.emptyTitle}
                        description={text.emptyDescription}
                        actionLabel={text.managePlayers}
                        actionHref="/coach-dashboard/manage"
                    />
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
                                    {text.dateOfBirth}: {player.date_of_birth || text.notAvailable}
                                </p>
                                <p className="mt-1 text-gray-500">
                                    {text.position}: {player.position}
                                </p>
                                <p className="mt-1 text-gray-500">
                                    {text.height}: {player.height_cm ? `${player.height_cm} cm` : text.notAvailable}
                                </p>
                                <Link
                                    href={`/coach-dashboard/my_player/${player.id}`}
                                    className="mt-4 inline-block text-amber-300 hover:text-amber-200 hover:underline"
                                >
                                    {text.viewWorkouts}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

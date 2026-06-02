"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";
import { CoachProfile } from "@/app/types";

export default function MyCoachesPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const [coaches, setCoaches] = useState<CoachProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const text = isHebrew
        ? {
              failed: "טעינת המאמנים נכשלה.",
              loading: "טוען מאמנים...",
              loginRequired: "יש להתחבר כדי לצפות במאמנים שלך.",
              accessDenied: "אין גישה. לשחקנים בלבד.",
              title: "המאמנים שלי",
              subtitle: "המאמנים הנוכחיים שלך והאימונים שהם הקצו לך.",
              manage: "ניהול מאמנים",
              current: "מאמנים נוכחיים",
              empty: "עדיין לא הוקצו מאמנים.",
              dob: "תאריך לידה",
              unavailable: "לא זמין",
              viewWorkouts: "צפה באימונים שהוקצו",
          }
        : {
              failed: "Failed to load coaches.",
              loading: "Loading coaches...",
              loginRequired: "Please log in to view your coaches.",
              accessDenied: "Access denied. Players only.",
              title: "My Coaches",
              subtitle: "Your current coaches and the workouts they assigned to you.",
              manage: "Manage Coaches",
              current: "Current Coaches",
              empty: "No coaches assigned yet.",
              dob: "Date of birth",
              unavailable: "N/A",
              viewWorkouts: "View assigned workouts",
          };

    const loadCoaches = useCallback(async () => {
        try {
            const playerRes = await api.get("me/");
            setCoaches(playerRes.data.coaches || []);
        } catch (err) {
            console.error(err);
            setError(isHebrew ? "טעינת המאמנים נכשלה." : "Failed to load coaches.");
        } finally {
            setLoading(false);
        }
    }, [isHebrew]);

    useEffect(() => {
        if (authLoading || !user) return;
        void loadCoaches();
    }, [authLoading, user, loadCoaches]);

    if (authLoading || loading) {
        return <p className="p-6">{text.loading}</p>;
    }

    if (!user) {
        return <p className="p-6">{text.loginRequired}</p>;
    }

    if (user.role !== "PLAYER") {
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
                    href="/my-coaches/manage"
                    className="rounded bg-amber-500 px-4 py-2 text-zinc-950 hover:bg-amber-400"
                >
                    {text.manage}
                </Link>
            </div>

            <PendingRequestsBanner />

            <section>
                <h2 className="mb-4 text-2xl font-semibold">{text.current}</h2>

                {coaches.length === 0 ? (
                    <p className="text-gray-500">{text.empty}</p>
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
                                    {text.dob}: {coach.date_of_birth || text.unavailable}
                                </p>
                                <Link
                                    href={`/my-coaches/${coach.id}`}
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

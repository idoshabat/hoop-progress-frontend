"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import EmptyState from "@/app/Components/EmptyState";
import PageHero from "@/app/Components/PageHero";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";
import SearchToolbar from "@/app/Components/SearchToolbar";
import SectionSurface from "@/app/Components/SectionSurface";
import StatCard from "@/app/Components/StatCard";
import { CoachProfile } from "@/app/types";

export default function MyCoachesPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const [coaches, setCoaches] = useState<CoachProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const text = isHebrew
        ? {
              failed: "טעינת המאמנים נכשלה.",
              loading: "טוען מאמנים...",
              loginRequired: "יש להתחבר כדי לצפות במאמנים שלך.",
              accessDenied: "אין גישה. לשחקנים בלבד.",
              title: "המאמנים שלי",
              subtitle: "המאמנים הנוכחיים שלך והאימונים שהם הקצו לך.",
              heroEyebrow: "רשת התמיכה שלך",
              manage: "ניהול מאמנים",
              current: "מאמנים נוכחיים",
              currentDescription: "גישה מהירה לכל מאמן, לפרופיל שלו ולאימונים שהוא הקצה לך.",
              emptyEyebrow: "אזור המאמנים",
              emptyTitle: "עדיין אין מאמנים מחוברים",
              emptyDescription:
                  "ברגע שמאמנים יתחברו אליך, תראה כאן את כל הקשרים הפעילים שלך ואת הגישה המהירה לאימונים שהוקצו.",
              dob: "תאריך לידה",
              unavailable: "לא זמין",
              viewWorkouts: "צפה באימונים שהוקצו",
              totalCoaches: "מאמנים מחוברים",
              completeProfiles: "פרופילים מלאים",
              birthdaysKnown: "תאריכי לידה זמינים",
              searchPlaceholder: "חפש מאמן לפי שם או תאריך לידה",
              badge: "Coaches",
          }
        : {
              failed: "Failed to load coaches.",
              loading: "Loading coaches...",
              loginRequired: "Please log in to view your coaches.",
              accessDenied: "Access denied. Players only.",
              title: "My Coaches",
              subtitle: "Your current coaches and the workouts they assigned to you.",
              heroEyebrow: "Your Support Network",
              manage: "Manage Coaches",
              current: "Current Coaches",
              currentDescription: "Fast access to every coach, their profile, and the workouts they assigned to you.",
              emptyEyebrow: "Coach Space",
              emptyTitle: "No coaches connected yet",
              emptyDescription:
                  "Once coaches connect with you, you'll see your active network here together with quick access to assigned workouts.",
              dob: "Date of birth",
              unavailable: "N/A",
              viewWorkouts: "View assigned workouts",
              totalCoaches: "Connected Coaches",
              completeProfiles: "Completed Profiles",
              birthdaysKnown: "Birthdays Known",
              searchPlaceholder: "Search coaches by name or birth date",
              badge: "Coaches",
          };

    const completeProfiles = useMemo(
        () => coaches.filter((coach) => Boolean(coach.date_of_birth)).length,
        [coaches]
    );
    const filteredCoaches = useMemo(
        () =>
            coaches.filter((coach) =>
                `${coach.username} ${coach.date_of_birth ?? ""}`
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
            ),
        [coaches, searchQuery]
    );

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
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <PageHero
                eyebrow={text.heroEyebrow}
                title={text.title}
                description={text.subtitle}
                badge={text.badge}
                action={
                    <Link
                        href="/my-coaches/manage"
                        className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                    >
                        {text.manage}
                    </Link>
                }
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label={text.totalCoaches} value={coaches.length} />
                    <StatCard label={text.completeProfiles} value={completeProfiles} accent />
                    <StatCard label={text.birthdaysKnown} value={completeProfiles} />
                </div>
            </PageHero>

            <PendingRequestsBanner />

            <SectionSurface
                title={text.current}
                description={text.currentDescription}
                action={
                    coaches.length > 0 ? (
                        <Link
                            href="/my-coaches/manage"
                            className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-stone-300 transition hover:text-stone-100"
                        >
                            {text.manage}
                        </Link>
                    ) : null
                }
            >
                <div className="space-y-5">
                <SearchToolbar
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    placeholder={text.searchPlaceholder}
                />
                {filteredCoaches.length === 0 ? (
                    <EmptyState
                        eyebrow={text.emptyEyebrow}
                        icon="🧑‍🏫"
                        title={text.emptyTitle}
                        description={text.emptyDescription}
                        actionLabel={text.manage}
                        actionHref="/my-coaches/manage"
                    />
                ) : (
                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredCoaches.map((coach) => (
                            <li
                                key={coach.id}
                                className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <Link
                                            href={`/coach-profile/${coach.id}`}
                                            className="text-xl font-bold text-stone-100 hover:text-amber-300"
                                        >
                                            {coach.username}
                                        </Link>
                                        <p className="mt-2 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                            {text.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dob}</p>
                                    <p className="mt-2 font-medium text-stone-200">
                                        {coach.date_of_birth || text.unavailable}
                                    </p>
                                </div>

                                <Link
                                    href={`/my-coaches/${coach.id}`}
                                    className="mt-5 inline-flex items-center rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                                >
                                    {text.viewWorkouts}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                </div>
            </SectionSurface>
        </div>
    );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import EmptyState from "@/app/Components/EmptyState";
import PageHero from "@/app/Components/PageHero";
import PendingRequestsBanner from "@/app/Components/PendingRequestsBanner";
import SectionSurface from "@/app/Components/SectionSurface";
import StatCard from "@/app/Components/StatCard";
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
                      heroEyebrow: "אזור ניהול",
                      managePlayers: "ניהול שחקנים",
                      myPlayers: "השחקנים שלי",
                      playerLibraryDescription: "גישה מהירה לכל שחקן, פרופיל והאימונים שהוקצו לו.",
                      emptyEyebrow: "אזור המאמן",
                      emptyTitle: "עדיין אין שחקנים מחוברים",
                      emptyDescription:
                          "הלוח שלך מוכן. ברגע ששחקנים יתחברו אליך, הם יופיעו כאן עם גישה מהירה לאימונים, לפרופילים ולהתקדמות שלהם.",
                      dateOfBirth: "תאריך לידה",
                      position: "עמדה",
                      height: "גובה",
                      viewWorkouts: "צפה באימונים",
                      notAvailable: "לא זמין",
                      totalPlayers: "שחקנים פעילים",
                      positionsCovered: "עמדות פעילות",
                      completedProfiles: "פרופילים מלאים",
                      heightLabel: "גובה נרשם",
                      badge: "Coach",
                  }
                : {
                      failedLoad: "Failed to load players.",
                      loading: "Loading dashboard...",
                      loginRequired: "Please log in to view your dashboard.",
                      accessDenied: "Access denied. Coaches only.",
                      title: "Coach Dashboard",
                      subtitle: "Your current players and the workouts you assigned to them.",
                      heroEyebrow: "Management Space",
                      managePlayers: "Manage Players",
                      myPlayers: "My Players",
                      playerLibraryDescription: "Fast access to every player, their profile, and the workouts assigned to them.",
                      emptyEyebrow: "Coach Space",
                      emptyTitle: "No players assigned yet",
                      emptyDescription:
                          "Your dashboard is ready. Once players connect with you, they will show up here with quick access to their workouts, profiles, and progress.",
                      dateOfBirth: "Date of birth",
                      position: "Position",
                      height: "Height",
                      viewWorkouts: "View workouts",
                      notAvailable: "N/A",
                      totalPlayers: "Active Players",
                      positionsCovered: "Positions Covered",
                      completedProfiles: "Completed Profiles",
                      heightLabel: "Height Logged",
                      badge: "Coach",
                  },
        [isHebrew]
    );

    const positionCoverage = useMemo(
        () => new Set(players.map((player) => player.position)).size,
        [players]
    );

    const completeProfiles = useMemo(
        () =>
            players.filter(
                (player) => Boolean(player.date_of_birth) && Boolean(player.height_cm)
            ).length,
        [players]
    );

    const heightLogged = useMemo(
        () => players.filter((player) => Boolean(player.height_cm)).length,
        [players]
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
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <PageHero
                eyebrow={text.heroEyebrow}
                title={text.title}
                description={text.subtitle}
                badge={text.badge}
                action={
                    <Link
                        href="/coach-dashboard/manage"
                        className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                    >
                        {text.managePlayers}
                    </Link>
                }
            >
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label={text.totalPlayers} value={players.length} />
                    <StatCard label={text.positionsCovered} value={positionCoverage} accent />
                    <StatCard label={text.completedProfiles} value={completeProfiles} />
                    <StatCard label={text.heightLabel} value={heightLogged} />
                </div>
            </PageHero>

            <PendingRequestsBanner />

            <SectionSurface
                title={text.myPlayers}
                description={text.playerLibraryDescription}
                action={
                    players.length > 0 ? (
                        <Link
                            href="/coach-dashboard/manage"
                            className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-stone-300 transition hover:text-stone-100"
                        >
                            {text.managePlayers}
                        </Link>
                    ) : null
                }
            >
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
                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <Link
                                            href={`/player-profile/${player.id}`}
                                            className="text-xl font-bold text-stone-100 hover:text-amber-300"
                                        >
                                            {player.username}
                                        </Link>
                                        <p className="mt-2 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                            {player.position}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 text-sm text-stone-300">
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dateOfBirth}</p>
                                        <p className="mt-2 font-medium">{player.date_of_birth || text.notAvailable}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.position}</p>
                                            <p className="mt-2 font-medium">{player.position}</p>
                                        </div>
                                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.height}</p>
                                            <p className="mt-2 font-medium">
                                                {player.height_cm ? `${player.height_cm} cm` : text.notAvailable}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/coach-dashboard/my_player/${player.id}`}
                                    className="mt-5 inline-flex items-center rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                                >
                                    {text.viewWorkouts}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionSurface>
        </div>
    );
}

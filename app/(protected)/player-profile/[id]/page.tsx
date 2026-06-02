"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import { PlayerProfile } from "@/app/types";

export default function PublicPlayerProfilePage() {
    const params = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [position, setPosition] = useState("");
    const [height, setHeight] = useState<number | "">("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const text = isHebrew
        ? {
              failedLoad: "טעינת הפרופיל נכשלה.",
              updatedTitle: "הפרופיל עודכן",
              updatedMessage: "פרופיל השחקן שלך עודכן בהצלחה.",
              failedUpdate: "עדכון הפרופיל נכשל.",
              loading: "טוען פרופיל...",
              notFound: "הפרופיל לא נמצא.",
              profileLabel: "פרופיל שחקן",
              cancelEditing: "בטל עריכה",
              editProfile: "ערוך פרופיל",
              position: "עמדה",
              height: "גובה",
              connectedCoaches: "מאמנים מחוברים",
              notAvailable: "לא זמין",
              editDetails: "עריכת פרטים",
              profileDetails: "פרטי פרופיל",
              back: "חזרה",
              dateOfBirth: "תאריך לידה",
              heightCm: "גובה (ס\"מ)",
              saveChanges: "שמור שינויים",
              username: "שם משתמש",
              pg: "רכז",
              sg: "קלע",
              sf: "סמול פורוורד",
              pf: "פאוור פורוורד",
              c: "סנטר",
            }
        : {
              failedLoad: "Failed to load profile.",
              updatedTitle: "Profile Updated",
              updatedMessage: "Your player profile was updated successfully.",
              failedUpdate: "Failed to update profile.",
              loading: "Loading profile...",
              notFound: "Profile not found.",
              profileLabel: "Player Profile",
              cancelEditing: "Cancel editing",
              editProfile: "Edit profile",
              position: "Position",
              height: "Height",
              connectedCoaches: "Connected Coaches",
              notAvailable: "N/A",
              editDetails: "Edit Details",
              profileDetails: "Profile Details",
              back: "Back",
              dateOfBirth: "Date of Birth",
              heightCm: "Height (cm)",
              saveChanges: "Save Changes",
              username: "Username",
              pg: "Point Guard",
              sg: "Shooting Guard",
              sf: "Small Forward",
              pf: "Power Forward",
              c: "Center",
            };

    const loadProfile = useCallback(async () => {
        try {
            const res = await api.get(`players-profiles/${params.id}/`);
            setProfile(res.data);
            setPosition(res.data.position);
            setHeight(res.data.height_cm ?? "");
            setDateOfBirth(res.data.date_of_birth ?? "");
        } catch (err) {
            console.error(err);
            setError(text.failedLoad);
        } finally {
            setLoading(false);
        }
    }, [params.id, text.failedLoad]);

    useEffect(() => {
        if (authLoading || !user) return;
        void loadProfile();
    }, [authLoading, user, loadProfile]);

    const isOwner = !!profile && user?.role === "PLAYER" && user.username === profile.username;

    const handleSave = async () => {
        if (!profile || !isOwner) return;

        try {
            await api.patch(`players-profiles/${profile.id}/`, {
                position,
                height_cm: height,
                date_of_birth: dateOfBirth || null,
            });

            setProfile({
                ...profile,
                position: position as PlayerProfile["position"],
                height_cm: height === "" ? undefined : height,
                date_of_birth: dateOfBirth || null,
            });
            showSuccess({
                title: text.updatedTitle,
                message: text.updatedMessage,
            });
            setError("");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError(text.failedUpdate);
        }
    };

    if (authLoading || loading) return <p className="p-6">{text.loading}</p>;
    if (error || !profile) return <p className="p-6 text-red-500">{error || text.notFound}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                        {text.profileLabel}
                    </p>
                    <h1 className="mt-3 text-4xl font-black text-stone-100">{profile.username}</h1>
                </div>

                {isOwner && (
                    <button
                        type="button"
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                    >
                        {isEditing ? text.cancelEditing : text.editProfile}
                    </button>
                )}
            </div>
            <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl shadow-black/30">
                <div className="grid gap-4 px-8 py-8 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.position}</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">{profile.position}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.height}</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">
                            {profile.height_cm ? `${profile.height_cm} cm` : text.notAvailable}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.connectedCoaches}</p>
                        <p className="mt-2 text-2xl font-bold text-amber-300">
                            {profile.coaches.length}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-stone-100">
                        {isEditing ? text.editDetails : text.profileDetails}
                    </h2>
                    <Link href="/" className="text-amber-300 hover:text-amber-200 hover:underline">
                        {text.back}
                    </Link>
                </div>

                {isEditing ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-400">
                                {text.dateOfBirth}
                            </label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-400">
                                {text.position}
                            </label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                            >
                                <option value="PG">{text.pg}</option>
                                <option value="SG">{text.sg}</option>
                                <option value="SF">{text.sf}</option>
                                <option value="PF">{text.pf}</option>
                                <option value="C">{text.c}</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-400">
                                {text.heightCm}
                            </label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) =>
                                    setHeight(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                            >
                                {text.saveChanges}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                            <p className="text-sm text-stone-500">{text.username}</p>
                            <p className="mt-2 text-lg font-semibold text-stone-100">
                                {profile.username}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                            <p className="text-sm text-stone-500">{text.dateOfBirth}</p>
                            <p className="mt-2 text-lg font-semibold text-stone-100">
                                {profile.date_of_birth || text.notAvailable}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { PlayerProfile } from "@/app/types";

export default function PlayerProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [position, setPosition] = useState("");
    const [height, setHeight] = useState<number | "">("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProfile = async () => {
            try {
                if (user.role !== "PLAYER") {
                    setError("Only players can view this page.");
                    return;
                }

                const res = await api.get("players-profiles/me/");
                setProfile(res.data);
                setPosition(res.data.position);
                setHeight(res.data.height_cm ?? "");
                setDateOfBirth(res.data.date_of_birth ?? "");
            } catch (err) {
                console.error(err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authLoading, user]);

    const handleSave = async () => {
        if (!profile) return;

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
            setSuccess("Profile updated successfully.");
            setError("");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError("Failed to update profile.");
            setSuccess("");
        }
    };

    if (authLoading || loading) return <p className="p-6">Loading profile...</p>;
    if (error || !profile) return <p className="p-6 text-red-500">{error || "Profile not found."}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl shadow-black/30">
                <div className="border-b border-zinc-800 bg-amber-500/10 px-8 py-10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                                Player Profile
                            </p>
                            <h1 className="mt-3 text-4xl font-black text-stone-100">
                                {profile.username}
                            </h1>
                            <p className="mt-3 max-w-2xl text-stone-400">
                                Your identity on HoopProgress. Keep your profile sharp so coaches
                                and training partners can understand your game at a glance.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsEditing((prev) => !prev)}
                            className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                        >
                            {isEditing ? "Cancel editing" : "Edit profile"}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 px-8 py-8 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">Position</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">{profile.position}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">Height</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">
                            {profile.height_cm ? `${profile.height_cm} cm` : "N/A"}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">Connected Coaches</p>
                        <p className="mt-2 text-2xl font-bold text-amber-300">
                            {profile.coaches.length}
                        </p>
                    </div>
                </div>
            </section>

            {success && <p className="text-emerald-400">{success}</p>}

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8">
                <h2 className="text-2xl font-semibold text-stone-100">
                    {isEditing ? "Edit Details" : "Profile Details"}
                </h2>

                {isEditing ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-400">
                                Date of Birth
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
                                Position
                            </label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                            >
                                <option value="PG">Point Guard</option>
                                <option value="SG">Shooting Guard</option>
                                <option value="SF">Small Forward</option>
                                <option value="PF">Power Forward</option>
                                <option value="C">Center</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-400">
                                Height (cm)
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
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                            <p className="text-sm text-stone-500">Username</p>
                            <p className="mt-2 text-lg font-semibold text-stone-100">
                                {profile.username}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                            <p className="text-sm text-stone-500">Date of Birth</p>
                            <p className="mt-2 text-lg font-semibold text-stone-100">
                                {profile.date_of_birth || "N/A"}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

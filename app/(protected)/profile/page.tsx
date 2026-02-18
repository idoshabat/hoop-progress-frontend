"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { PlayerProfile } from "@/app/types";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();

    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [position, setPosition] = useState("");
    const [height, setHeight] = useState<number | "">("");

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProfile = async () => {
            try {
                const res = await api.get("profiles/me/"); // you need this endpoint
                setProfile(res.data);
                setPosition(res.data.position);
                setHeight(res.data.height_cm ?? "");
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authLoading, user]);

    const handleUpdate = async () => {
        if (!profile) return;

        try {
            await api.patch(`profiles/${profile.id}/`, {
                position,
                height_cm: height,
            });
            setSuccess("Profile updated successfully!");
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to update profile");
            setSuccess("");
        }
    };

    if (authLoading || loading) return <p className="p-6">Loading profile...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            {success && <p className="text-green-500">{success}</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Username</label>
                    <input
                        type="text"
                        value={user?.username}
                        disabled
                        className="w-full border p-2 rounded bg-gray-700 text-white cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Position</label>
                    <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full border p-2 rounded bg-gray-800 text-white"
                    >
                        <option value="PG">Point Guard</option>
                        <option value="SG">Shooting Guard</option>
                        <option value="SF">Small Forward</option>
                        <option value="PF">Power Forward</option>
                        <option value="C">Center</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Height (cm)</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full border p-2 rounded bg-gray-800 text-white"
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

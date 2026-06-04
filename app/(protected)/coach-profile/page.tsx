"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import {
    uploadProfileImageToCloudinary,
    validateProfileImageFile,
} from "@/app/lib/cloudinary";
import { CoachProfile } from "@/app/types";

export default function CoachProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [profile, setProfile] = useState<CoachProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false);
    const [saving, setSaving] = useState(false);

    const text = useMemo(
        () =>
            isHebrew
                ? {
              onlyCoaches: "רק מאמנים יכולים לצפות בעמוד הזה.",
              failedLoad: "טעינת הפרופיל נכשלה.",
              updatedTitle: "הפרופיל עודכן",
              updatedMessage: "פרופיל המאמן שלך עודכן בהצלחה.",
              failedUpdate: "עדכון הפרופיל נכשל.",
              loading: "טוען פרופיל...",
              notFound: "הפרופיל לא נמצא.",
              profileLabel: "פרופיל מאמן",
              intro: "הזהות הציבורית שלך כמאמן. תן לשחקנים לראות מי עומד מאחורי התוכנית ושמור על הפרופיל שלך מוכן לחיבורים חדשים.",
              cancelEditing: "בטל עריכה",
              editProfile: "ערוך פרופיל",
              role: "תפקיד",
              coach: "מאמן",
              playersConnected: "שחקנים מחוברים",
              dateOfBirth: "תאריך לידה",
              notAvailable: "לא זמין",
              editDetails: "עריכת פרטים",
              profileDetails: "פרטי פרופיל",
              saveChanges: "שמור שינויים",
              savingChanges: "שומר...",
              username: "שם משתמש",
              profilePhoto: "תמונת פרופיל",
              profilePhotoHint: "JPG או PNG עד 10MB.",
              removePhoto: "הסר תמונת פרופיל",
            }
        : {
              onlyCoaches: "Only coaches can view this page.",
              failedLoad: "Failed to load profile.",
              updatedTitle: "Profile Updated",
              updatedMessage: "Your coach profile was updated successfully.",
              failedUpdate: "Failed to update profile.",
              loading: "Loading profile...",
              notFound: "Profile not found.",
              profileLabel: "Coach Profile",
              intro: "Your public coaching identity. Let players see who is behind the plan and keep your profile ready for new connections.",
              cancelEditing: "Cancel editing",
              editProfile: "Edit profile",
              role: "Role",
              coach: "Coach",
              playersConnected: "Players Connected",
              dateOfBirth: "Date of Birth",
              notAvailable: "N/A",
              editDetails: "Edit Details",
              profileDetails: "Profile Details",
              saveChanges: "Save Changes",
              savingChanges: "Saving...",
              username: "Username",
              profilePhoto: "Profile Photo",
              profilePhotoHint: "JPG or PNG up to 10MB.",
              removePhoto: "Remove Profile Photo",
            },
        [isHebrew]
    );

    const loadProfile = useCallback(async () => {
        try {
            if (!user) return;
            if (user.role !== "COACH") {
                setError(text.onlyCoaches);
                return;
            }

            const res = await api.get("coaches-profiles/me/");
            setProfile(res.data);
            setDateOfBirth(res.data.date_of_birth ?? "");
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
            setRemoveProfilePhoto(false);
        } catch (err) {
            console.error(err);
            setError(text.failedLoad);
        } finally {
            setLoading(false);
        }
    }, [text, user]);

    useEffect(() => {
        if (authLoading || !user) return;
        void loadProfile();
    }, [authLoading, user, loadProfile]);

    const handleProfilePhotoChange = (file: File | null) => {
        if (!file) return;

        try {
            validateProfileImageFile(file);
            setProfilePhotoFile(file);
            setProfilePhotoPreview(URL.createObjectURL(file));
            setRemoveProfilePhoto(false);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : text.failedUpdate);
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            let profilePhotoUrl = profile.profile_photo_url ?? null;
            let profilePhotoPublicId = profile.profile_photo_public_id ?? null;

            if (removeProfilePhoto) {
                profilePhotoUrl = null;
                profilePhotoPublicId = null;
            } else if (profilePhotoFile) {
                const uploadedImage = await uploadProfileImageToCloudinary(profilePhotoFile);
                profilePhotoUrl = uploadedImage.secureUrl;
                profilePhotoPublicId = uploadedImage.publicId;
            }

            await api.patch(`coaches-profiles/${profile.id}/`, {
                date_of_birth: dateOfBirth || null,
                profile_photo_url: profilePhotoUrl,
                profile_photo_public_id: profilePhotoPublicId,
            });

            setProfile({
                ...profile,
                date_of_birth: dateOfBirth || null,
                profile_photo_url: profilePhotoUrl,
                profile_photo_public_id: profilePhotoPublicId,
            });
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
            setRemoveProfilePhoto(false);
            showSuccess({
                title: text.updatedTitle,
                message: text.updatedMessage,
            });
            setError("");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : text.failedUpdate);
        } finally {
            setSaving(false);
        }
    };

    const displayedPhoto =
        profilePhotoPreview || (removeProfilePhoto ? null : profile?.profile_photo_url) || null;

    if (authLoading || loading) return <p className="p-6">{text.loading}</p>;
    if (error || !profile) return <p className="p-6 text-red-500">{error || text.notFound}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <section className="overflow-hidden rounded-4xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 shadow-2xl shadow-black/30">
                <div className="border-b border-zinc-800 bg-amber-500/10 px-8 py-10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-col items-center gap-6 sm:flex-row sm:items-center">
                            <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-900 text-5xl font-black text-amber-200 shadow-[0_18px_40px_rgba(0,0,0,0.26)] md:h-48 md:w-48">
                                {displayedPhoto ? (
                                    <img
                                        src={displayedPhoto}
                                        alt={profile.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    profile.username.slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                                <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                                    {text.profileLabel}
                                </p>
                                <h1 className="mt-3 text-4xl font-black text-stone-100">
                                    {profile.username}
                                </h1>
                                <p className="mt-3 max-w-2xl text-stone-400">
                                    {text.intro}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsEditing((prev) => !prev)}
                            className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                        >
                            {isEditing ? text.cancelEditing : text.editProfile}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 px-8 py-8 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.role}</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">{text.coach}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.playersConnected}</p>
                        <p className="mt-2 text-2xl font-bold text-amber-300">
                            {profile.players.length}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                        <p className="text-sm text-stone-500">{text.dateOfBirth}</p>
                        <p className="mt-2 text-2xl font-bold text-stone-100">
                            {profile.date_of_birth || text.notAvailable}
                        </p>
                    </div>
                </div>
            </section>
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8">
                <h2 className="text-2xl font-semibold text-stone-100">
                    {isEditing ? text.editDetails : text.profileDetails}
                </h2>

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
                                {text.profilePhoto}
                            </label>
                            <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-900 text-3xl font-black text-amber-200 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                                {displayedPhoto ? (
                                    <img
                                        src={displayedPhoto}
                                        alt={profile.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    profile.username.slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => handleProfilePhotoChange(e.target.files?.[0] ?? null)}
                                className="w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-3 text-sm text-stone-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-semibold file:text-zinc-950"
                            />
                            <p className="mt-2 text-sm text-stone-500">{text.profilePhotoHint}</p>
                            {profilePhotoPreview ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfilePhotoFile(null);
                                        setProfilePhotoPreview(null);
                                        setRemoveProfilePhoto(false);
                                    }}
                                    className="mt-3 text-sm font-medium text-amber-300 hover:text-amber-200"
                                >
                                    {text.removePhoto}
                                </button>
                            ) : null}
                            {!profilePhotoPreview && profile.profile_photo_url && !removeProfilePhoto ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfilePhotoFile(null);
                                        setProfilePhotoPreview(null);
                                        setRemoveProfilePhoto(true);
                                    }}
                                    className="mt-3 text-sm font-medium text-amber-300 hover:text-amber-200"
                                >
                                    {text.removePhoto}
                                </button>
                            ) : null}
                            {removeProfilePhoto ? (
                                <p className="mt-3 text-sm text-amber-300">
                                    {isHebrew ? "התמונה תוסר לאחר שמירת השינויים." : "The photo will be removed after you save changes."}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
                            >
                                {saving ? text.savingChanges : text.saveChanges}
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

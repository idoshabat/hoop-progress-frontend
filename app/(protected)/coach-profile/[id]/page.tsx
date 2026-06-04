"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import {
    uploadProfileImageToCloudinary,
    validateProfileImageFile,
} from "@/app/lib/cloudinary";
import ErrorState from "@/app/Components/ErrorState";
import InlineAlert from "@/app/Components/InlineAlert";
import LocalizedDateText from "@/app/Components/LocalizedDateText";
import { CoachProfile, ConnectionRequest } from "@/app/types";

function matchesIncomingRequestForCoach(request: ConnectionRequest, profile: CoachProfile) {
    return (
        request.sender.id === profile.id ||
        request.sender_username.toLowerCase() === profile.username.toLowerCase()
    );
}

function matchesOutgoingRequestForCoach(request: ConnectionRequest, profile: CoachProfile) {
    return (
        request.receiver.id === profile.id ||
        request.receiver_username.toLowerCase() === profile.username.toLowerCase()
    );
}

export default function PublicCoachProfilePage() {
    const params = useParams<{ id: string }>();
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
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [viewerCoaches, setViewerCoaches] = useState<CoachProfile[]>([]);
    const [connectionActionLoading, setConnectionActionLoading] = useState(false);

    const text = isHebrew
        ? {
              failedLoad: "טעינת הפרופיל נכשלה.",
              updatedTitle: "הפרופיל עודכן",
              updatedMessage: "פרופיל המאמן שלך עודכן בהצלחה.",
              failedUpdate: "עדכון הפרופיל נכשל.",
              loading: "טוען פרופיל...",
              notFound: "הפרופיל לא נמצא.",
              profileLabel: "פרופיל מאמן",
              cancelEditing: "בטל עריכה",
              editProfile: "ערוך פרופיל",
              role: "תפקיד",
              coach: "מאמן",
              playersConnected: "שחקנים מחוברים",
              dateOfBirth: "תאריך לידה",
              notAvailable: "לא זמין",
              editDetails: "עריכת פרטים",
              profileDetails: "פרטי פרופיל",
              back: "חזרה",
              saveChanges: "שמור שינויים",
              savingChanges: "שומר...",
              username: "שם משתמש",
              profilePhoto: "תמונת פרופיל",
              profilePhotoHint: "JPG או PNG עד 10MB.",
              removePhoto: "הסר תמונת פרופיל",
              sendRequest: "הוסף מאמן",
              removeConnection: "הסר מאמן",
              requestPending: "בקשה ממתינה",
              acceptRequest: "אשר בקשה",
              rejectRequest: "דחה בקשה",
              requestSentTitle: "הבקשה נשלחה",
              requestSentMessage: "בקשת החיבור נשלחה בהצלחה.",
              coachRemovedTitle: "המאמן הוסר",
              coachRemovedMessage: "המאמן הוסר בהצלחה.",
              requestAcceptedTitle: "הבקשה אושרה",
              requestAcceptedMessage: "המאמן חובר לחשבון שלך.",
              requestRejectedTitle: "הבקשה נדחתה",
              requestRejectedMessage: "בקשת החיבור נדחתה.",
              failedConnectionAction: "פעולת החיבור נכשלה.",
            }
        : {
              failedLoad: "Failed to load profile.",
              updatedTitle: "Profile Updated",
              updatedMessage: "Your coach profile was updated successfully.",
              failedUpdate: "Failed to update profile.",
              loading: "Loading profile...",
              notFound: "Profile not found.",
              profileLabel: "Coach Profile",
              cancelEditing: "Cancel editing",
              editProfile: "Edit profile",
              role: "Role",
              coach: "Coach",
              playersConnected: "Players Connected",
              dateOfBirth: "Date of Birth",
              notAvailable: "N/A",
              editDetails: "Edit Details",
              profileDetails: "Profile Details",
              back: "Back",
              saveChanges: "Save Changes",
              savingChanges: "Saving...",
              username: "Username",
              profilePhoto: "Profile Photo",
              profilePhotoHint: "JPG or PNG up to 10MB.",
              removePhoto: "Remove Profile Photo",
              sendRequest: "Add Coach",
              removeConnection: "Remove Coach",
              requestPending: "Request Pending",
              acceptRequest: "Accept Request",
              rejectRequest: "Reject Request",
              requestSentTitle: "Request Sent",
              requestSentMessage: "The connection request was sent successfully.",
              coachRemovedTitle: "Coach Removed",
              coachRemovedMessage: "The coach was removed successfully.",
              requestAcceptedTitle: "Request Accepted",
              requestAcceptedMessage: "The coach is now connected to your account.",
              requestRejectedTitle: "Request Rejected",
              requestRejectedMessage: "The connection request was rejected.",
              failedConnectionAction: "Connection action failed.",
            };

    const loadProfile = useCallback(async () => {
        try {
            const incomingRequestsPromise = api.get("connection-requests/", { params: { status: "pending" } });
            const outgoingRequestsPromise = api.get("connection-requests/", {
                params: { type: "outgoing", status: "pending" },
            });
            const mePromise = api.get("me/");
            const [profileRes, incomingRequestsRes, outgoingRequestsRes, meRes] = await Promise.all([
                api.get(`coaches-profiles/${params.id}/`),
                incomingRequestsPromise,
                outgoingRequestsPromise,
                mePromise,
            ]);
            setProfile(profileRes.data);
            setDateOfBirth(profileRes.data.date_of_birth ?? "");
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
            setRemoveProfilePhoto(false);
            setIncomingRequests(incomingRequestsRes.data || []);
            setOutgoingRequests(outgoingRequestsRes.data || []);
            setViewerCoaches(meRes.data.coaches || []);
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

    const isOwner = !!profile && user?.role === "COACH" && user.username === profile.username;
    const canManageConnection = !!profile && !!user && user.role === "PLAYER" && !isOwner;
    const isConnectedToViewer =
        canManageConnection && !!viewerCoaches.some((coach) => coach.id === profile?.id);
    const incomingRequest =
        canManageConnection && profile
            ? incomingRequests.find((request) => matchesIncomingRequestForCoach(request, profile))
            : undefined;
    const outgoingRequest =
        canManageConnection && profile
            ? outgoingRequests.find((request) => matchesOutgoingRequestForCoach(request, profile))
            : undefined;

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
        if (!profile || !isOwner) return;

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

    const handleConnectionAction = async (action: "add" | "remove" | "accept" | "reject") => {
        if (!profile || !canManageConnection) return;

        try {
            setConnectionActionLoading(true);

            if (action === "add") {
                await api.post("add-coach-to-player/", { coach_id: profile.id });
                showSuccess({
                    title: text.requestSentTitle,
                    message: text.requestSentMessage,
                });
            }

            if (action === "remove") {
                await api.post("remove-coach-from-player/", { coach_id: profile.id });
                showSuccess({
                    title: text.coachRemovedTitle,
                    message: text.coachRemovedMessage,
                });
            }

            if ((action === "accept" || action === "reject") && incomingRequest) {
                await api.post(`connection-requests/${incomingRequest.id}/respond/`, { action });
                showSuccess({
                    title: action === "accept" ? text.requestAcceptedTitle : text.requestRejectedTitle,
                    message: action === "accept" ? text.requestAcceptedMessage : text.requestRejectedMessage,
                });
            }

            setError("");
            await loadProfile();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : text.failedConnectionAction);
        } finally {
            setConnectionActionLoading(false);
        }
    };

    const displayedPhoto =
        profilePhotoPreview || (removeProfilePhoto ? null : profile?.profile_photo_url) || null;

    if (authLoading || loading) return <p className="p-6 text-stone-400">{text.loading}</p>;
    if (error || !profile)
        return (
            <ErrorState
                title={isHebrew ? "לא הצלחנו לפתוח את פרופיל המאמן" : "We couldn't open this coach profile"}
                description={error || text.notFound}
                actionLabel={isHebrew ? "חזרה" : "Go back"}
                actionHref="/"
            />
        );

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 text-3xl font-black text-amber-200">
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
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                            {text.profileLabel}
                        </p>
                        <h1 className="mt-3 text-4xl font-black text-stone-100">{profile.username}</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {canManageConnection ? (
                        isConnectedToViewer ? (
                            <button
                                type="button"
                                disabled={connectionActionLoading}
                                onClick={() => void handleConnectionAction("remove")}
                                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                {connectionActionLoading ? text.savingChanges : text.removeConnection}
                            </button>
                        ) : incomingRequest ? (
                            <>
                                <button
                                    type="button"
                                    disabled={connectionActionLoading}
                                    onClick={() => void handleConnectionAction("accept")}
                                    className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {connectionActionLoading ? text.savingChanges : text.acceptRequest}
                                </button>
                                <button
                                    type="button"
                                    disabled={connectionActionLoading}
                                    onClick={() => void handleConnectionAction("reject")}
                                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-stone-200 transition hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {connectionActionLoading ? text.savingChanges : text.rejectRequest}
                                </button>
                            </>
                        ) : outgoingRequest ? (
                            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-5 py-3 font-semibold text-amber-300">
                                {text.requestPending}
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={connectionActionLoading}
                                onClick={() => void handleConnectionAction("add")}
                                className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                            >
                                {connectionActionLoading ? text.savingChanges : text.sendRequest}
                            </button>
                        )
                    ) : null}
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
            </div>
            <section className="overflow-hidden rounded-4xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 shadow-2xl shadow-black/30">
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
                            <LocalizedDateText value={profile.date_of_birth} fallback={text.notAvailable} />
                        </p>
                    </div>
                </div>
            </section>

            {error ? <InlineAlert message={error} /> : null}

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
                                {text.profilePhoto}
                            </label>
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
                                <LocalizedDateText value={profile.date_of_birth} fallback={text.notAvailable} />
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

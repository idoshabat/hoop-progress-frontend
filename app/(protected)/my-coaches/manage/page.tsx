"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import PageHero from "@/app/Components/PageHero";
import ErrorState from "@/app/Components/ErrorState";
import InlineAlert from "@/app/Components/InlineAlert";
import SearchToolbar from "@/app/Components/SearchToolbar";
import SectionSurface from "@/app/Components/SectionSurface";
import StatCard from "@/app/Components/StatCard";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { useSuccessFeedback } from "@/app/Context/SuccessFeedbackContext";
import { CoachProfile, ConnectionRequest } from "@/app/types";

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "detail" in error.response.data &&
        typeof error.response.data.detail === "string"
    ) {
        return error.response.data.detail;
    }

    return fallback;
}

function renderProfileAvatar(username: string, profilePhotoUrl?: string | null) {
    const initial = username.trim().charAt(0).toUpperCase() || "?";

    return (
        <div className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-linear-to-br from-zinc-900 via-zinc-950 to-amber-500/20 text-2xl font-black text-amber-200 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            {profilePhotoUrl ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profilePhotoUrl} alt={username} className="h-full w-full object-cover" />
                </>
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
}

export default function ManageCoachesPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew, language } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [coaches, setCoaches] = useState<CoachProfile[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [searchedCoaches, setSearchedCoaches] = useState<CoachProfile[]>([]);
    const [searchUsername, setSearchUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [updatingCoachId, setUpdatingCoachId] = useState<number | null>(null);
    const [respondingRequestId, setRespondingRequestId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [searchMessage, setSearchMessage] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [requestQuery, setRequestQuery] = useState("");
    const [requestFilter, setRequestFilter] = useState<"all" | "incoming" | "outgoing">("all");

    const text = useMemo(
        () =>
            isHebrew
                ? {
                      failedLoad: "טעינת המאמנים נכשלה.",
                      emptyUsername: "יש להזין שם משתמש של מאמן.",
                      noSuchCoach: "לא נמצא מאמן כזה.",
                      failedSearch: "חיפוש המאמן נכשל.",
                      requestSentTitle: "הבקשה נשלחה",
                      requestSentMessage: (username: string) => `בקשת החיבור אל ${username} נשלחה.`,
                      failedRequest: "שליחת בקשת החיבור נכשלה.",
                      coachRemovedTitle: "המאמן הוסר",
                      coachRemovedMessage: (username: string) => `${username} הוסר בהצלחה.`,
                      failedRemove: "הסרת המאמן נכשלה.",
                      requestAcceptedTitle: "הבקשה אושרה",
                      requestRejectedTitle: "הבקשה נדחתה",
                      requestAcceptedMessage: "המאמן מחובר עכשיו לחשבון שלך.",
                      requestRejectedMessage: "בקשת החיבור נדחתה.",
                      failedUpdateRequest: "עדכון בקשת החיבור נכשל.",
                      loading: "טוען ניהול מאמנים...",
                      loginRequired: "יש להתחבר כדי לנהל מאמנים.",
                      accessDenied: "אין גישה. לשחקנים בלבד.",
                      title: "ניהול מאמנים",
                      subtitle: "חפש מאמנים, נהל חיבורים קיימים וטפל בבקשות פתוחות בצורה מסודרת.",
                      eyebrow: "אזור החיבורים",
                      badge: "Coaches",
                      backToCoaches: "חזרה למאמנים שלי",
                      findCoach: "חיפוש מאמן",
                      searchPlaceholder: "הכנס שם משתמש של מאמן",
                      searching: "מחפש...",
                      search: "חפש",
                      dateOfBirth: "תאריך לידה",
                      notAvailable: "לא זמין",
                      saving: "שומר...",
                      removeCoach: "הסר מאמן",
                      acceptRequest: "אשר בקשה",
                      rejectRequest: "דחה בקשה",
                      requestPending: "הבקשה כבר נשלחה. ממתין לתגובה.",
                      sending: "שולח...",
                      sendRequest: "שלח בקשה",
                      incomingRequests: "בקשות נכנסות",
                      noIncomingRequests: "אין בקשות נכנסות.",
                      outgoingRequests: "בקשות יוצאות",
                      noOutgoingRequests: "אין בקשות יוצאות.",
                      sentOn: "נשלח בתאריך",
                      waitingForResponse: "ממתין לתגובה.",
                      totalCoaches: "מאמנים מחוברים",
                      pendingIncoming: "נכנסות פתוחות",
                      pendingOutgoing: "יוצאות פתוחות",
                      coachLibrary: "ספריית מאמנים",
                      coachLibraryDescription: "מצא מאמן חדש או נהל מצב חיבור קיים ממקום אחד.",
                      requestSearchPlaceholder: "סנן בקשות לפי שם משתמש",
                      allRequests: "כל הבקשות",
                      incomingOnly: "נכנסות",
                      outgoingOnly: "יוצאות",
                  }
                : {
                      failedLoad: "Failed to load coaches.",
                      emptyUsername: "Please enter a coach username.",
                      noSuchCoach: "No such coach.",
                      failedSearch: "Failed to search for coach.",
                      requestSentTitle: "Request Sent",
                      requestSentMessage: (username: string) => `Your connection request to ${username} was sent.`,
                      failedRequest: "Failed to send connection request.",
                      coachRemovedTitle: "Coach Removed",
                      coachRemovedMessage: (username: string) => `${username} was removed successfully.`,
                      failedRemove: "Failed to remove coach.",
                      requestAcceptedTitle: "Request Accepted",
                      requestRejectedTitle: "Request Rejected",
                      requestAcceptedMessage: "The coach is now connected to your account.",
                      requestRejectedMessage: "The connection request was rejected.",
                      failedUpdateRequest: "Failed to update connection request.",
                      loading: "Loading coach management...",
                      loginRequired: "Please log in to manage coaches.",
                      accessDenied: "Access denied. Players only.",
                      title: "Manage Coaches",
                      subtitle: "Search for coaches, manage current connections, and handle open requests in one organized space.",
                      eyebrow: "Connection Space",
                      badge: "Coaches",
                      backToCoaches: "Back to My Coaches",
                      findCoach: "Find a Coach",
                      searchPlaceholder: "Enter coach username",
                      searching: "Searching...",
                      search: "Search",
                      dateOfBirth: "Date of birth",
                      notAvailable: "N/A",
                      saving: "Saving...",
                      removeCoach: "Remove coach",
                      acceptRequest: "Accept request",
                      rejectRequest: "Reject request",
                      requestPending: "Request already sent. Waiting for response.",
                      sending: "Sending...",
                      sendRequest: "Send request",
                      incomingRequests: "Incoming Requests",
                      noIncomingRequests: "No incoming requests.",
                      outgoingRequests: "Outgoing Requests",
                      noOutgoingRequests: "No outgoing requests.",
                      sentOn: "Sent on",
                      waitingForResponse: "Waiting for response.",
                      totalCoaches: "Connected Coaches",
                      pendingIncoming: "Open Incoming",
                      pendingOutgoing: "Open Outgoing",
                      coachLibrary: "Coach Library",
                      coachLibraryDescription: "Find a new coach or manage an existing connection from one place.",
                      requestSearchPlaceholder: "Filter requests by username",
                      allRequests: "All Requests",
                      incomingOnly: "Incoming",
                      outgoingOnly: "Outgoing",
                  },
        [isHebrew]
    );

    const loadPageData = useCallback(async () => {
        try {
            const [playerRes, incomingRes, outgoingRes] = await Promise.all([
                api.get("me/"),
                api.get("connection-requests/", { params: { status: "pending" } }),
                api.get("connection-requests/", {
                    params: { type: "outgoing", status: "pending" },
                }),
            ]);

            setCoaches(playerRes.data.coaches || []);
            setIncomingRequests(incomingRes.data || []);
            setOutgoingRequests(outgoingRes.data || []);
        } catch (err) {
            console.error(err);
            setError(text.failedLoad);
        }
    }, [text.failedLoad]);

    useEffect(() => {
        if (authLoading || !user) return;

        const load = async () => {
            try {
                await loadPageData();
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [authLoading, loadPageData, user]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedUsername = searchUsername.trim();
        if (!trimmedUsername) {
            setSearchedCoaches([]);
            setSearchMessage(text.emptyUsername);
            return;
        }

        try {
            setSearching(true);
            setSearchMessage("");
            setActionMessage("");

            const res = await api.get("find-coach/", {
                params: { username: trimmedUsername },
            });

            const nextCoaches = Array.isArray(res.data)
                ? res.data
                : res.data
                  ? [res.data]
                  : [];

            if (nextCoaches.length === 0) {
                setSearchedCoaches([]);
                setSearchMessage(text.noSuchCoach);
                return;
            }

            setSearchedCoaches(nextCoaches);
        } catch (err: unknown) {
            console.error(err);
            setSearchedCoaches([]);

            const status =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof err.response === "object" &&
                err.response !== null &&
                "status" in err.response
                    ? err.response.status
                    : undefined;

            if (status === 404) setSearchMessage(text.noSuchCoach);
            else setSearchMessage(text.failedSearch);
        } finally {
            setSearching(false);
        }
    };

    const handleCoachRequest = async (coach: CoachProfile) => {
        if (!coach) return;

        try {
            setUpdatingCoachId(coach.id);
            setActionMessage("");
            await api.post("add-coach-to-player/", { coach_id: coach.id });
            await loadPageData();
            showSuccess({
                title: text.requestSentTitle,
                message: text.requestSentMessage(coach.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRequest));
        } finally {
            setUpdatingCoachId(null);
        }
    };

    const handleRemoveCoach = async (coach: CoachProfile) => {
        if (!coach) return;

        try {
            setUpdatingCoachId(coach.id);
            setActionMessage("");
            await api.post("remove-coach-from-player/", { coach_id: coach.id });
            await loadPageData();
            showSuccess({
                title: text.coachRemovedTitle,
                message: text.coachRemovedMessage(coach.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRemove));
        } finally {
            setUpdatingCoachId(null);
        }
    };

    const handleRespondToRequest = async (requestId: number, action: "accept" | "reject") => {
        try {
            setRespondingRequestId(requestId);
            setActionMessage("");
            await api.post(`connection-requests/${requestId}/respond/`, { action });
            await loadPageData();
            showSuccess({
                title: action === "accept" ? text.requestAcceptedTitle : text.requestRejectedTitle,
                message: action === "accept" ? text.requestAcceptedMessage : text.requestRejectedMessage,
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedUpdateRequest));
        } finally {
            setRespondingRequestId(null);
        }
    };

    if (authLoading || loading) return <p className="p-6 text-stone-400">{text.loading}</p>;
    if (!user)
        return (
            <ErrorState
                title={isHebrew ? "יש להתחבר כדי להמשיך" : "Please log in to continue"}
                description={text.loginRequired}
                actionLabel={isHebrew ? "לעמוד ההתחברות" : "Go to login"}
                actionHref="/login"
                tone="warning"
            />
        );
    if (user.role !== "PLAYER")
        return (
            <ErrorState
                title={isHebrew ? "העמוד הזה זמין לשחקנים בלבד" : "This page is for players only"}
                description={text.accessDenied}
                actionLabel={isHebrew ? "חזרה לדף הבית" : "Back to home"}
                actionHref="/"
                tone="warning"
            />
        );
    if (error)
        return (
            <ErrorState
                title={isHebrew ? "לא הצלחנו לטעון את ניהול המאמנים" : "We couldn't load coach management"}
                description={error}
                actionLabel={isHebrew ? "נסה שוב" : "Try again"}
                onAction={() => {
                    setLoading(true);
                    setError("");
                    void loadPageData().finally(() => setLoading(false));
                }}
            />
        );

    const locale = language === "he" ? "he-IL" : "en-US";
    const filteredIncomingRequests = incomingRequests.filter((request) =>
        request.sender_username.toLowerCase().includes(requestQuery.trim().toLowerCase())
    );
    const filteredOutgoingRequests = outgoingRequests.filter((request) =>
        request.receiver_username.toLowerCase().includes(requestQuery.trim().toLowerCase())
    );

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <PageHero
                eyebrow={text.eyebrow}
                title={text.title}
                description={text.subtitle}
                badge={text.badge}
                action={
                    <Link
                        href="/my-coaches"
                        className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                    >
                        {text.backToCoaches}
                    </Link>
                }
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label={text.totalCoaches} value={coaches.length} />
                    <StatCard label={text.pendingIncoming} value={incomingRequests.length} accent />
                    <StatCard label={text.pendingOutgoing} value={outgoingRequests.length} />
                </div>
            </PageHero>

            <SectionSurface
                title={text.findCoach}
                description={text.coachLibraryDescription}
            >
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        placeholder={text.searchPlaceholder}
                        className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 p-3 text-stone-100"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                    >
                        {searching ? text.searching : text.search}
                    </button>
                </form>

                {searchMessage ? <div className="mt-3"><InlineAlert message={searchMessage} /></div> : null}
                {actionMessage ? <div className="mt-3"><InlineAlert message={actionMessage} /></div> : null}

                {searchedCoaches.length > 0 ? (
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {searchedCoaches.map((searchedCoach) => {
                            const isCurrentCoach = coaches.some((coach) => coach.id === searchedCoach.id);
                            const incomingRequestForSearchedCoach = incomingRequests.find(
                                (request) => request.sender.id === searchedCoach.id
                            );
                            const outgoingRequestForSearchedCoach = outgoingRequests.find(
                                (request) => request.receiver.id === searchedCoach.id
                            );
                            const isUpdatingThisCoach = updatingCoachId === searchedCoach.id;

                            return (
                                <div
                                    key={searchedCoach.id}
                                    className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        {renderProfileAvatar(searchedCoach.username, searchedCoach.profile_photo_url)}
                                        <div className="min-w-0">
                                            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{text.findCoach}</p>
                                            <Link
                                                href={`/coach-profile/${searchedCoach.id}`}
                                                className="mt-1 block text-xl font-bold text-stone-100 transition hover:text-amber-300"
                                            >
                                                {searchedCoach.username}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dateOfBirth}</p>
                                        <p className="mt-2 font-medium text-stone-200">
                                            {searchedCoach.date_of_birth || text.notAvailable}
                                        </p>
                                    </div>

                                    {isCurrentCoach ? (
                                        <button
                                            type="button"
                                            disabled={isUpdatingThisCoach}
                                            onClick={() => void handleRemoveCoach(searchedCoach)}
                                            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                                        >
                                            {isUpdatingThisCoach ? text.saving : text.removeCoach}
                                        </button>
                                    ) : incomingRequestForSearchedCoach ? (
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                disabled={respondingRequestId === incomingRequestForSearchedCoach.id}
                                                onClick={() => handleRespondToRequest(incomingRequestForSearchedCoach.id, "accept")}
                                                className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                            >
                                                {respondingRequestId === incomingRequestForSearchedCoach.id ? text.saving : text.acceptRequest}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={respondingRequestId === incomingRequestForSearchedCoach.id}
                                                onClick={() => handleRespondToRequest(incomingRequestForSearchedCoach.id, "reject")}
                                                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-stone-200 transition hover:bg-zinc-800 disabled:opacity-50"
                                            >
                                                {respondingRequestId === incomingRequestForSearchedCoach.id ? text.saving : text.rejectRequest}
                                            </button>
                                        </div>
                                    ) : outgoingRequestForSearchedCoach ? (
                                        <p className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm font-medium text-amber-300">
                                            {text.requestPending}
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={isUpdatingThisCoach}
                                            onClick={() => void handleCoachRequest(searchedCoach)}
                                            className="mt-5 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                                        >
                                            {isUpdatingThisCoach ? text.sending : text.sendRequest}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </SectionSurface>

            <div className="space-y-5">
                <SearchToolbar
                    query={requestQuery}
                    onQueryChange={setRequestQuery}
                    placeholder={text.requestSearchPlaceholder}
                >
                    <button
                        type="button"
                        onClick={() => setRequestFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            requestFilter === "all"
                                ? "bg-amber-500 text-zinc-950"
                                : "border border-zinc-700 bg-zinc-950 text-stone-300"
                        }`}
                    >
                        {text.allRequests}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRequestFilter("incoming")}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            requestFilter === "incoming"
                                ? "bg-amber-500 text-zinc-950"
                                : "border border-zinc-700 bg-zinc-950 text-stone-300"
                        }`}
                    >
                        {text.incomingOnly}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRequestFilter("outgoing")}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            requestFilter === "outgoing"
                                ? "bg-amber-500 text-zinc-950"
                                : "border border-zinc-700 bg-zinc-950 text-stone-300"
                        }`}
                    >
                        {text.outgoingOnly}
                    </button>
                </SearchToolbar>

            <div className="grid gap-8 xl:grid-cols-2">
                {requestFilter !== "outgoing" ? (
                <SectionSurface title={text.incomingRequests}>
                    {filteredIncomingRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {text.noIncomingRequests}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredIncomingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5"
                                >
                                    <Link
                                        href={`/coach-profile/${request.sender.id}`}
                                        className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                    >
                                        {request.sender_username}
                                    </Link>
                                    <p className="mt-2 text-sm text-stone-500">
                                        {text.sentOn} {new Date(request.created_at).toLocaleString(locale)}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            disabled={respondingRequestId === request.id}
                                            onClick={() => handleRespondToRequest(request.id, "accept")}
                                            className="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            {respondingRequestId === request.id ? text.saving : text.acceptRequest}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={respondingRequestId === request.id}
                                            onClick={() => handleRespondToRequest(request.id, "reject")}
                                            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 font-semibold text-stone-200 transition hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {respondingRequestId === request.id ? text.saving : text.rejectRequest}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionSurface>
                ) : null}

                {requestFilter !== "incoming" ? (
                <SectionSurface title={text.outgoingRequests}>
                    {filteredOutgoingRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {text.noOutgoingRequests}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOutgoingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5"
                                >
                                    <Link
                                        href={`/coach-profile/${request.receiver.id}`}
                                        className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                    >
                                        {request.receiver_username}
                                    </Link>
                                    <p className="mt-2 text-sm text-stone-500">
                                        {text.sentOn} {new Date(request.created_at).toLocaleString(locale)}
                                    </p>
                                    <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm font-medium text-amber-300">
                                        {text.waitingForResponse}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionSurface>
                ) : null}
            </div>
            </div>
        </div>
    );
}

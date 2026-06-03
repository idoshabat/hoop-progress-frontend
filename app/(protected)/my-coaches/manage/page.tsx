"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import PageHero from "@/app/Components/PageHero";
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

export default function ManageCoachesPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew, language } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [coaches, setCoaches] = useState<CoachProfile[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [searchedCoach, setSearchedCoach] = useState<CoachProfile | null>(null);
    const [searchUsername, setSearchUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [updatingCoach, setUpdatingCoach] = useState(false);
    const [respondingRequestId, setRespondingRequestId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [searchMessage, setSearchMessage] = useState("");
    const [actionMessage, setActionMessage] = useState("");

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
            setSearchedCoach(null);
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

            const coach = Array.isArray(res.data) ? res.data[0] : res.data;

            if (!coach) {
                setSearchedCoach(null);
                setSearchMessage(text.noSuchCoach);
                return;
            }

            setSearchedCoach(coach);
        } catch (err: unknown) {
            console.error(err);
            setSearchedCoach(null);

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

    const handleCoachRequest = async () => {
        if (!searchedCoach) return;

        try {
            setUpdatingCoach(true);
            setActionMessage("");
            await api.post("add-coach-to-player/", { coach_id: searchedCoach.id });
            await loadPageData();
            showSuccess({
                title: text.requestSentTitle,
                message: text.requestSentMessage(searchedCoach.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRequest));
        } finally {
            setUpdatingCoach(false);
        }
    };

    const handleRemoveCoach = async () => {
        if (!searchedCoach) return;

        try {
            setUpdatingCoach(true);
            setActionMessage("");
            await api.post("remove-coach-from-player/", { coach_id: searchedCoach.id });
            await loadPageData();
            showSuccess({
                title: text.coachRemovedTitle,
                message: text.coachRemovedMessage(searchedCoach.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRemove));
        } finally {
            setUpdatingCoach(false);
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

    if (authLoading || loading) return <p className="p-6">{text.loading}</p>;
    if (!user) return <p className="p-6">{text.loginRequired}</p>;
    if (user.role !== "PLAYER") return <p className="p-6 text-red-500">{text.accessDenied}</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    const locale = language === "he" ? "he-IL" : "en-US";
    const isCurrentCoach = searchedCoach ? coaches.some((coach) => coach.id === searchedCoach.id) : false;
    const incomingRequestForSearchedCoach = searchedCoach
        ? incomingRequests.find((request) => request.sender.id === searchedCoach.id)
        : undefined;
    const outgoingRequestForSearchedCoach = searchedCoach
        ? outgoingRequests.find((request) => request.receiver.id === searchedCoach.id)
        : undefined;

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

                {searchMessage && <p className="mt-3 text-sm text-red-400">{searchMessage}</p>}
                {actionMessage && <p className="mt-3 text-sm text-red-400">{actionMessage}</p>}

                {searchedCoach ? (
                    <div className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
                        <Link
                            href={`/coach-profile/${searchedCoach.id}`}
                            className="text-xl font-bold text-stone-100 hover:text-amber-300"
                        >
                            {searchedCoach.username}
                        </Link>
                        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dateOfBirth}</p>
                            <p className="mt-2 font-medium text-stone-200">
                                {searchedCoach.date_of_birth || text.notAvailable}
                            </p>
                        </div>

                        {isCurrentCoach ? (
                            <button
                                type="button"
                                disabled={updatingCoach}
                                onClick={handleRemoveCoach}
                                className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                {updatingCoach ? text.saving : text.removeCoach}
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
                                disabled={updatingCoach}
                                onClick={handleCoachRequest}
                                className="mt-5 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                            >
                                {updatingCoach ? text.sending : text.sendRequest}
                            </button>
                        )}
                    </div>
                ) : null}
            </SectionSurface>

            <div className="grid gap-8 xl:grid-cols-2">
                <SectionSurface title={text.incomingRequests}>
                    {incomingRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {text.noIncomingRequests}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incomingRequests.map((request) => (
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

                <SectionSurface title={text.outgoingRequests}>
                    {outgoingRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {text.noOutgoingRequests}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {outgoingRequests.map((request) => (
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
            </div>
        </div>
    );
}

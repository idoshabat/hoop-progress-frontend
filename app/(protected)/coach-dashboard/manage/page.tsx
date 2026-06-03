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
import { ConnectionRequest, PlayerProfile } from "@/app/types";

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

export default function ManagePlayersPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew, language } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [searchedPlayer, setSearchedPlayer] = useState<PlayerProfile | null>(null);
    const [searchUsername, setSearchUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [updatingPlayer, setUpdatingPlayer] = useState(false);
    const [respondingRequestId, setRespondingRequestId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [searchMessage, setSearchMessage] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const text = useMemo(
        () =>
            isHebrew
                ? {
                      failedLoad: "טעינת השחקנים נכשלה.",
                      emptyUsername: "יש להזין שם משתמש של שחקן.",
                      noSuchPlayer: "לא נמצא שחקן כזה.",
                      failedSearch: "חיפוש השחקן נכשל.",
                      requestSentTitle: "הבקשה נשלחה",
                      requestSentMessage: (username: string) => `בקשת החיבור אל ${username} נשלחה.`,
                      failedRequest: "שליחת בקשת החיבור נכשלה.",
                      playerRemovedTitle: "השחקן הוסר",
                      playerRemovedMessage: (username: string) => `${username} הוסר בהצלחה.`,
                      failedRemove: "הסרת השחקן נכשלה.",
                      requestAcceptedTitle: "הבקשה אושרה",
                      requestRejectedTitle: "הבקשה נדחתה",
                      requestAcceptedMessage: "השחקן מחובר עכשיו לחשבון שלך.",
                      requestRejectedMessage: "בקשת החיבור נדחתה.",
                      failedUpdateRequest: "עדכון בקשת החיבור נכשל.",
                      loading: "טוען ניהול שחקנים...",
                      loginRequired: "יש להתחבר כדי לנהל שחקנים.",
                      accessDenied: "אין גישה. למאמנים בלבד.",
                      title: "ניהול שחקנים",
                      subtitle: "חפש שחקנים, נהל חיבורים קיימים וטפל בבקשות פתוחות ממקום אחד.",
                      eyebrow: "אזור החיבורים",
                      badge: "Players",
                      backToDashboard: "חזרה ללוח הבקרה של המאמן",
                      findPlayer: "חיפוש שחקן",
                      searchPlaceholder: "הכנס שם משתמש של שחקן",
                      searching: "מחפש...",
                      search: "חפש",
                      dateOfBirth: "תאריך לידה",
                      position: "עמדה",
                      height: "גובה",
                      notAvailable: "לא זמין",
                      saving: "שומר...",
                      removePlayer: "הסר שחקן",
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
                      totalPlayers: "שחקנים מחוברים",
                      pendingIncoming: "נכנסות פתוחות",
                      pendingOutgoing: "יוצאות פתוחות",
                      playerLibrary: "ספריית שחקנים",
                      playerLibraryDescription: "מצא שחקן חדש או נהל מצב חיבור קיים ממקום אחד.",
                  }
                : {
                      failedLoad: "Failed to load players.",
                      emptyUsername: "Please enter a player username.",
                      noSuchPlayer: "No such player.",
                      failedSearch: "Failed to search for player.",
                      requestSentTitle: "Request Sent",
                      requestSentMessage: (username: string) => `Your connection request to ${username} was sent.`,
                      failedRequest: "Failed to send connection request.",
                      playerRemovedTitle: "Player Removed",
                      playerRemovedMessage: (username: string) => `${username} was removed successfully.`,
                      failedRemove: "Failed to remove player.",
                      requestAcceptedTitle: "Request Accepted",
                      requestRejectedTitle: "Request Rejected",
                      requestAcceptedMessage: "The player is now connected to your account.",
                      requestRejectedMessage: "The connection request was rejected.",
                      failedUpdateRequest: "Failed to update connection request.",
                      loading: "Loading player management...",
                      loginRequired: "Please log in to manage players.",
                      accessDenied: "Access denied. Coaches only.",
                      title: "Manage Players",
                      subtitle: "Search for players, manage current connections, and handle open requests from one place.",
                      eyebrow: "Connection Space",
                      badge: "Players",
                      backToDashboard: "Back to Coach Dashboard",
                      findPlayer: "Find a Player",
                      searchPlaceholder: "Enter player username",
                      searching: "Searching...",
                      search: "Search",
                      dateOfBirth: "Date of birth",
                      position: "Position",
                      height: "Height",
                      notAvailable: "N/A",
                      saving: "Saving...",
                      removePlayer: "Remove player",
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
                      totalPlayers: "Connected Players",
                      pendingIncoming: "Open Incoming",
                      pendingOutgoing: "Open Outgoing",
                      playerLibrary: "Player Library",
                      playerLibraryDescription: "Find a new player or manage an existing connection from one place.",
                  },
        [isHebrew]
    );

    const loadPageData = useCallback(async () => {
        try {
            const [coachRes, incomingRes, outgoingRes] = await Promise.all([
                api.get("me/"),
                api.get("connection-requests/", { params: { status: "pending" } }),
                api.get("connection-requests/", {
                    params: { type: "outgoing", status: "pending" },
                }),
            ]);

            setPlayers(coachRes.data.players || []);
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
            setSearchedPlayer(null);
            setSearchMessage(text.emptyUsername);
            return;
        }

        try {
            setSearching(true);
            setSearchMessage("");
            setActionMessage("");

            const res = await api.get("find-player/", {
                params: { username: trimmedUsername },
            });

            const player = Array.isArray(res.data) ? res.data[0] : res.data;

            if (!player) {
                setSearchedPlayer(null);
                setSearchMessage(text.noSuchPlayer);
                return;
            }

            setSearchedPlayer(player);
        } catch (err: unknown) {
            console.error(err);
            setSearchedPlayer(null);

            const status =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof err.response === "object" &&
                err.response !== null &&
                "status" in err.response
                    ? err.response.status
                    : undefined;

            if (status === 404) setSearchMessage(text.noSuchPlayer);
            else setSearchMessage(text.failedSearch);
        } finally {
            setSearching(false);
        }
    };

    const handlePlayerRequest = async () => {
        if (!searchedPlayer) return;

        try {
            setUpdatingPlayer(true);
            setActionMessage("");
            await api.post("add-player-to-coach/", { player_id: searchedPlayer.id });
            await loadPageData();
            showSuccess({
                title: text.requestSentTitle,
                message: text.requestSentMessage(searchedPlayer.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRequest));
        } finally {
            setUpdatingPlayer(false);
        }
    };

    const handleRemovePlayer = async () => {
        if (!searchedPlayer) return;

        try {
            setUpdatingPlayer(true);
            setActionMessage("");
            await api.post("remove-player-from-coach/", { player_id: searchedPlayer.id });
            await loadPageData();
            showSuccess({
                title: text.playerRemovedTitle,
                message: text.playerRemovedMessage(searchedPlayer.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRemove));
        } finally {
            setUpdatingPlayer(false);
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
    if (user.role !== "COACH") return <p className="p-6 text-red-500">{text.accessDenied}</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    const locale = language === "he" ? "he-IL" : "en-US";
    const isCurrentPlayer = searchedPlayer ? players.some((player) => player.id === searchedPlayer.id) : false;
    const incomingRequestForSearchedPlayer = searchedPlayer
        ? incomingRequests.find((request) => request.sender.id === searchedPlayer.id)
        : undefined;
    const outgoingRequestForSearchedPlayer = searchedPlayer
        ? outgoingRequests.find((request) => request.receiver.id === searchedPlayer.id)
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
                        href="/coach-dashboard"
                        className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                    >
                        {text.backToDashboard}
                    </Link>
                }
            >
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label={text.totalPlayers} value={players.length} />
                    <StatCard label={text.pendingIncoming} value={incomingRequests.length} accent />
                    <StatCard label={text.pendingOutgoing} value={outgoingRequests.length} />
                </div>
            </PageHero>

            <SectionSurface title={text.findPlayer} description={text.playerLibraryDescription}>
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

                {searchedPlayer ? (
                    <div className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
                        <Link
                            href={`/player-profile/${searchedPlayer.id}`}
                            className="text-xl font-bold text-stone-100 hover:text-amber-300"
                        >
                            {searchedPlayer.username}
                        </Link>
                        <div className="mt-5 grid gap-3">
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dateOfBirth}</p>
                                <p className="mt-2 font-medium text-stone-200">
                                    {searchedPlayer.date_of_birth || text.notAvailable}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.position}</p>
                                    <p className="mt-2 font-medium text-stone-200">{searchedPlayer.position}</p>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.height}</p>
                                    <p className="mt-2 font-medium text-stone-200">
                                        {searchedPlayer.height_cm ? `${searchedPlayer.height_cm} cm` : text.notAvailable}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isCurrentPlayer ? (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handleRemovePlayer}
                                className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                            >
                                {updatingPlayer ? text.saving : text.removePlayer}
                            </button>
                        ) : incomingRequestForSearchedPlayer ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "accept")}
                                    className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? text.saving : text.acceptRequest}
                                </button>
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "reject")}
                                    className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-stone-200 transition hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? text.saving : text.rejectRequest}
                                </button>
                            </div>
                        ) : outgoingRequestForSearchedPlayer ? (
                            <p className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm font-medium text-amber-300">
                                {text.requestPending}
                            </p>
                        ) : (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handlePlayerRequest}
                                className="mt-5 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                            >
                                {updatingPlayer ? text.sending : text.sendRequest}
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
                                        href={`/player-profile/${request.sender.id}`}
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
                                        href={`/player-profile/${request.receiver.id}`}
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

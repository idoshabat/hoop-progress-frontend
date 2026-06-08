"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import PageHero from "@/app/Components/PageHero";
import ErrorState from "@/app/Components/ErrorState";
import InlineAlert from "@/app/Components/InlineAlert";
import LocalizedDateText from "@/app/Components/LocalizedDateText";
import SearchToolbar from "@/app/Components/SearchToolbar";
import SectionSurface from "@/app/Components/SectionSurface";
import StatCard from "@/app/Components/StatCard";
import { getDisplayInitial } from "@/app/lib/getDisplayInitial";
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

function renderProfileAvatar(
    username: string,
    firstName?: string | null,
    profilePhotoUrl?: string | null
) {
    const initial = getDisplayInitial(firstName, username);

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

export default function ManagePlayersPage() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew, language } = useLanguage();
    const { showSuccess } = useSuccessFeedback();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [searchedPlayers, setSearchedPlayers] = useState<PlayerProfile[]>([]);
    const [searchUsername, setSearchUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [updatingPlayerId, setUpdatingPlayerId] = useState<number | null>(null);
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
                      requestSearchPlaceholder: "סנן בקשות לפי שם משתמש",
                      allRequests: "כל הבקשות",
                      incomingOnly: "נכנסות",
                      outgoingOnly: "יוצאות",
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
                      requestSearchPlaceholder: "Filter requests by username",
                      allRequests: "All Requests",
                      incomingOnly: "Incoming",
                      outgoingOnly: "Outgoing",
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
            setSearchedPlayers([]);
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

            const nextPlayers = Array.isArray(res.data)
                ? res.data
                : res.data
                  ? [res.data]
                  : [];

            if (nextPlayers.length === 0) {
                setSearchedPlayers([]);
                setSearchMessage(text.noSuchPlayer);
                return;
            }

            setSearchedPlayers(nextPlayers);
        } catch (err: unknown) {
            console.error(err);
            setSearchedPlayers([]);

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

    const handlePlayerRequest = async (player: PlayerProfile) => {
        if (!player) return;

        try {
            setUpdatingPlayerId(player.id);
            setActionMessage("");
            await api.post("add-player-to-coach/", { player_id: player.id });
            await loadPageData();
            showSuccess({
                title: text.requestSentTitle,
                message: text.requestSentMessage(player.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRequest));
        } finally {
            setUpdatingPlayerId(null);
        }
    };

    const handleRemovePlayer = async (player: PlayerProfile) => {
        if (!player) return;

        try {
            setUpdatingPlayerId(player.id);
            setActionMessage("");
            await api.post("remove-player-from-coach/", { player_id: player.id });
            await loadPageData();
            showSuccess({
                title: text.playerRemovedTitle,
                message: text.playerRemovedMessage(player.username),
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, text.failedRemove));
        } finally {
            setUpdatingPlayerId(null);
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
    if (user.role !== "COACH")
        return (
            <ErrorState
                title={isHebrew ? "העמוד הזה זמין למאמנים בלבד" : "This page is for coaches only"}
                description={text.accessDenied}
                actionLabel={isHebrew ? "חזרה לדף הבית" : "Back to home"}
                actionHref="/"
                tone="warning"
            />
        );
    if (error)
        return (
            <ErrorState
                title={isHebrew ? "לא הצלחנו לטעון את ניהול השחקנים" : "We couldn't load player management"}
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

                {searchMessage ? <div className="mt-3"><InlineAlert message={searchMessage} /></div> : null}
                {actionMessage ? <div className="mt-3"><InlineAlert message={actionMessage} /></div> : null}

                {searchedPlayers.length > 0 ? (
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {searchedPlayers.map((searchedPlayer) => {
                            const isCurrentPlayer = players.some((player) => player.id === searchedPlayer.id);
                            const incomingRequestForSearchedPlayer = incomingRequests.find(
                                (request) => request.sender.id === searchedPlayer.id
                            );
                            const outgoingRequestForSearchedPlayer = outgoingRequests.find(
                                (request) => request.receiver.id === searchedPlayer.id
                            );
                            const isUpdatingThisPlayer = updatingPlayerId === searchedPlayer.id;

                            return (
                                <div
                                    key={searchedPlayer.id}
                                    className="rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        {renderProfileAvatar(searchedPlayer.username, searchedPlayer.first_name, searchedPlayer.profile_photo_url)}
                                        <div className="min-w-0">
                                            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{text.findPlayer}</p>
                                            <Link
                                                href={`/player-profile/${searchedPlayer.id}`}
                                                className="mt-1 block text-xl font-bold text-stone-100 transition hover:text-amber-300"
                                            >
                                                {searchedPlayer.username}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-3">
                                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{text.dateOfBirth}</p>
                                            <p className="mt-2 font-medium text-stone-200">
                                                <LocalizedDateText value={searchedPlayer.date_of_birth} fallback={text.notAvailable} />
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
                                            disabled={isUpdatingThisPlayer}
                                            onClick={() => void handleRemovePlayer(searchedPlayer)}
                                            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                                        >
                                            {isUpdatingThisPlayer ? text.saving : text.removePlayer}
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
                                            disabled={isUpdatingThisPlayer}
                                            onClick={() => void handlePlayerRequest(searchedPlayer)}
                                            className="mt-5 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                                        >
                                            {isUpdatingThisPlayer ? text.sending : text.sendRequest}
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
                ) : null}
            </div>
            </div>
        </div>
    );
}

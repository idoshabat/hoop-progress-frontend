"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
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
    const { isHebrew } = useLanguage();
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

    const text = isHebrew
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
            description: "חפש שחקנים ונהל בקשות נכנסות ויוצאות.",
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
            requestFrom: "בקשה מאת",
            sentOn: "נשלח בתאריך",
            accept: "אשר",
            reject: "דחה",
            outgoingRequests: "בקשות יוצאות",
            noOutgoingRequests: "אין בקשות יוצאות.",
            requestTo: "בקשה אל",
            waitingForResponse: "ממתין לתגובה.",
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
            description: "Search for players and manage incoming or outgoing requests.",
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
            requestFrom: "Request from",
            sentOn: "Sent on",
            accept: "Accept",
            reject: "Reject",
            outgoingRequests: "Outgoing Requests",
            noOutgoingRequests: "No outgoing requests.",
            requestTo: "Request to",
            waitingForResponse: "Waiting for response.",
        };

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

        load();
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
                message:
                    action === "accept"
                        ? text.requestAcceptedMessage
                        : text.requestRejectedMessage,
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

    const isCurrentPlayer = searchedPlayer ? players.some((player) => player.id === searchedPlayer.id) : false;
    const incomingRequestForSearchedPlayer = searchedPlayer
        ? incomingRequests.find((request) => request.sender.id === searchedPlayer.id)
        : undefined;
    const outgoingRequestForSearchedPlayer = searchedPlayer
        ? outgoingRequests.find((request) => request.receiver.id === searchedPlayer.id)
        : undefined;

    return (
        <div className="container mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold">{text.title}</h1>
                    <p className="text-gray-500">{text.description}</p>
                </div>
                <Link href="/coach-dashboard" className="text-amber-300 hover:text-amber-200 hover:underline">{text.backToDashboard}</Link>
            </div>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-xl font-semibold">{text.findPlayer}</h2>
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        placeholder={text.searchPlaceholder}
                        className="flex-1 rounded border border-gray-300 p-3"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="rounded bg-amber-500 px-4 py-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                        {searching ? text.searching : text.search}
                    </button>
                </form>

                {searchMessage && <p className="mt-3 text-sm text-red-500">{searchMessage}</p>}
                {actionMessage && <p className="mt-3 text-sm text-red-500">{actionMessage}</p>}

                {searchedPlayer && (
                    <div className="mt-5 rounded-lg border border-gray-200 p-4">
                        <Link
                            href={`/player-profile/${searchedPlayer.id}`}
                            className="text-lg font-bold text-stone-100 hover:text-amber-300"
                        >
                            {searchedPlayer.username}
                        </Link>
                        <p className="mt-1 text-gray-500">{text.dateOfBirth}: {searchedPlayer.date_of_birth || text.notAvailable}</p>
                        <p className="mt-1 text-gray-500">{text.position}: {searchedPlayer.position}</p>
                        <p className="mt-1 text-gray-500">
                            {text.height}: {searchedPlayer.height_cm ? `${searchedPlayer.height_cm} cm` : text.notAvailable}
                        </p>

                        {isCurrentPlayer ? (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handleRemovePlayer}
                                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {updatingPlayer ? text.saving : text.removePlayer}
                            </button>
                        ) : incomingRequestForSearchedPlayer ? (
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "accept")}
                                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? text.saving : text.acceptRequest}
                                </button>
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "reject")}
                                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? text.saving : text.rejectRequest}
                                </button>
                            </div>
                        ) : outgoingRequestForSearchedPlayer ? (
                            <p className="mt-4 text-sm font-medium text-amber-600">{text.requestPending}</p>
                        ) : (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handlePlayerRequest}
                                className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {updatingPlayer ? text.sending : text.sendRequest}
                            </button>
                        )}
                    </div>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-2xl font-semibold">{text.incomingRequests}</h2>
                {incomingRequests.length === 0 ? (
                    <p className="text-gray-500">{text.noIncomingRequests}</p>
                ) : (
                    <ul className="space-y-4">
                        {incomingRequests.map((request) => (
                            <li key={request.id} className="rounded-lg border border-gray-200 p-4">
                                <Link
                                    href={`/player-profile/${request.sender.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {text.requestFrom} {request.sender_username}
                                </Link>
                                <p className="mt-1 text-gray-500">
                                    {text.sentOn} {new Date(request.created_at).toLocaleString(isHebrew ? "he-IL" : "en-US")}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        disabled={respondingRequestId === request.id}
                                        onClick={() => handleRespondToRequest(request.id, "accept")}
                                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {respondingRequestId === request.id ? text.saving : text.accept}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={respondingRequestId === request.id}
                                        onClick={() => handleRespondToRequest(request.id, "reject")}
                                        className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        {respondingRequestId === request.id ? text.saving : text.reject}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-2xl font-semibold">{text.outgoingRequests}</h2>
                {outgoingRequests.length === 0 ? (
                    <p className="text-gray-500">{text.noOutgoingRequests}</p>
                ) : (
                    <ul className="space-y-4">
                        {outgoingRequests.map((request) => (
                            <li key={request.id} className="rounded-lg border border-gray-200 p-4">
                                <Link
                                    href={`/player-profile/${request.receiver.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {text.requestTo} {request.receiver_username}
                                </Link>
                                <p className="mt-1 text-gray-500">
                                    {text.sentOn} {new Date(request.created_at).toLocaleString(isHebrew ? "he-IL" : "en-US")}
                                </p>
                                <p className="mt-2 text-sm font-medium text-amber-600">{text.waitingForResponse}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
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

    const loadPageData = async () => {
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
            setError("Failed to load players.");
        }
    };

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
    }, [authLoading, user]);

    const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedUsername = searchUsername.trim();
        if (!trimmedUsername) {
            setSearchedPlayer(null);
            setSearchMessage("Please enter a player username.");
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
                setSearchMessage("No such player.");
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

            if (status === 404) setSearchMessage("No such player.");
            else setSearchMessage("Failed to search for player.");
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
                title: "Request Sent",
                message: `Your connection request to ${searchedPlayer.username} was sent.`,
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to send connection request."));
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
                title: "Player Removed",
                message: `${searchedPlayer.username} was removed successfully.`,
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to remove player."));
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
                title: action === "accept" ? "Request Accepted" : "Request Rejected",
                message:
                    action === "accept"
                        ? "The player is now connected to your account."
                        : "The connection request was rejected.",
            });
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to update connection request."));
        } finally {
            setRespondingRequestId(null);
        }
    };

    if (authLoading || loading) return <p className="p-6">Loading player management...</p>;
    if (!user) return <p className="p-6">Please log in to manage players.</p>;
    if (user.role !== "COACH") return <p className="p-6 text-red-500">Access denied. Coaches only.</p>;
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
                    <h1 className="mb-2 text-3xl font-bold">Manage Players</h1>
                    <p className="text-gray-500">Search for players and manage incoming or outgoing requests.</p>
                </div>
                <Link href="/coach-dashboard" className="text-amber-300 hover:text-amber-200 hover:underline">Back to Coach Dashboard</Link>
            </div>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-xl font-semibold">Find a Player</h2>
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        placeholder="Enter player username"
                        className="flex-1 rounded border border-gray-300 p-3"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="rounded bg-amber-500 px-4 py-3 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                        {searching ? "Searching..." : "Search"}
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
                        <p className="mt-1 text-gray-500">Date of birth: {searchedPlayer.date_of_birth || "N/A"}</p>
                        <p className="mt-1 text-gray-500">Position: {searchedPlayer.position}</p>
                        <p className="mt-1 text-gray-500">
                            Height: {searchedPlayer.height_cm ? `${searchedPlayer.height_cm} cm` : "N/A"}
                        </p>

                        {isCurrentPlayer ? (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handleRemovePlayer}
                                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {updatingPlayer ? "Saving..." : "Remove player"}
                            </button>
                        ) : incomingRequestForSearchedPlayer ? (
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "accept")}
                                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? "Saving..." : "Accept request"}
                                </button>
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedPlayer.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedPlayer.id, "reject")}
                                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedPlayer.id ? "Saving..." : "Reject request"}
                                </button>
                            </div>
                        ) : outgoingRequestForSearchedPlayer ? (
                            <p className="mt-4 text-sm font-medium text-amber-600">Request already sent. Waiting for response.</p>
                        ) : (
                            <button
                                type="button"
                                disabled={updatingPlayer}
                                onClick={handlePlayerRequest}
                                className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {updatingPlayer ? "Sending..." : "Send request"}
                            </button>
                        )}
                    </div>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-2xl font-semibold">Incoming Requests</h2>
                {incomingRequests.length === 0 ? (
                    <p className="text-gray-500">No incoming requests.</p>
                ) : (
                    <ul className="space-y-4">
                        {incomingRequests.map((request) => (
                            <li key={request.id} className="rounded-lg border border-gray-200 p-4">
                                <Link
                                    href={`/player-profile/${request.sender.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    Request from {request.sender_username}
                                </Link>
                                <p className="mt-1 text-gray-500">Sent on {new Date(request.created_at).toLocaleString()}</p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        disabled={respondingRequestId === request.id}
                                        onClick={() => handleRespondToRequest(request.id, "accept")}
                                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {respondingRequestId === request.id ? "Saving..." : "Accept"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={respondingRequestId === request.id}
                                        onClick={() => handleRespondToRequest(request.id, "reject")}
                                        className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        {respondingRequestId === request.id ? "Saving..." : "Reject"}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-2xl font-semibold">Outgoing Requests</h2>
                {outgoingRequests.length === 0 ? (
                    <p className="text-gray-500">No outgoing requests.</p>
                ) : (
                    <ul className="space-y-4">
                        {outgoingRequests.map((request) => (
                            <li key={request.id} className="rounded-lg border border-gray-200 p-4">
                                <Link
                                    href={`/player-profile/${request.receiver.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    Request to {request.receiver_username}
                                </Link>
                                <p className="mt-1 text-gray-500">Sent on {new Date(request.created_at).toLocaleString()}</p>
                                <p className="mt-2 text-sm font-medium text-amber-600">Waiting for response.</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

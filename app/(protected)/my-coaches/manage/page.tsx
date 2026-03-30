"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
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

    const loadPageData = async () => {
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
            setError("Failed to load coaches.");
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
            setSearchedCoach(null);
            setSearchMessage("Please enter a coach username.");
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
                setSearchMessage("No such coach.");
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

            if (status === 404) setSearchMessage("No such coach.");
            else setSearchMessage("Failed to search for coach.");
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
            setActionMessage("Connection request sent.");
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to send connection request."));
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
            setActionMessage("Coach removed successfully.");
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to remove coach."));
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
            setActionMessage(
                action === "accept" ? "Connection request accepted." : "Connection request rejected."
            );
        } catch (err) {
            console.error(err);
            setActionMessage(getErrorMessage(err, "Failed to update connection request."));
        } finally {
            setRespondingRequestId(null);
        }
    };

    if (authLoading || loading) return <p className="p-6">Loading coach management...</p>;
    if (!user) return <p className="p-6">Please log in to manage coaches.</p>;
    if (user.role !== "PLAYER") return <p className="p-6 text-red-500">Access denied. Players only.</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;

    const isCurrentCoach = searchedCoach ? coaches.some((coach) => coach.id === searchedCoach.id) : false;
    const incomingRequestForSearchedCoach = searchedCoach
        ? incomingRequests.find((request) => request.sender.id === searchedCoach.id)
        : undefined;
    const outgoingRequestForSearchedCoach = searchedCoach
        ? outgoingRequests.find((request) => request.receiver.id === searchedCoach.id)
        : undefined;

    return (
        <div className="container mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 text-3xl font-bold">Manage Coaches</h1>
                    <p className="text-gray-500">Search for coaches and manage incoming or outgoing requests.</p>
                </div>
                <Link href="/my-coaches" className="text-amber-300 hover:text-amber-200 hover:underline">Back to My Coaches</Link>
            </div>

            <section className="rounded-lg border border-gray-200 p-5">
                <h2 className="mb-4 text-xl font-semibold">Find a Coach</h2>
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        placeholder="Enter coach username"
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
                {actionMessage && <p className="mt-3 text-sm text-green-600">{actionMessage}</p>}

                {searchedCoach && (
                    <div className="mt-5 rounded-lg border border-gray-200 p-4">
                        <Link
                            href={`/coach-profile/${searchedCoach.id}`}
                            className="text-lg font-bold text-stone-100 hover:text-amber-300"
                        >
                            {searchedCoach.username}
                        </Link>
                        <p className="mt-1 text-gray-500">Date of birth: {searchedCoach.date_of_birth || "N/A"}</p>

                        {isCurrentCoach ? (
                            <button
                                type="button"
                                disabled={updatingCoach}
                                onClick={handleRemoveCoach}
                                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {updatingCoach ? "Saving..." : "Remove coach"}
                            </button>
                        ) : incomingRequestForSearchedCoach ? (
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedCoach.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedCoach.id, "accept")}
                                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedCoach.id ? "Saving..." : "Accept request"}
                                </button>
                                <button
                                    type="button"
                                    disabled={respondingRequestId === incomingRequestForSearchedCoach.id}
                                    onClick={() => handleRespondToRequest(incomingRequestForSearchedCoach.id, "reject")}
                                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {respondingRequestId === incomingRequestForSearchedCoach.id ? "Saving..." : "Reject request"}
                                </button>
                            </div>
                        ) : outgoingRequestForSearchedCoach ? (
                            <p className="mt-4 text-sm font-medium text-amber-600">Request already sent. Waiting for response.</p>
                        ) : (
                            <button
                                type="button"
                                disabled={updatingCoach}
                                onClick={handleCoachRequest}
                                className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {updatingCoach ? "Sending..." : "Send request"}
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
                                    href={`/coach-profile/${request.sender.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {request.sender_username}
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
                                    href={`/coach-profile/${request.receiver.id}`}
                                    className="text-lg font-bold text-stone-100 hover:text-amber-300"
                                >
                                    {request.receiver_username}
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

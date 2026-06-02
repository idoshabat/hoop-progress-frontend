"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import { ConnectionRequest } from "@/app/types";

const PREVIEW_LIMIT = 2;

export default function PendingRequestsBanner() {
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user?.role) {
            setRequests([]);
            setLoading(false);
            return;
        }

        const loadRequests = async () => {
            try {
                setLoading(true);
                const res = await api.get("connection-requests/", {
                    params: { status: "pending" },
                });
                setRequests(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [authLoading, user?.role]);

    if (authLoading || loading || !user?.role || requests.length === 0) {
        return null;
    }

    const incomingNames = requests
        .map((request) => request.sender?.username)
        .filter((username): username is string => Boolean(username));
    const previewNames = incomingNames.slice(0, PREVIEW_LIMIT).join(", ");
    const remainingCount = Math.max(incomingNames.length - PREVIEW_LIMIT, 0);
    const details =
        incomingNames.length > 0
            ? isHebrew
              ? `${previewNames}${remainingCount > 0 ? ` ועוד ${remainingCount}` : ""} שלחו ${
                  incomingNames.length === 1 ? "לך בקשת חיבור." : "לך בקשות חיבור."
                }`
              : `${previewNames}${remainingCount > 0 ? ` and ${remainingCount} more` : ""} sent ${
                  incomingNames.length === 1 ? "you a connection request." : "you connection requests."
                }`
            : isHebrew
              ? "יש לך בקשות חיבור ממתינות שמחכות לתשובה שלך."
              : "You have pending connection requests waiting for your response.";

    const manageHref = user.role === "COACH" ? "/coach-dashboard/manage" : "/my-coaches/manage";

    return (
        <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-lg shadow-amber-950/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-lg font-bold text-amber-300">
                        !
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300/80">
                            {isHebrew ? "בקשות ממתינות" : "Pending Requests"}
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-stone-100">
                            {isHebrew
                              ? `${requests.length} בקשות חיבור ממתינות`
                              : `${requests.length} pending connection request${requests.length === 1 ? "" : "s"}`}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
                            {details}
                        </p>
                    </div>
                </div>

                <Link
                    href={manageHref}
                    className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                >
                    {isHebrew ? "פתח בקשות" : "Open requests"}
                </Link>
            </div>
        </section>
    );
}

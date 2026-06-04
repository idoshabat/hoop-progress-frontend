"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function ProfileLookupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isHebrew } = useLanguage();
    const [error, setError] = useState("");
    const username = searchParams.get("username")?.trim() ?? "";
    const role = searchParams.get("role");
    const lookupRole = role === "coach" || role === "player" ? role : null;

    const text = useMemo(
        () =>
            isHebrew
                ? {
                      loading: "מאתר את הפרופיל...",
                      failed: "לא הצלחנו לאתר את הפרופיל המבוקש.",
                      fallback: "חזרה לניהול חיבורים",
                  }
                : {
                      loading: "Finding profile...",
                      failed: "We couldn't find the requested profile.",
                      fallback: "Back to connection management",
                  },
        [isHebrew]
    );

    useEffect(() => {
        if (!username || !lookupRole) {
            return;
        }

        const lookupProfile = async () => {
            try {
                const endpoint = lookupRole === "coach" ? "find-coach/" : "find-player/";
                const profileRoute = lookupRole === "coach" ? "/coach-profile" : "/player-profile";
                const res = await api.get(endpoint, {
                    params: { username },
                });

                const result = Array.isArray(res.data) ? res.data[0] : res.data;

                if (!result?.id) {
                    setError(text.failed);
                    return;
                }

                router.replace(`${profileRoute}/${result.id}`);
            } catch (err) {
                console.error(err);
                setError(text.failed);
            }
        };

        void lookupProfile();
    }, [lookupRole, router, text.failed, username]);

    const fallbackHref = lookupRole === "coach" ? "/my-coaches/manage" : "/coach-dashboard/manage";
    const invalidParams = !username || !lookupRole;

    return (
        <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
            {error || invalidParams ? (
                <>
                    <p className="text-lg font-medium text-red-400">{error || text.failed}</p>
                    <button
                        type="button"
                        onClick={() => router.replace(fallbackHref)}
                        className="mt-6 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                    >
                        {text.fallback}
                    </button>
                </>
            ) : (
                <>
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500" />
                    <p className="mt-4 text-stone-300">{text.loading}</p>
                </>
            )}
        </div>
    );
}

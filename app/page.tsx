"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 🔁 Redirect logged-in users into the app
    useEffect(() => {
        if (!loading && user) {
            router.replace("/stats");
        }
    }, [loading, user, router]);

    // ⏳ Wait for auth to resolve
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    // 🔓 Public landing page
    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
                <h1 className="text-4xl font-bold mb-4 text-amber-500">
                    🏀 Track. Train. Improve.
                </h1>

                <p className="max-w-xl text-gray-600 dark:text-gray-400 mb-8">
                    A smart basketball workout tracker that helps you stay
                    consistent, visualize progress, and hit your shooting goals.
                </p>

                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="rounded bg-amber-500 px-6 py-3 text-white font-semibold hover:bg-amber-600 transition"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="rounded border border-amber-500 px-6 py-3 font-semibold text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-900 transition"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        );
    }

    // 👀 Fallback (should never be seen)
    return null;
}

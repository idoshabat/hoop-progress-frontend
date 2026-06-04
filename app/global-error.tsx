"use client";

import ErrorState from "@/app/Components/ErrorState";

export default function GlobalError() {
    return (
        <html>
            <body className="min-h-screen bg-zinc-950 text-stone-100">
                <ErrorState
                    title="App unavailable"
                    description="A critical error interrupted the app. Refreshing the page usually gets things back on track."
                    actionLabel="Refresh"
                    onAction={() => window.location.reload()}
                />
            </body>
        </html>
    );
}

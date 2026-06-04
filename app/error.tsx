"use client";

import { useEffect } from "react";
import ErrorState from "@/app/Components/ErrorState";

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorState
            title="Something went wrong"
            description="The page hit an unexpected issue. You can try again without losing your place."
            actionLabel="Try again"
            onAction={reset}
        />
    );
}

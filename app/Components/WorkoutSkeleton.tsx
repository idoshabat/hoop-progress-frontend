import { Skeleton } from "./Skeleton";

export default function WorkoutsSkeleton() {
    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* In Progress Section */}
            <section className="space-y-4">
                <Skeleton className="h-6 w-56" />

                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <WorkoutCardSkeleton key={`progress-${i}`} />
                    ))}
                </div>
            </section>

            {/* Completed Section */}
            <section className="space-y-4">
                <Skeleton className="h-6 w-64" />

                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <WorkoutCardSkeleton key={`completed-${i}`} />
                    ))}
                </div>
            </section>
        </div>
    );
}

/* ---------- Card Skeleton ---------- */
function WorkoutCardSkeleton() {
    return (
        <div className="border rounded p-4 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
}

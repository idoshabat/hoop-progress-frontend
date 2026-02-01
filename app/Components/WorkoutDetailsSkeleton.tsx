import { Skeleton } from "./Skeleton";

export default function WorkoutDetailsSkeleton() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Skeleton className="h-8 w-64" />

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border rounded p-4 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <Skeleton className="h-4 w-full" />

            {/* Sessions */}
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="border rounded p-4 flex justify-between"
                    >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="border rounded p-4 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

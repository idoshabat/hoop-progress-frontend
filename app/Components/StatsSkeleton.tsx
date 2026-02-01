import { Skeleton } from "./Skeleton";

export default function StatsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            {/* Title */}
            <Skeleton className="h-8 w-64" />

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="border rounded p-4 text-center space-y-2"
                    >
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-8 w-16 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded p-4 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>

                <div className="border rounded p-4 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
}

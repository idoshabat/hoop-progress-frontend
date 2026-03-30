import Link from "next/link";
import type { Workout } from "@/app/types";

type WorkoutCardProps = {
    workout: Workout;
    sourceLabel: string;
    sourceTone: string;
};

export default function WorkoutCard({
    workout,
    sourceLabel,
    sourceTone,
}: WorkoutCardProps) {
    return (
        <Link
            href={`/workouts/${workout.id}`}
            className="block rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-stone-100 shadow-sm transition-shadow hover:border-amber-500/40 hover:shadow-md"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-stone-100">{workout.name}</h3>
                    <p className="mt-1 text-sm text-stone-400">
                        Created at: {new Date(workout.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${sourceTone}`}>
                        {sourceLabel}
                    </span>
                    <span
                        className={`rounded-full px-3 py-1 ${
                            workout.is_completed
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-amber-500/15 text-amber-300"
                        }`}
                    >
                        {workout.is_completed ? "Completed" : "In Progress"}
                    </span>
                </div>
            </div>

            <p className="mt-4">
                Attempts: {workout.total_makes}/{workout.total_attempts}
            </p>
            <p className="mt-1">
                Sessions: {workout.num_of_sessions}/{workout.target_sessions}
            </p>
            <p className="mt-1">
                Goal: {workout.goal_percentage}%
            </p>
            {!workout.is_completed &&(
                <p className={`mt-1 ${workout.average_percentage >= workout.goal_percentage ? "text-green-600" : "text-red-500"} font-semibold`}>
                    Current Avg: {workout.average_percentage.toFixed(1)}%
                </p>
            )}

            {workout.is_completed && (
                <p className="mt-2 font-semibold">
                    Result:{" "}
                    {workout.is_successful ? (
                        <span className="text-green-600">Goal Achieved✅</span>
                    ) : (
                        <span className="text-red-500">Goal Not Achieved❌</span>
                    )}
                </p>
            )}
        </Link>
    );
}

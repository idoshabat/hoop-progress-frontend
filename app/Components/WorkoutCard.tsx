"use client";

import Link from "next/link";
import type { Workout } from "@/app/types";
import { useLanguage } from "@/app/Context/LanguageContext";

type WorkoutCardProps = {
    workout: Workout;
    sourceLabel: string;
    sourceTone: string;
    showRetryButton?: boolean;
    onRetry?: (workout: Workout) => Promise<void> | void;
    isRetrying?: boolean;
};

export default function WorkoutCard({
    workout,
    sourceLabel,
    sourceTone,
    showRetryButton = false,
    onRetry,
    isRetrying = false,
}: WorkoutCardProps) {
    const { isHebrew, language } = useLanguage();

    return (
        <Link
            href={`/workouts/${workout.id}`}
            className="block rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-stone-100 shadow-sm transition-shadow hover:border-amber-500/40 hover:shadow-md"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-stone-100">{workout.name}</h3>
                    <p className="mt-1 text-sm text-stone-400">
                        {isHebrew ? "נוצר בתאריך:" : "Created at:"}{" "}
                        {new Date(workout.created_at).toLocaleString(language === "he" ? "he-IL" : "en-US")}
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
                        {workout.is_completed
                            ? isHebrew
                                ? "הושלם"
                                : "Completed"
                            : isHebrew
                              ? "בתהליך"
                              : "In Progress"}
                    </span>
                </div>
            </div>

            <p className="mt-4">
                {isHebrew ? "ניסיונות:" : "Attempts:"} {workout.total_makes}/{workout.total_attempts}
            </p>
            <p className="mt-1">
                {isHebrew ? "סשנים:" : "Sessions:"} {workout.num_of_sessions}/{workout.target_sessions}
            </p>
            <p className="mt-1">
                {isHebrew ? "יעד:" : "Goal:"} {workout.goal_percentage}%
            </p>
            {!workout.is_completed &&(
                <p className={`mt-1 ${workout.average_percentage >= workout.goal_percentage ? "text-green-600" : "text-red-500"} font-semibold`}>
                    {isHebrew ? "ממוצע נוכחי:" : "Current Avg:"} {workout.average_percentage.toFixed(1)}%
                </p>
            )}

            {workout.is_completed && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">
                        {isHebrew ? "תוצאה:" : "Result:"}{" "}
                        {workout.is_successful ? (
                            <span className="text-green-600">
                                {isHebrew ? "היעד הושג ✅" : "Goal Achieved✅"}
                            </span>
                        ) : (
                            <span className="text-red-500">
                                {isHebrew ? "היעד לא הושג ❌" : "Goal Not Achieved❌"}
                            </span>
                        )}
                    </p>

                    {showRetryButton && onRetry ? (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void onRetry(workout);
                            }}
                            disabled={isRetrying}
                            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRetrying
                                ? isHebrew
                                    ? "יוצר..."
                                    : "Creating..."
                                : isHebrew
                                  ? "ניסיון חוזר"
                                  : "Retry Workout"}
                        </button>
                    ) : null}
                </div>
            )}
        </Link>
    );
}

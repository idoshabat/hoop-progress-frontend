"use client";

import type { Workout } from "@/app/types";
import { useLanguage } from "@/app/Context/LanguageContext";
import WorkoutCard from "@/app/Components/WorkoutCard";
import SectionSurface from "@/app/Components/SectionSurface";

type WorkoutGroupProps = {
    title: string;
    description: string;
    inProgress: Workout[];
    completed: Workout[];
    sourceLabel: string;
    sourceTone: string;
    showRetryButton?: boolean;
    onRetry?: (workout: Workout) => Promise<void>;
    retryingWorkoutId?: number | null;
};

export default function WorkoutGroup({
    title,
    description,
    inProgress,
    completed,
    sourceLabel,
    sourceTone,
    showRetryButton = false,
    onRetry,
    retryingWorkoutId = null,
}: WorkoutGroupProps) {
    const { isHebrew } = useLanguage();

    return (
        <SectionSurface
            title={title}
            description={description}
            action={
                <div className="flex gap-2 text-sm font-medium">
                    <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-stone-300">
                        {inProgress.length} {isHebrew ? "בתהליך" : "in progress"}
                    </span>
                    <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-stone-300">
                        {completed.length} {isHebrew ? "הושלמו" : "completed"}
                    </span>
                </div>
            }
        >
            <div className="space-y-8">
                <div>
                    <h3 className="mb-4 text-lg font-semibold text-stone-200">
                        {isHebrew ? "בתהליך" : "In Progress"}
                    </h3>
                    {inProgress.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {isHebrew ? "אין כאן אימונים פעילים כרגע." : "No workouts in progress here."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {inProgress.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    sourceLabel={sourceLabel}
                                    sourceTone={sourceTone}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-semibold text-stone-200">
                        {isHebrew ? "הושלמו" : "Completed"}
                    </h3>
                    {completed.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-5 text-stone-500">
                            {isHebrew ? "עדיין אין כאן אימונים שהושלמו." : "No completed workouts here yet."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {completed.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    sourceLabel={sourceLabel}
                                    sourceTone={sourceTone}
                                    showRetryButton={showRetryButton}
                                    onRetry={onRetry}
                                    isRetrying={retryingWorkoutId === workout.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SectionSurface>
    );
}

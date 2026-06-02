"use client";

import type { Workout } from "@/app/types";
import { useLanguage } from "@/app/Context/LanguageContext";
import WorkoutCard from "@/app/Components/WorkoutCard";

type WorkoutGroupProps = {
    title: string;
    description: string;
    inProgress: Workout[];
    completed: Workout[];
    sourceLabel: string;
    sourceTone: string;
};

export default function WorkoutGroup({
    title,
    description,
    inProgress,
    completed,
    sourceLabel,
    sourceTone,
}: WorkoutGroupProps) {
    const { isHebrew } = useLanguage();

    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-stone-100">{title}</h2>
                    <p className="mt-1 text-sm text-stone-400">{description}</p>
                </div>

                <div className="flex gap-2 text-sm font-medium">
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-stone-300">
                        {inProgress.length} {isHebrew ? "בתהליך" : "in progress"}
                    </span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-stone-300">
                        {completed.length} {isHebrew ? "הושלמו" : "completed"}
                    </span>
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div>
                    <h3 className="mb-3 text-lg font-semibold text-stone-200">
                        {isHebrew ? "בתהליך" : "In Progress"}
                    </h3>
                    {inProgress.length === 0 ? (
                        <p className="text-stone-500">
                            {isHebrew ? "אין כאן אימונים פעילים כרגע." : "No workouts in progress here."}
                        </p>
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
                    <h3 className="mb-3 text-lg font-semibold text-stone-200">
                        {isHebrew ? "הושלמו" : "Completed"}
                    </h3>
                    {completed.length === 0 ? (
                        <p className="text-stone-500">
                            {isHebrew ? "עדיין אין כאן אימונים שהושלמו." : "No completed workouts here yet."}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {completed.map((workout) => (
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
            </div>
        </section>
    );
}

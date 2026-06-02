"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/axios";
import { useLanguage } from "@/app/Context/LanguageContext";
import ProgressBar from "@/app/Components/ProgressBar";
import WorkoutDetailsSkeleton from "@/app/Components/WorkoutDetailsSkeleton";
import EmptyState from "@/app/Components/EmptyState";
import ConfirmModal from "@/app/Components/ConfirmModal";
import { Workout } from "@/app/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function WorkoutDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isHebrew, language } = useLanguage();

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const text = isHebrew
        ? {
              failedLoad: "טעינת האימון נכשלה",
              notFound: "האימון לא נמצא",
              successRate: "אחוז הצלחה",
              goalLine: "יעד",
              failedDeleteWorkout: "מחיקת האימון נכשלה",
              deleteSessionConfirm: "למחוק את הסשן הזה?",
              failedDeleteSession: "מחיקת הסשן נכשלה",
              back: "חזרה",
              edit: "ערוך ✏️",
              delete: "מחק 🗑",
              targetAttempts: "מספר זריקות יעד",
              goalPercentage: "אחוז יעד",
              averagePercentage: "ממוצע אחוזים",
              status: "סטטוס",
              completed: "האימון הושלם ✅",
              goalAchieved: "היעד הושג ✅",
              goalMissed: "היעד לא הושג ❌",
              inProgress: "בתהליך 📈",
              locked: "אימון זה הושלם ולא ניתן לשנות אותו יותר.",
              sessions: "סשנים",
              noSessionsTitle: "עדיין אין סשנים 🏀",
              noSessionsDescription: "תעד את הסשן הראשון שלך כדי להתחיל לעקוב אחרי ביצועים והתקדמות.",
              addFirstSession: "הוסף סשן ראשון",
              addSession: "הוסף סשן",
              shots: "זריקות",
              progressGraph: "גרף התקדמות",
              deleteWorkoutTitle: "למחוק את האימון?",
              deleteWorkoutMessage: "אי אפשר לבטל את הפעולה הזו. כל הסשנים וההתקדמות יימחקו לצמיתות.",
              deleteWorkoutConfirm: "כן, מחק",
            }
        : {
              failedLoad: "Failed to load workout",
              notFound: "Workout not found",
              successRate: "Success %",
              goalLine: "Goal",
              failedDeleteWorkout: "Failed to delete workout",
              deleteSessionConfirm: "Delete this session?",
              failedDeleteSession: "Failed to delete session",
              back: "← Back",
              edit: "Edit ✏️",
              delete: "Delete 🗑",
              targetAttempts: "Target Attempts",
              goalPercentage: "Goal Percentage",
              averagePercentage: "Average Percentage",
              status: "Status",
              completed: "Workout completed ✅",
              goalAchieved: "Goal Achieved ✅",
              goalMissed: "Goal Not Achieved ❌",
              inProgress: "In Progress 📈",
              locked: "This workout is completed and can no longer be modified.",
              sessions: "Sessions",
              noSessionsTitle: "No sessions yet 🏀",
              noSessionsDescription: "Log your first session to start tracking your performance and progress.",
              addFirstSession: "Add first session",
              addSession: "Add Session",
              shots: "shots",
              progressGraph: "Progress Graph",
              deleteWorkoutTitle: "Delete workout?",
              deleteWorkoutMessage: "This action cannot be undone. All sessions and progress will be permanently deleted.",
              deleteWorkoutConfirm: "Yes, delete",
            };

    const loadWorkout = useCallback(async () => {
        try {
            const res = await api.get(`workouts/${id}/`);
            setWorkout(res.data);
        } catch (err) {
            console.error(err);
            setError(isHebrew ? "טעינת האימון נכשלה" : "Failed to load workout");
        } finally {
            setLoading(false);
        }
    }, [id, isHebrew]);

    // ✅ Fetch immediately – auth is guaranteed by layout
    useEffect(() => {
        void loadWorkout();
    }, [loadWorkout]);

    // ---- Loading / Error states ----
    if (loading) {
        return <WorkoutDetailsSkeleton />;
    }

    if (error || !workout) {
        return (
            <p className="p-6 text-red-500">
                {error || text.notFound}
            </p>
        );
    }

    // ---- Chart Data ----
    const chartData = workout.sessions.map((s) => ({
        date: new Date(s.date).toLocaleDateString(language === "he" ? "he-IL" : "en-US"),
        [text.successRate]: Number(s.success_rate.toFixed(1)),
        [text.goalLine]: workout.goal_percentage,
    }));

    const handleDeleteWorkout = async () => {
        setDeleting(true);

        try {
            await api.delete(`workouts/${workout.id}/`);
            router.push("/workouts");
        } catch (err) {
            console.error(err);
            alert(text.failedDeleteWorkout);
            setDeleting(false);
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        if (!confirm(text.deleteSessionConfirm)) return;

        try {
            await api.delete(`sessions/${sessionId}/`);
            setWorkout((prev) =>
                prev
                    ? {
                        ...prev,
                        sessions: prev.sessions.filter(
                            (s) => s.id !== sessionId
                        ),
                        num_of_sessions: prev.num_of_sessions - 1,
                    }
                    : prev
            );
        } catch (err: unknown) {
            const detail =
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof err.response === "object" &&
                err.response !== null &&
                "data" in err.response &&
                typeof err.response.data === "object" &&
                err.response.data !== null &&
                "detail" in err.response.data &&
                typeof err.response.data.detail === "string"
                    ? err.response.data.detail
                    : text.failedDeleteSession;
            alert(detail);
        }
    };



    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{workout.name}</h1>

                <div className="flex gap-4">
                    <button
                        onClick={() => router.push("/workouts")}
                        className="text-amber-300 hover:text-amber-200 hover:underline"
                    >
                        {text.back}
                    </button>

                    {workout.num_of_sessions < workout.target_sessions && (
                        <Link
                            href={`/workouts/${workout.id}/edit`}
                            className="text-yellow-600 hover:underline"
                        >
                            {text.edit}
                        </Link>
                    )}




                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-600 hover:underline"
                    >
                        {text.delete}
                    </button>
                </div>
            </div>


            {/* Workout Info */}
            <div className="grid grid-cols-2 gap-4 border p-4 rounded mb-6">
                <div>
                    <p className="text-gray-500">{text.targetAttempts}</p>
                    <p className="font-semibold">{workout.target_attempts}</p>
                </div>

                <div>
                    <p className="text-gray-500">{text.goalPercentage}</p>
                    <p className="font-semibold">{workout.goal_percentage}%</p>
                </div>

                <div>
                    <p className="text-gray-500">{text.averagePercentage}</p>
                    <p className="font-semibold">
                        {workout.average_percentage?.toFixed(1) ?? 0}%
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">{text.status}</p>
                    {workout.num_of_sessions >= workout.target_sessions ? (
                        <>
                            <p className="font-semibold text-green-600">
                                {text.completed}
                            </p>
                            {workout.is_successful ? (
                                <p className="font-semibold text-green-600">
                                    {text.goalAchieved}
                                </p>
                            ) : (
                                <p className="font-semibold text-red-500">
                                    {text.goalMissed}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="font-semibold text-orange-500">
                            {text.inProgress}
                        </p>
                    )}
                </div>
            </div>

            {workout.is_completed && (
                <div className="mb-4 rounded border border-amber-500/40 bg-zinc-900 p-4 text-amber-300">
                    🔒 {text.locked}
                </div>
            )}

            {/* Sessions Progress */}
            <h2 className="text-2xl font-semibold mb-3">
                {text.sessions} {workout.num_of_sessions}/{workout.target_sessions}
            </h2>

            <ProgressBar
                goal={workout.target_sessions}
                current={workout.num_of_sessions}
            />



            {/* Sessions List */}
            {workout.sessions.length === 0 ? (
                <EmptyState
                    title={text.noSessionsTitle}
                    description={text.noSessionsDescription}
                    actionLabel={text.addFirstSession}
                    actionHref={`/workouts/${workout.id}/add-session`}
                />
            ) : (
                <div className="space-y-6 mt-6">
                    {workout.num_of_sessions < workout.target_sessions && (
                        <Link
                            href={`/workouts/${workout.id}/add-session`}
                            className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
                        >
                            {text.addSession}
                        </Link>
                    )}
                    {workout.sessions.map((session) => {
                        const canEdit = workout.num_of_sessions < workout.target_sessions;

                        return (
                            <div
                                key={session.id}
                                className="border p-4 rounded flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {new Date(session.date).toLocaleDateString(language === "he" ? "he-IL" : "en-US")}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {session.makes} / {session.attempts} {text.shots}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="font-bold">
                                        {session.success_rate.toFixed(1)}%
                                    </span>

                                    {canEdit && (
                                        <>
                                            <Link
                                                href={`/workouts/${workout.id}/edit-session/${session.id}/`}
                                                className="text-amber-300 hover:text-amber-200 hover:underline"
                                            >
                                                {isHebrew ? "ערוך" : "Edit"}
                                            </Link>

                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                {isHebrew ? "מחק" : "Delete"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}


                    {/* Graph */}
                    <div className="mt-8 border p-4 rounded">
                        <h3 className="text-xl font-semibold mb-4">
                            {text.progressGraph}
                        </h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey={text.successRate}
                                    stroke="#3b82f6"
                                    dot={{ r: 5 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey={text.goalLine}
                                    stroke="#22c55e"
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <ConfirmModal
                    title={text.deleteWorkoutTitle}
                    message={text.deleteWorkoutMessage}
                    confirmText={text.deleteWorkoutConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteWorkout}
                    loading={deleting}
                />
            )}

        </div>
    );
}

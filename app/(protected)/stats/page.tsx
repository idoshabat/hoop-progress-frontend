"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { StatsOverview } from "@/app/types";
import StatsSkeleton from "@/app/Components/StatsSkeleton";
import ErrorState from "@/app/Components/ErrorState";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function StatsPage() {
    const { isHebrew } = useLanguage();
    const [stats, setStats] = useState<StatsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const text = isHebrew
        ? {
              failed: "טעינת הסטטיסטיקות נכשלה",
              title: "סקירת סטטיסטיקות 📊",
              totalWorkouts: "סך כל האימונים",
              completed: "הושלמו",
              inProgress: "בתהליך",
              successful: "הצליחו",
              failedLabel: "נכשלו",
              successPercentage: "אחוז הצלחה",
              totalSessions: "סך כל הסשנים",
              overallAverage: "ממוצע כללי %",
              progressOverTime: "התקדמות לאורך זמן",
              workoutOutcomes: "תוצאות אימונים",
              avgSuccess: "ממוצע הצלחה %",
          }
        : {
              failed: "Failed to load stats",
              title: "Stats Overview 📊",
              totalWorkouts: "Total Workouts",
              completed: "Completed",
              inProgress: "In Progress",
              successful: "Successful",
              failedLabel: "Failed",
              successPercentage: "Success Percentage",
              totalSessions: "Total Sessions",
              overallAverage: "Overall Avg %",
              progressOverTime: "Progress Over Time",
              workoutOutcomes: "Workout Outcomes",
              avgSuccess: "Avg Success %",
          };

    const loadStats = useCallback(async () => {
        try {
            const res = await api.get("stats/overview/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
            setError(isHebrew ? "טעינת הסטטיסטיקות נכשלה" : "Failed to load stats");
        } finally {
            setLoading(false);
        }
    }, [isHebrew]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    if (loading){
        return <StatsSkeleton />
    }
    if (error || !stats)
        return (
            <ErrorState
                title={isHebrew ? "לא הצלחנו לטעון את הסטטיסטיקות" : "We couldn't load the stats"}
                description={error || text.failed}
                actionLabel={isHebrew ? "נסה שוב" : "Try again"}
                onAction={() => {
                    setLoading(true);
                    setError("");
                    void loadStats();
                }}
            />
        );

    /* ---------- PIE DATA ---------- */
    const statusPieData = [
        { name: text.successful, value: stats.successful_workouts },
        { name: text.failedLabel, value: stats.failed_workouts },
        { name: text.inProgress, value: stats.in_progress_workouts },
    ];

    const PIE_COLORS = ["#22c55e", "#ef4444", "#f97316"];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold">{text.title}</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                <StatCard title={text.totalWorkouts} value={stats.total_workouts} />
                <StatCard title={text.completed} value={stats.completed_workouts} />
                <StatCard title={text.inProgress} value={stats.in_progress_workouts} />
                <StatCard title={text.successful} value={stats.successful_workouts} color="text-green-500" />
                <StatCard title={text.failedLabel} value={stats.failed_workouts} color="text-red-500" />
                <StatCard title={text.successPercentage} value={`${stats.completed_success_rate.toFixed(1)}%`} />
                <StatCard title={text.totalSessions} value={stats.total_sessions} />
                <StatCard title={text.overallAverage} value={`${stats.overall_success_rate.toFixed(1)}%`} />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">{text.progressOverTime}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.progress_over_time}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="avg_success_rate"
                                name={text.avgSuccess}
                                stroke="#3b82f6"
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">{text.workoutOutcomes}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusPieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {statusPieData.map((_, index) => (
                                    <Cell key={index} fill={PIE_COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

/* ---------- Reusable Card ---------- */
function StatCard({
    title,
    value,
    color = "text-grey-500"
}: {
    title: string;
    value: number | string;
    color?: string;
}) {
    return (
        <div className="border rounded p-4 text-center shadow-sm">
            <p className={`${color} text-sm`}>{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
}

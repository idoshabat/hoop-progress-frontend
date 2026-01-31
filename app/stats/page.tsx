"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { StatsOverview } from "@/app/types";
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




export default function StatsPage() {
    const { user, loading: authLoading } = useAuth();

    const [stats, setStats] = useState<StatsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setError("Not authenticated");
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await api.get("stats/overview/");
                setStats(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [authLoading, user]);

    if (loading) return <p className="p-6">Loading stats...</p>;
    if (error || !stats) return <p className="p-6 text-red-500">{error}</p>;

    /* ---------- PIE DATA ---------- */
    const statusPieData = [
        { name: "Successful", value: stats.successful_workouts },
        { name: "Failed", value: stats.failed_workouts },
        { name: "In Progress", value: stats.in_progress_workouts },
    ];

    const PIE_COLORS = ["#22c55e", "#ef4444", "#f97316"];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold">Stats Overview 📊</h1>

            {/* ---------- STAT CARDS ---------- */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                <StatCard title="Total Workouts" value={stats.total_workouts} />
                <StatCard title="Completed" value={stats.completed_workouts} />
                <StatCard title="In Progress" value={stats.in_progress_workouts} />
                <StatCard title="Successful" value={stats.successful_workouts} color="text-green-500" />
                <StatCard title="Failed" value={stats.failed_workouts} color="text-red-500" />
                <StatCard title="Total Sessions" value={stats.total_sessions} />
                <StatCard
                    title="Overall Avg %"
                    value={`${stats.overall_success_rate.toFixed(1)}%`}
                />

                <StatCard
                    title="Best Workout"
                    value={
                        stats.best_workout_name
                            ? `${stats.best_workout_name} (${stats.best_workout_success_rate.toFixed(1)}%)`
                            : "—"
                    }
                />
                <StatCard
                    title="Completed Success Rate"
                    value={`${stats.completed_success_rate.toFixed(1)}%`}
                />


            </div>

            {/* ---------- CHARTS ---------- */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Progress Line Chart */}
                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">
                        Progress Over Time
                    </h2>
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
                                name="Avg Success %"
                                stroke="#3b82f6"
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Workout Outcome Pie Chart */}
                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">
                        Workout Outcomes
                    </h2>
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
                                    <Cell
                                        key={index}
                                        fill={PIE_COLORS[index]}
                                    />
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
    color="text-grey-500"
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

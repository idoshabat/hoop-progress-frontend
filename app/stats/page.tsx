"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
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

type ProgressPoint = {
    date: string;
    avg_success_rate: number;
};

type StatsOverview = {
    total_workouts: number;
    completed_workouts: number;
    in_progress_workouts: number;
    total_sessions: number;
    overall_avg_success_rate: number;
    best_workout_success_rate: number;
    progress_over_time: ProgressPoint[];
};

export default function StatsPage() {
    const [stats, setStats] = useState<StatsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, loading: authLoading } = useAuth();


    useEffect(() => {
    if (!authLoading && user) {
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
    }
}, [authLoading, user]);

    useEffect(() => {
        if (!authLoading && user) {
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
        }
    }, [authLoading, user]);

    if (loading) return <p className="p-6">Loading stats...</p>;
    if (error || !stats) return <p className="p-6 text-red-500">{error}</p>;

    const pieData = [
        { name: "Completed", value: stats.completed_workouts },
        { name: "In Progress", value: stats.in_progress_workouts },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold">Stats Overview 📊</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Workouts" value={stats.total_workouts} />
                <StatCard title="Completed Workouts" value={stats.completed_workouts} />
                <StatCard title="In Progress" value={stats.in_progress_workouts} />
                <StatCard title="Total Sessions" value={stats.total_sessions} />
                <StatCard
                    title="Overall Avg %"
                    value={`${stats?.overall_avg_success_rate?.toFixed(1) ?? 0}%`}
                />
                <StatCard
                    title="Best Workout %"
                    value={`${stats.best_workout_success_rate.toFixed(1)}%`}
                />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Progress Line Chart */}
                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
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

                {/* Completion Pie Chart */}
                <div className="border rounded p-4">
                    <h2 className="text-xl font-semibold mb-4">Workout Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                <Cell fill="#22c55e" />
                                <Cell fill="#f97316" />
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

function StatCard({ title, value }: { title: string; value: number | string }) {
    return (
        <div className="border rounded p-4 text-center shadow-sm">
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
}

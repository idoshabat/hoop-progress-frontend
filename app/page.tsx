"use client";

import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // 🔓 Public landing page
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
        <h1 className="text-4xl font-bold mb-4 text-amber-500">
          🏀 Track. Train. Improve.
        </h1>

        <p className="max-w-xl text-gray-600 dark:text-gray-400 mb-8">
          A smart basketball workout tracker that helps you stay
          consistent, visualize progress, and hit your shooting goals.
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded bg-amber-500 px-6 py-3 text-white font-semibold hover:bg-amber-600 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded border border-amber-500 px-6 py-3 font-semibold text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-900 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  // 🏀 Logged-in user homepage
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-amber-500 mb-2">
            Welcome back, {user.username || "Player"} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to improve your game today?
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          <Link
            href="/workouts"
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-105"
          >
            <h2 className="text-xl font-semibold mb-2">🏀 Workouts</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Log your shooting sessions and training routines.
            </p>
          </Link>

          <Link
            href="/stats"
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-105"
          >
            <h2 className="text-xl font-semibold mb-2">📊 Stats</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your shooting percentages and improvement over time.
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-105"
          >
            <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account and training goals.
            </p>
          </Link>

        </div>

        {/* Quick Action */}
        <div className="mt-10 text-center">
          <Link
            href="/workouts/create"
            className="inline-block bg-amber-500 px-8 py-3 rounded-lg text-white font-semibold hover:bg-amber-600 transition"
          >
            ➕ Log New Workout
          </Link>
        </div>

      </div>
    </div>
  );
}
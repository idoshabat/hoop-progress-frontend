"use client";

import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    // optional: show nothing or a skeleton while checking auth
    return (
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <span>Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold">
        🏀 HoopProgress
      </Link>

      {/* Links */}
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/workouts" className="hover:text-gray-300">
              Workouts
            </Link>
            <Link href="/stats" className="hover:text-gray-300">
              Stats
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <span>Loading...</span>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          🏀 HoopProgress
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/profile" className="hover:text-gray-300">
                Profile
              </Link>
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

        {/* Burger Button */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link href="/workouts" onClick={() => setMenuOpen(false)}>
                Workouts
              </Link>
              <Link href="/stats" onClick={() => setMenuOpen(false)}>
                Stats
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 w-fit"
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between">
        Loading...
      </nav>
    );
  }

  return (
    <nav className="bg-gray-400 backdrop-blur-md text-black shadow-md sticky top-0 z-50">
      <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-wide hover:text-orange-400 transition "
        >
          🏀 HoopProgress
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-lg font-medium">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hover:text-orange-400 transition"
              >
                Profile
              </Link>

              <Link
                href="/workouts"
                className="hover:text-orange-400 transition"
              >
                Workouts
              </Link>

              <Link
                href="/stats"
                className="hover:text-orange-400 transition"
              >
                Stats
              </Link>

              <button
                onClick={logout}
                className="bg-transparent text-red-500 px-4 py-2 rounded-lg cursor-pointer hover:text-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-orange-400 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Burger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
        >
          <span
            className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? "rotate-45" : "-translate-y-2"
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? "-rotate-45" : "translate-y-2"
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 flex flex-col gap-4 text-center font-medium bg-gray-900">
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                Profile
              </Link>

              <Link
                href="/workouts"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                Workouts
              </Link>

              <Link
                href="/stats"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                Stats
              </Link>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="bg-transparent text-red-500 cursor-pointer px-4 py-2 rounded-lg hover:text-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
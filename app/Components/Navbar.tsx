"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import NotificationBell from "@/app/Components/NotificationBell";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className="flex justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-stone-100">
        Loading...
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 text-stone-100 shadow-md backdrop-blur-md">
      <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-amber-400 hover:text-amber-300 transition "
        >
          🏀 HoopProgress
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-lg font-medium">
          {user ? (
            user.role === "PLAYER" ? (
              <>
                <Link
                  href="/player-profile"
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
                <Link
                  href="/player-calendar"
                  className="hover:text-orange-400 transition"
                >
                  Calendar
                </Link>
                <Link
                  href="/my-coaches"
                  className="hover:text-orange-400 transition"
                >
                  My Coaches
                </Link>
                <NotificationBell />
                <button
                  onClick={logout}
                  className="bg-transparent text-red-500 cursor-pointer px-4 py-2 rounded-lg hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/coach-profile"
                  className="hover:text-orange-400 transition"
                >
                  Profile
                </Link>

                <Link
                  href="/coach-dashboard"
                  className="hover:text-orange-400 transition"
                >
                  Coach Dashboard
                </Link>
                <Link
                  href="/coach-calendar"
                  className="hover:text-orange-400 transition"
                >
                  Calendar
                </Link>
                <Link
                  href="/templates"
                  className="hover:text-orange-400 transition"
                >
                  Templates
                </Link>
                <NotificationBell />
                <button
                  onClick={logout}
                  className="bg-transparent text-red-500 cursor-pointer px-4 py-2 rounded-lg hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            )
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
            className={`absolute h-0.5 w-6 bg-stone-100 transition-all duration-300 ${menuOpen ? "rotate-45" : "-translate-y-2"
              }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-stone-100 transition-all duration-300 ${menuOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-stone-100 transition-all duration-300 ${menuOpen ? "-rotate-45" : "translate-y-2"
              }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-zinc-950 px-6 pb-6 flex flex-col gap-4 text-center font-medium text-stone-100">
          {user ? (
            <>
              <Link
                href={user.role === "COACH" ? "/coach-profile" : "/player-profile"}
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                Profile
              </Link>

              {user.role === "COACH" ? (
                <>
                  <Link
                    href="/coach-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    Coach Dashboard
                  </Link>
                  <Link
                    href="/coach-calendar"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/templates"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    Templates
                  </Link>
                </>
              ) : (
                <>
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
                  <Link
                    href="/player-calendar"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/my-coaches"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    My Coaches
                  </Link>
                </>
              )}

              <div className="flex justify-center">
                <NotificationBell />
              </div>

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

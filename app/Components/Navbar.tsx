"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import NotificationBell from "@/app/Components/NotificationBell";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { language, isHebrew, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const text = isHebrew
    ? {
        loading: "טוען...",
        profile: "פרופיל",
        workouts: "אימונים",
        stats: "סטטיסטיקות",
        calendar: "יומן",
        myCoaches: "המאמנים שלי",
        coachDashboard: "לוח מאמן",
        templates: "תבניות",
        logout: "התנתק",
        login: "התחבר",
        register: "הרשמה",
        brand: "HoopProgress",
      }
    : {
        loading: "Loading...",
        profile: "Profile",
        workouts: "Workouts",
        stats: "Stats",
        calendar: "Calendar",
        myCoaches: "My Coaches",
        coachDashboard: "Coach Dashboard",
        templates: "Templates",
        logout: "Logout",
        login: "Login",
        register: "Register",
        brand: "HoopProgress",
      };

  const languageToggle = (
    <div className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 p-1 text-sm">
      <button
        type="button"
        onClick={() => setLanguage("he")}
        className={`rounded-full px-3 py-1 transition ${
          language === "he" ? "bg-amber-500 text-zinc-950" : "text-stone-300"
        }`}
      >
        עברית
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 transition ${
          language === "en" ? "bg-amber-500 text-zinc-950" : "text-stone-300"
        }`}
      >
        English
      </button>
    </div>
  );

  const desktopNavLinks = user ? (
    user.role === "PLAYER" ? (
      <>
        <Link href="/player-profile" className="hover:text-orange-400 transition">
          {text.profile}
        </Link>
        <Link href="/workouts" className="hover:text-orange-400 transition">
          {text.workouts}
        </Link>
        <Link href="/stats" className="hover:text-orange-400 transition">
          {text.stats}
        </Link>
        <Link href="/player-calendar" className="hover:text-orange-400 transition">
          {text.calendar}
        </Link>
        <Link href="/my-coaches" className="hover:text-orange-400 transition">
          {text.myCoaches}
        </Link>
      </>
    ) : (
      <>
        <Link href="/coach-profile" className="hover:text-orange-400 transition">
          {text.profile}
        </Link>
        <Link href="/coach-dashboard" className="hover:text-orange-400 transition">
          {text.coachDashboard}
        </Link>
        <Link href="/coach-calendar" className="hover:text-orange-400 transition">
          {text.calendar}
        </Link>
        <Link href="/templates" className="hover:text-orange-400 transition">
          {text.templates}
        </Link>
      </>
    )
  ) : null;

  if (loading) {
    return (
      <nav className="flex justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-stone-100">
        <div className="flex w-full items-center justify-between gap-4">
          <span>{text.loading}</span>
          {languageToggle}
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 text-stone-100 shadow-md backdrop-blur-md">
      <div className="mx-auto grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold tracking-wide text-amber-400 transition hover:text-amber-300"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-amber-500/20 bg-transparent shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/HoopProgressLogo.png"
              alt="HoopProgress logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
              draggable={false}
            />
          </span>
          <span>{text.brand}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-6 text-lg font-medium">
          {desktopNavLinks}
        </div>

        <div className="hidden md:flex items-center justify-self-end gap-3">
          {user ? (
            <>
              {languageToggle}
              <NotificationBell />
              <button
                onClick={logout}
                className="cursor-pointer rounded-lg px-4 py-2 text-red-500 transition hover:text-red-600"
              >
                {text.logout}
              </button>
            </>
          ) : (
            <>
              {languageToggle}
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 font-medium hover:text-orange-400 transition"
              >
                {text.login}
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 font-medium transition hover:bg-orange-600"
              >
                {text.register}
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
          <div className="flex justify-center">{languageToggle}</div>
          {user ? (
            <>
              <Link
                href={user.role === "COACH" ? "/coach-profile" : "/player-profile"}
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                {text.profile}
              </Link>

              {user.role === "COACH" ? (
                <>
                  <Link
                    href="/coach-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.coachDashboard}
                  </Link>
                  <Link
                    href="/coach-calendar"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.calendar}
                  </Link>
                  <Link
                    href="/templates"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.templates}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/workouts"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.workouts}
                  </Link>
                  <Link
                    href="/stats"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.stats}
                  </Link>
                  <Link
                    href="/player-calendar"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.calendar}
                  </Link>
                  <Link
                    href="/my-coaches"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-orange-400 transition"
                  >
                    {text.myCoaches}
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
                {text.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-400 transition"
              >
                {text.login}
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                {text.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

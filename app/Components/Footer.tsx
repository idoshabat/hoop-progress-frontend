"use client";

import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function Footer() {
    const { user } = useAuth();
    const { isHebrew } = useLanguage();

    const text = isHebrew
        ? {
              brand: "HoopProgress",
              tagline: "מערכת אימונים חכמה לשחקנים ומאמנים שרוצים לנהל התקדמות, חיבורים וביצועים במקום אחד.",
              navigation: "ניווט",
              platform: "הפלטפורמה",
              account: "חשבון",
              home: "בית",
              workouts: "אימונים",
              templates: "תבניות",
              dashboard: "לוח מאמן",
              coaches: "המאמנים שלי",
              calendar: "יומן",
              stats: "סטטיסטיקות",
              login: "התחברות",
              register: "הרשמה",
              profile: "פרופיל",
              rights: "כל הזכויות שמורות.",
          }
        : {
              brand: "HoopProgress",
              tagline: "A focused training platform for players and coaches to manage progress, connections, and performance in one place.",
              navigation: "Navigation",
              platform: "Platform",
              account: "Account",
              home: "Home",
              workouts: "Workouts",
              templates: "Templates",
              dashboard: "Coach Dashboard",
              coaches: "My Coaches",
              calendar: "Calendar",
              stats: "Stats",
              login: "Login",
              register: "Register",
              profile: "Profile",
              rights: "All rights reserved.",
          };

    const platformLinks = user
        ? user.role === "COACH"
            ? [
                  { href: "/coach-dashboard", label: text.dashboard },
                  { href: "/templates", label: text.templates },
                  { href: "/coach-calendar", label: text.calendar },
                  { href: "/coach-profile", label: text.profile },
              ]
            : [
                  { href: "/workouts", label: text.workouts },
                  { href: "/stats", label: text.stats },
                  { href: "/player-calendar", label: text.calendar },
                  { href: "/my-coaches", label: text.coaches },
              ]
        : [
              { href: "/workouts", label: text.workouts },
              { href: "/templates", label: text.templates },
          ];

    const accountLinks = user
        ? [
              {
                  href: user.role === "COACH" ? "/coach-profile" : "/player-profile",
                  label: text.profile,
              },
          ]
        : [
              { href: "/login", label: text.login },
              { href: "/register", label: text.register },
          ];

    return (
        <footer className="mt-16 border-t border-zinc-800 bg-linear-to-b from-zinc-950 to-black/80">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
                <div className="max-w-xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 text-xl font-black tracking-wide text-amber-300 transition hover:text-amber-200"
                    >
                        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-amber-500/20 shadow-[0_10px_26px_rgba(0,0,0,0.25)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/HoopProgressLogo.png"
                                alt="HoopProgress logo"
                                className="h-9 w-9 rounded-full object-cover"
                                draggable={false}
                            />
                        </span>
                        <span>{text.brand}</span>
                    </Link>
                    <p className="mt-4 leading-7 text-stone-400">{text.tagline}</p>
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {text.platform}
                    </h2>
                    <ul className="mt-4 space-y-3 text-stone-300">
                        <li>
                            <Link href="/" className="transition hover:text-amber-300">
                                {text.home}
                            </Link>
                        </li>
                        {platformLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="transition hover:text-amber-300">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {text.account}
                    </h2>
                    <ul className="mt-4 space-y-3 text-stone-300">
                        {accountLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="transition hover:text-amber-300">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-zinc-800/80 px-6 py-4">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>{text.brand}</p>
                    <p>{text.rights}</p>
                </div>
            </div>
        </footer>
    );
}

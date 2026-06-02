import Link from "next/link";
import { useLanguage } from "@/app/Context/LanguageContext";

type EmptyStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    eyebrow?: string;
    icon?: string;
};

export default function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
    eyebrow,
    icon = "🏀",
}: EmptyStateProps) {
    const { isHebrew } = useLanguage();

    return (
        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-[1px] text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-zinc-950/95 px-6 py-12 sm:px-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/12 blur-3xl" />
                    <div className="absolute -left-8 bottom-10 h-28 w-28 rounded-full border border-amber-500/15" />
                    <div className="absolute -right-10 top-12 h-32 w-32 rounded-full border border-zinc-700/60" />
                    <div className="absolute inset-x-10 bottom-8 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />
                </div>

                <div className="relative flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-4xl shadow-[0_10px_30px_rgba(245,158,11,0.18)]">
                        {icon}
                    </div>

                    {eyebrow && (
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/80">
                            {eyebrow}
                        </p>
                    )}

                    <h3 className="mt-4 max-w-xl text-2xl font-black text-stone-100 sm:text-3xl">
                        {title}
                    </h3>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-stone-400">
                        {description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-stone-400">
                        <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                            {isHebrew ? "פוקוס" : "Focus"}
                        </span>
                        <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                            {isHebrew ? "מומנטום" : "Momentum"}
                        </span>
                        <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                            {isHebrew ? "התקדמות" : "Progress"}
                        </span>
                    </div>

                    {actionLabel && actionHref && (
                        <Link
                            href={actionHref}
                            className="mt-8 inline-flex items-center rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
                        >
                            {actionLabel}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

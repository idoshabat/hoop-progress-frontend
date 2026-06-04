"use client";

import Link from "next/link";

type ErrorStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    tone?: "danger" | "warning";
};

export default function ErrorState({
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    tone = "danger",
}: ErrorStateProps) {
    const toneClasses =
        tone === "warning"
            ? {
                  icon: "from-amber-500/20 via-orange-500/10 to-zinc-950 text-amber-300",
                  badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
                  border: "border-amber-500/20",
              }
            : {
                  icon: "from-red-500/20 via-orange-500/10 to-zinc-950 text-red-300",
                  badge: "border-red-500/20 bg-red-500/10 text-red-300",
                  border: "border-red-500/20",
              };

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div
                className={`overflow-hidden rounded-[2rem] border bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-[0_22px_70px_rgba(0,0,0,0.35)] ${toneClasses.border}`}
            >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-zinc-800 bg-linear-to-br text-3xl shadow-[0_16px_40px_rgba(0,0,0,0.25)] ${toneClasses.icon}`}
                    >
                        {tone === "warning" ? "!" : "×"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${toneClasses.badge}`}
                        >
                            {tone === "warning" ? "Attention" : "Error"}
                        </span>
                        <h2 className="mt-4 text-2xl font-black text-stone-100">{title}</h2>
                        <p className="mt-3 max-w-2xl leading-7 text-stone-400">{description}</p>
                        {actionLabel ? (
                            actionHref ? (
                                <Link
                                    href={actionHref}
                                    className="mt-6 inline-flex rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                                >
                                    {actionLabel}
                                </Link>
                            ) : onAction ? (
                                <button
                                    type="button"
                                    onClick={onAction}
                                    className="mt-6 inline-flex rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
                                >
                                    {actionLabel}
                                </button>
                            ) : null
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

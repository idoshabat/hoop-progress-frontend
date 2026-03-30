import Link from "next/link";

type EmptyStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
};

export default function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="mt-4 flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/80 p-10 text-center">
            <h3 className="text-xl font-semibold text-stone-100">
                {title}
            </h3>

            <p className="max-w-md text-stone-400">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-2 inline-block rounded bg-amber-500 px-5 py-2 text-zinc-950 hover:bg-amber-400 transition"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

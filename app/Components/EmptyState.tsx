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
        <div className="flex flex-col mt-4 items-center justify-center border border-dashed rounded-lg p-10 text-center space-y-4 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">
                {title}
            </h3>

            <p className="text-gray-600 max-w-md">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-2 inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

"use client";

type InlineAlertProps = {
    message: string;
    tone?: "danger" | "warning" | "info";
};

export default function InlineAlert({ message, tone = "danger" }: InlineAlertProps) {
    const toneClasses =
        tone === "warning"
            ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
            : tone === "info"
              ? "border-sky-500/25 bg-sky-500/10 text-sky-200"
              : "border-red-500/25 bg-red-500/10 text-red-200";

    return (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${toneClasses}`}>
            {message}
        </div>
    );
}

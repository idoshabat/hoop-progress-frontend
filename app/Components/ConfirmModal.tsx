"use client";

import { useLanguage } from "@/app/Context/LanguageContext";

type ConfirmModalProps = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function ConfirmModal({
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmModalProps) {
    const { isHebrew } = useLanguage();

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
            <button
                type="button"
                aria-label={isHebrew ? "סגור חלון אישור" : "Close confirmation modal"}
                onClick={onCancel}
                className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            />

            <div className="relative z-[91] w-full max-w-lg overflow-hidden rounded-[28px] border border-zinc-700 bg-zinc-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="border-b border-zinc-800 bg-red-500/8 px-6 py-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/12 shadow-[0_12px_30px_rgba(239,68,68,0.18)]">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-red-300">
                                <path
                                    d="M12 8v5m0 3h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-stone-100">{title}</h2>
                            <p className="mt-3 text-sm leading-7 text-stone-400">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-stone-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {cancelText || (isHebrew ? "ביטול" : "Cancel")}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                    >
                        {loading
                            ? isHebrew
                                ? "מוחק..."
                                : "Deleting..."
                            : confirmText || (isHebrew ? "מחק" : "Delete")}
                    </button>
                </div>
            </div>
        </div>
    );
}

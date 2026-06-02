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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md space-y-4 rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-stone-100">
                    {title}
                </h2>

                <p className="text-stone-400">
                    {message}
                </p>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded border border-zinc-600 px-4 py-2 text-stone-200 hover:bg-zinc-800"
                    >
                        {cancelText || (isHebrew ? "ביטול" : "Cancel")}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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

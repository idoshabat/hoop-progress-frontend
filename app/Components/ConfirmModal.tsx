"use client";

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
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {title}
                </h2>

                <p className="text-gray-600">
                    {message}
                </p>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded border hover:bg-gray-100"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

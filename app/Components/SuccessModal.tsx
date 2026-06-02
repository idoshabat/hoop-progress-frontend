"use client";

import { useLanguage } from "@/app/Context/LanguageContext";

type SuccessModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export default function SuccessModal({
  visible,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  const { isHebrew } = useLanguage();

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label={isHebrew ? "סגור חלון הצלחה" : "Close success modal"}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <div className="success-modal-card relative z-[91] flex w-full max-w-sm flex-col items-center rounded-[28px] border border-zinc-700 bg-zinc-900 px-6 pb-6 pt-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
          <div className="success-modal-ring absolute inset-0 rounded-full border border-emerald-400/70 bg-emerald-500/12" />
          <div className="success-modal-badge flex h-[72px] w-[72px] items-center justify-center rounded-full bg-emerald-400 shadow-[0_10px_26px_rgba(52,211,153,0.35)]">
            <svg
              viewBox="0 0 52 52"
              className="h-9 w-9"
              aria-hidden="true"
            >
              <path
                d="M14 27.5 22.5 36 38.5 18"
                fill="none"
                stroke="#0f0f11"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="success-modal-check"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-stone-100">{title}</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-stone-400">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-w-36 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400"
        >
          {isHebrew ? "המשך" : "Continue"}
        </button>
      </div>
    </div>
  );
}

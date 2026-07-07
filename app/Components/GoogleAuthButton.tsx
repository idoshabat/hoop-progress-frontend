"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: "popup";
            callback: (response: { code?: string; error?: string }) => void;
          }) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

type GoogleAuthButtonProps = {
  label: string;
  hint: string;
  onCodeReceived: (code: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
};

export default function GoogleAuthButton({
  label,
  hint,
  onCodeReceived,
  disabled = false,
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const initializeClient = () => {
      if (!window.google?.accounts.oauth2) {
        return;
      }

      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response) => {
          if (!response.code) {
            setLoading(false);
            return;
          }

          try {
            await onCodeReceived(response.code);
          } finally {
            setLoading(false);
          }
        },
      });
      setReady(true);
    };

    if (window.google?.accounts.oauth2) {
      initializeClient();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeClient);
      return () => existingScript.removeEventListener("load", initializeClient);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeClient;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [clientId, onCodeReceived]);

  const handleClick = () => {
    if (!codeClientRef.current || loading || disabled) {
      return;
    }

    setLoading(true);
    codeClientRef.current.requestCode();
  };

  const isDisabled = disabled || loading || !ready || !clientId;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`group flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white">
          <GoogleGlyph />
        </div>
        <div>
          <div className="text-base font-semibold text-stone-100">{label}</div>
          <div className="mt-1 text-sm text-stone-400">{hint}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-stone-500">
          {loading ? "Connecting..." : ""}
        </span>
        <span className="text-stone-500 transition group-hover:translate-x-0.5 group-hover:text-stone-300">
          <ArrowRightGlyph />
        </span>
      </div>
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12Z"
      />
      <path
        fill="#34A853"
        d="M2.4 7.5l3.2 2.4C6.5 7.9 9 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-6.9 2.1-8.5 5.1Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.6c2.6 0 4.8-.8 6.4-2.3l-3-2.5c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.2-2.6-5.5-3.9l-3.2 2.5c1.6 3.1 4.8 5.1 8.7 5.1Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.9c0-.5-.1-.9-.1-1.3H12v3.9h5.5c-.3 1.3-1.5 2.4-2.9 3.1l3 2.5c1.8-1.7 3.5-4.3 3.5-8.2Z"
      />
    </svg>
  );
}

function ArrowRightGlyph() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12H19M19 12L12.75 5.75M19 12L12.75 18.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type AppLanguage = "he" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  isHebrew: boolean;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "hoopprogress-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "he";
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return storedLanguage === "en" || storedLanguage === "he" ? storedLanguage : "he";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        onStoreChange();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const language = useSyncExternalStore<AppLanguage>(
    subscribe,
    getStoredLanguage,
    () => "he"
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  useEffect(() => {
    const dir = language === "he" ? "rtl" : "ltr";

    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isHebrew: language === "he",
      setLanguage,
      toggleLanguage: () => {
        setLanguage(language === "he" ? "en" : "he");
      },
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

"use client";

import { useMemo } from "react";
import { useLanguage } from "@/app/Context/LanguageContext";

type LocalizedDateTextProps = {
    value?: string | null;
    fallback: string;
};

function formatDateValue(value: string, locale: "he-IL" | "en-US") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (match) {
        const [, year, month, day] = match;
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        return date.toLocaleDateString(locale, {
            year: "numeric",
            month: locale === "he-IL" ? "long" : "short",
            day: "numeric",
        });
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString(locale, {
            year: "numeric",
            month: locale === "he-IL" ? "long" : "short",
            day: "numeric",
        });
    }

    return value;
}

export default function LocalizedDateText({
    value,
    fallback,
}: LocalizedDateTextProps) {
    const { language } = useLanguage();
    const locale = language === "he" ? "he-IL" : "en-US";

    const formatted = useMemo(() => {
        if (!value) {
            return fallback;
        }

        return formatDateValue(value, locale);
    }, [fallback, locale, value]);

    return <>{formatted}</>;
}

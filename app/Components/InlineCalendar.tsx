"use client";

import { useMemo, useState } from "react";

type CalendarDay = {
  isoDate: string;
  label: number;
  inCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateParts(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      isoDate: getIsoDate(date),
      label: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

type InlineCalendarProps = {
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
};

export default function InlineCalendar({
  selectedDate,
  onSelectDate,
}: InlineCalendarProps) {
  const todayIso = useMemo(() => getIsoDate(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const selected = getDateParts(selectedDate);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );

  const goToMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    });
  };

  const handleSelect = (isoDate: string) => {
    const selected = getDateParts(isoDate);
    setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    onSelectDate(isoDate);
  };

  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => goToMonth("prev")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-stone-100 transition hover:border-amber-500/40 hover:text-amber-300"
        >
          ‹
        </button>

        <p className="text-lg font-extrabold text-stone-100">
          {formatMonthTitle(currentMonth)}
        </p>

        <button
          type="button"
          onClick={() => goToMonth("next")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-stone-100 transition hover:border-amber-500/40 hover:text-amber-300"
        >
          ›
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-500"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const isSelected = day.isoDate === selectedDate;
          const isToday = day.isoDate === todayIso;

          return (
            <button
              key={day.isoDate}
              type="button"
              onClick={() => handleSelect(day.isoDate)}
              className={[
                "aspect-square rounded-2xl border text-sm font-bold transition cursor-pointer",
                isSelected
                  ? "border-amber-500 bg-amber-500 text-zinc-950"
                  : "border-transparent bg-zinc-900 text-stone-100 hover:border-amber-500/30 hover:bg-zinc-800",
                !day.inCurrentMonth ? "opacity-40" : "",
                isToday && !isSelected ? "border-amber-500/60" : "",
              ].join(" ")}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

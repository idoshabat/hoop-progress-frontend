"use client";

import { WorkoutTemplate } from "@/app/types";
import { useLanguage } from "@/app/Context/LanguageContext";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onUse: (templateId: number) => void;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (templateId: number) => void;
  isLoading?: boolean;
}

export default function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  isLoading = false,
}: TemplateCardProps) {
  const { isHebrew } = useLanguage();

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-[1px] shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(0,0,0,0.32)]">
      <div className="relative flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-zinc-950/95 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col">
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
                {isHebrew ? "תבנית" : "Template"}
              </div>
              <h3 className="mt-3 text-xl font-bold text-stone-100">{template.name}</h3>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                {isHebrew ? "יעד" : "Goal"}
              </p>
              <p className="mt-1 text-lg font-black text-amber-300">{template.goal_percentage}%</p>
            </div>
          </div>

          <div className="relative mt-3 min-h-[3.5rem]">
            {template.description ? (
              <p className="text-sm leading-7 text-stone-400">{template.description}</p>
            ) : null}
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span className="text-stone-500">{isHebrew ? "זריקות לסשן" : "Shots/Session"}</span>
              <p className="mt-2 text-lg font-bold text-stone-200">{template.target_attempts}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span className="text-stone-500">{isHebrew ? "סשנים" : "Sessions"}</span>
              <p className="mt-2 text-lg font-bold text-stone-200">{template.target_sessions}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span className="text-stone-500">{isHebrew ? "אחוז יעד" : "Goal %"}</span>
              <p className="mt-2 text-lg font-bold text-stone-200">{template.goal_percentage}%</p>
            </div>
          </div>
        </div>

      <div className="relative mt-5 flex gap-2 pt-1">
        <button
          onClick={() => onUse(template.id)}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {isHebrew ? "השתמש בתבנית" : "Use Template"}
        </button>
        <button
          onClick={() => onEdit(template)}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {isHebrew ? "ערוך" : "Edit"}
        </button>
        <button
          onClick={() => onDelete(template.id)}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {isHebrew ? "מחק" : "Delete"}
        </button>
      </div>
      </div>
    </div>
  );
}

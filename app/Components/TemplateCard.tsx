"use client";

import { WorkoutTemplate } from "@/app/types";

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
  return (
    <div className="border border-zinc-700 rounded-lg p-4 space-y-2 bg-zinc-900 hover:bg-zinc-800 transition">
      <h3 className="text-lg font-semibold text-stone-100">{template.name}</h3>
      {template.description && (
        <p className="text-stone-400 text-sm">{template.description}</p>
      )}

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-stone-500">Shots/Session:</span>
          <p className="font-semibold text-stone-200">{template.target_attempts}</p>
        </div>
        <div>
          <span className="text-stone-500">Sessions:</span>
          <p className="font-semibold text-stone-200">{template.target_sessions}</p>
        </div>
        <div>
          <span className="text-stone-500">Goal %:</span>
          <p className="font-semibold text-stone-200">{template.goal_percentage}%</p>
        </div>
      </div>

      <div className="flex gap-2 pt-3">
        <button
          onClick={() => onUse(template.id)}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white rounded py-1 text-sm hover:bg-green-700 disabled:opacity-50 transition"
        >
          Use Template
        </button>
        <button
          onClick={() => onEdit(template)}
          disabled={isLoading}
          className="flex-1 bg-amber-500 text-zinc-950 rounded py-1 text-sm hover:bg-amber-400 disabled:opacity-50 font-semibold transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(template.id)}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white rounded py-1 text-sm hover:bg-red-700 disabled:opacity-50 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { WorkoutTemplate } from "@/app/types";
import { useLanguage } from "@/app/Context/LanguageContext";
import FormField from "@/app/Components/FormField";

interface TemplateFormProps {
  template?: WorkoutTemplate;
  onSubmit: (data: {
    name: string;
    description?: string;
    target_attempts: number;
    target_sessions: number;
    goal_percentage: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function TemplateForm({
  template,
  onSubmit,
  isLoading = false,
}: TemplateFormProps) {
  const { isHebrew } = useLanguage();
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    target_attempts: template?.target_attempts || 10,
    target_sessions: template?.target_sessions || 3,
    goal_percentage: template?.goal_percentage || 75,
  });

  const [error, setError] = useState("");

  const text = isHebrew
    ? {
        templateName: "שם התבנית *",
        templatePlaceholder: "למשל: קליעה ל-3 נקודות",
        description: "תיאור",
        descriptionPlaceholder: "תיאור אופציונלי...",
        shotsPerSession: "זריקות לסשן *",
        sessionsTarget: "יעד סשנים *",
        goal: "אחוז יעד *",
        goalHelper: "האחוז שאליו השחקן צריך לשאוף לאורך התבנית כולה.",
        shotsHelper: "כמה זריקות יש לבצע בכל סשן של התבנית.",
        sessionsHelper: "כמה סשנים נדרשים כדי להשלים את התבנית.",
        descriptionHelper: "שמור כאן הקשר קצר שיעזור לך לזהות את מטרת התבנית בהמשך.",
        nameRequired: "שם התבנית הוא שדה חובה",
        attemptsMin: "מספר הזריקות חייב להיות גדול מ-0",
        sessionsMin: "מספר הסשנים חייב להיות גדול מ-0",
        goalRange: "אחוז היעד חייב להיות בין 0 ל-100",
        saveFailed: "שמירת התבנית נכשלה",
        saving: "שומר...",
        update: "עדכן תבנית",
        create: "צור תבנית",
      }
    : {
        templateName: "Template Name *",
        templatePlaceholder: "e.g., 3-Point Shooting",
        description: "Description",
        descriptionPlaceholder: "Optional description...",
        shotsPerSession: "Shots / Session *",
        sessionsTarget: "Sessions Target *",
        goal: "Goal % *",
        goalHelper: "The percentage target the player should aim to hit across this template.",
        shotsHelper: "How many shot attempts each session in this template should contain.",
        sessionsHelper: "How many sessions are required to complete this template.",
        descriptionHelper: "Save a short note here so this template is easier to recognize later.",
        nameRequired: "Template name is required",
        attemptsMin: "Target attempts must be greater than 0",
        sessionsMin: "Target sessions must be greater than 0",
        goalRange: "Goal percentage must be between 0 and 100",
        saveFailed: "Failed to save template",
        saving: "Saving...",
        update: "Update Template",
        create: "Create Template",
      };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "name" || name === "description"
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError(text.nameRequired);
      return;
    }

    if (formData.target_attempts <= 0) {
      setError(text.attemptsMin);
      return;
    }

    if (formData.target_sessions <= 0) {
      setError(text.sessionsMin);
      return;
    }

    if (formData.goal_percentage < 0 || formData.goal_percentage > 100) {
      setError(text.goalRange);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : text.saveFailed
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label={text.templateName} helper={text.templatePlaceholder} required>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={text.templatePlaceholder}
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </FormField>

      <FormField label={text.description} helper={text.descriptionHelper}>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={text.descriptionPlaceholder}
          rows={3}
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label={text.shotsPerSession} helper={text.shotsHelper} required>
          <input
            type="number"
            name="target_attempts"
            value={formData.target_attempts}
            onChange={handleChange}
            min="1"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
        </FormField>
        <FormField label={text.sessionsTarget} helper={text.sessionsHelper} required>
          <input
            type="number"
            name="target_sessions"
            value={formData.target_sessions}
            onChange={handleChange}
            min="1"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
        </FormField>
      </div>

      <FormField label={text.goal} helper={text.goalHelper} required>
        <input
          type="number"
          name="goal_percentage"
          value={formData.goal_percentage}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </FormField>

      {error && <div className="rounded-2xl border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-amber-500 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {isLoading ? text.saving : template ? text.update : text.create}
      </button>
    </form>
  );
}

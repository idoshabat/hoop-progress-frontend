"use client";

import { useState } from "react";
import { WorkoutTemplate } from "@/app/types";

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
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    target_attempts: template?.target_attempts || 10,
    target_sessions: template?.target_sessions || 3,
    goal_percentage: template?.goal_percentage || 75,
  });

  const [error, setError] = useState("");

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
      setError("Template name is required");
      return;
    }

    if (formData.target_attempts <= 0) {
      setError("Target attempts must be greater than 0");
      return;
    }

    if (formData.target_sessions <= 0) {
      setError("Target sessions must be greater than 0");
      return;
    }

    if (formData.goal_percentage < 0 || formData.goal_percentage > 100) {
      setError("Goal percentage must be between 0 and 100");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save template"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-200">Template Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., 3-Point Shooting"
          className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-200">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional description..."
          rows={3}
          className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-200">Shots / Session *</label>
          <input
            type="number"
            name="target_attempts"
            value={formData.target_attempts}
            onChange={handleChange}
            min="1"
            className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-200">Sessions Target *</label>
          <input
            type="number"
            name="target_sessions"
            value={formData.target_sessions}
            onChange={handleChange}
            min="1"
            className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-200">Goal % *</label>
        <input
          type="number"
          name="goal_percentage"
          value={formData.goal_percentage}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>

      {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-amber-500 text-zinc-950 rounded py-2 hover:bg-amber-400 disabled:opacity-50 font-semibold transition"
      >
        {isLoading ? "Saving..." : template ? "Update Template" : "Create Template"}
      </button>
    </form>
  );
}

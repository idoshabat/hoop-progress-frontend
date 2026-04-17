"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import { WorkoutTemplate } from "@/app/types";
import TemplateForm from "@/app/Components/TemplateForm";
import TemplateCard from "@/app/Components/TemplateCard";
import {
  fetchWorkoutTemplates,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
} from "@/app/lib/templatesApi";

export default function ManageTemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user || user.role !== "COACH") return;

    loadTemplates();
  }, [authLoading, user]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchWorkoutTemplates();
      setTemplates(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData: {
    name: string;
    description?: string;
    target_attempts: number;
    target_sessions: number;
    goal_percentage: number;
  }) => {
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        const updated = await updateWorkoutTemplate(editingTemplate.id, formData);
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const created = await createWorkoutTemplate(formData);
        setTemplates((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingTemplate(undefined);
      setError("");
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to save template"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await deleteWorkoutTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      setError("Failed to delete template");
      console.error(err);
    }
  };

  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
  };

  if (authLoading || loading) {
    return <p className="p-6">Loading templates...</p>;
  }

  if (!user || user.role !== "COACH") {
    return <p className="p-6 text-red-500">Access denied. Coaches only.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-stone-100">Workout Templates</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 text-zinc-950 rounded px-4 py-2 hover:bg-amber-400 transition font-semibold"
          >
            + New Template
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6 border border-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-800 p-6 rounded-lg mb-8 border border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-100">
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-stone-400 hover:text-stone-200 text-xl"
            >
              ✕
            </button>
          </div>
          <TemplateForm
            template={editingTemplate}
            onSubmit={handleCreateOrUpdate}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 mb-4">No templates yet. Create one to get started!</p>
          {/* {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-amber-500 text-zinc-950 rounded px-6 py-2 hover:bg-amber-400 transition font-semibold"
            >
              Create Template
            </button>
          )} */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => {
                // This would typically open a modal to select a player
                console.log("Use template:", template.id);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

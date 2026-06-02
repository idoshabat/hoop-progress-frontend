"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/Context/AuthContext";
import { PlayerProfile, WorkoutTemplate } from "@/app/types";
import api from "@/app/lib/axios";
import EmptyState from "@/app/Components/EmptyState";
import SelectTemplateModal from "@/app/Components/SelectTemplateModal";
import TemplateForm from "@/app/Components/TemplateForm";
import TemplateCard from "@/app/Components/TemplateCard";
import {
  fetchWorkoutTemplates,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  createWorkoutFromTemplate,
} from "@/app/lib/templatesApi";
import { useLanguage } from "@/app/Context/LanguageContext";

export default function ManageTemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isHebrew } = useLanguage();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<WorkoutTemplate | null>(null);

  const text = useMemo(
    () =>
      isHebrew
        ? {
        failedLoad: "טעינת התבניות נכשלה",
        failedSave: "שמירת התבנית נכשלה",
        deleteConfirm: "האם למחוק את התבנית הזו?",
        failedDelete: "מחיקת התבנית נכשלה",
        loading: "טוען תבניות...",
        accessDenied: "אין גישה. למאמנים בלבד.",
        title: "תבניות אימון",
        newTemplate: "+ תבנית חדשה",
        editTemplate: "עריכת תבנית",
        createTemplate: "יצירת תבנית חדשה",
        empty: "עדיין אין תבניות. צור אחת כדי להתחיל.",
        heroEyebrow: "מערך האימון שלך",
        heroTitle: "בנה ספריית תבניות שחוסכת זמן ושומרת על שיטה.",
        heroDescription:
          "שמור מבני אימון שעובדים בשבילך, שכפל אותם במהירות, ויצור תהליך עקבי יותר לכל שחקן שאתה מלווה.",
        activeTemplates: "תבניות פעילות",
        totalShots: "סה\"כ זריקות מתוכננות",
        totalSessions: "סה\"כ סשנים מתוכננים",
        libraryTitle: "ספריית תבניות",
        libraryDescription: "כל תבנית כאן יכולה להפוך לאימון בפועל בכמה קליקים.",
        createPanelEyebrow: "עיצוב חדש",
        editPanelEyebrow: "עדכון קיים",
        createPanelDescription: "הגדר מבנה חכם וברור לאימון הבא שתרצה לשכפל.",
        editPanelDescription: "עדכן את התבנית כדי לשמור על ספריית אימון מדויקת ועקבית.",
        failedCreateFromTemplate: "יצירת אימון מהתבנית נכשלה.",
      }
        : {
        failedLoad: "Failed to load templates",
        failedSave: "Failed to save template",
        deleteConfirm: "Are you sure you want to delete this template?",
        failedDelete: "Failed to delete template",
        loading: "Loading templates...",
        accessDenied: "Access denied. Coaches only.",
        title: "Workout Templates",
        newTemplate: "+ New Template",
        editTemplate: "Edit Template",
        createTemplate: "Create New Template",
        empty: "No templates yet. Create one to get started!",
        heroEyebrow: "Your Training System",
        heroTitle: "Build a template library that saves time and sharpens your coaching rhythm.",
        heroDescription:
          "Save workout structures that work, reuse them fast, and create a more consistent experience for every player you coach.",
        activeTemplates: "Active Templates",
        totalShots: "Planned Shots Total",
        totalSessions: "Planned Sessions Total",
        libraryTitle: "Template Library",
        libraryDescription: "Every template here can turn into a real workout in just a few clicks.",
        createPanelEyebrow: "New Blueprint",
        editPanelEyebrow: "Refine Template",
        createPanelDescription: "Define a clean, repeatable workout structure for your next assignment.",
        editPanelDescription: "Tune this template so your workout library stays sharp and consistent.",
        failedCreateFromTemplate: "Failed to create workout from template.",
      },
    [isHebrew]
  );

  const totalTargetAttempts = useMemo(
    () => templates.reduce((sum, template) => sum + template.target_attempts, 0),
    [templates]
  );

  const totalTargetSessions = useMemo(
    () => templates.reduce((sum, template) => sum + template.target_sessions, 0),
    [templates]
  );

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const [templatesData, coachProfile] = await Promise.all([
        fetchWorkoutTemplates(),
        api.get("me/").then((res) => res.data),
      ]);
      setTemplates(templatesData);
      setPlayers(coachProfile.players || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(text.failedLoad);
    } finally {
      setLoading(false);
    }
  }, [text.failedLoad]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "COACH") return;
    void loadTemplates();
  }, [authLoading, user, loadTemplates]);

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
        err instanceof Error ? err.message : text.failedSave
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!window.confirm(text.deleteConfirm)) {
      return;
    }

    try {
      await deleteWorkoutTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      setError(text.failedDelete);
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

  const handleUse = (templateId: number) => {
    const selectedTemplate = templates.find((template) => template.id === templateId);
    if (!selectedTemplate) return;
    setTemplateToUse(selectedTemplate);
    setError("");
  };

  const handleCreateFromTemplate = async (templateId: number, playerIds: number[]) => {
    try {
      setIsSubmitting(true);
      await Promise.all(
        playerIds.map((playerId) => createWorkoutFromTemplate(templateId, playerId))
      );
      setTemplateToUse(null);
      router.push(
        playerIds.length === 1
          ? `/coach-dashboard/my_player/${playerIds[0]}`
          : "/coach-dashboard"
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : text.failedCreateFromTemplate
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <p className="p-6">{text.loading}</p>;
  }

  if (!user || user.role !== "COACH") {
    return <p className="p-6 text-red-500">{text.accessDenied}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-zinc-700/20 blur-3xl" />
          <div className="absolute right-12 top-12 rounded-full border border-amber-500/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-300/60">
            Templates
          </div>
        </div>

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300/80">
              {text.heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-stone-100 md:text-5xl">
              {text.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
              {text.heroDescription}
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
            >
              {text.newTemplate}
            </button>
          )}
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-stone-500">{text.activeTemplates}</p>
            <p className="mt-2 text-3xl font-black text-stone-100">{templates.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-stone-500">{text.totalShots}</p>
            <p className="mt-2 text-3xl font-black text-amber-300">{totalTargetAttempts}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm text-stone-500">{text.totalSessions}</p>
            <p className="mt-2 text-3xl font-black text-stone-100">{totalTargetSessions}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-800 bg-red-950/30 p-4 text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <div className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="border-b border-zinc-800 bg-amber-500/8 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
                  {editingTemplate ? text.editPanelEyebrow : text.createPanelEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-100">
                  {editingTemplate ? text.editTemplate : text.createTemplate}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-400">
                  {editingTemplate ? text.editPanelDescription : text.createPanelDescription}
                </p>
              </div>
            
            <button
              onClick={handleCloseForm}
              className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-stone-400 transition hover:text-stone-200"
            >
              ✕
            </button>
            </div>
          </div>
          <div className="p-6">
            <TemplateForm
              template={editingTemplate}
              onSubmit={handleCreateOrUpdate}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <EmptyState
          eyebrow={isHebrew ? "ספריית אימון" : "Training Library"}
          icon="🗂️"
          title={text.title}
          description={text.empty}
        />
      ) : (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-100">{text.libraryTitle}</h2>
              <p className="mt-2 text-stone-400">{text.libraryDescription}</p>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-stone-300">
              {templates.length} {isHebrew ? "תבניות מוכנות" : "ready-made templates"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUse}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isSubmitting}
              />
            ))}
          </div>
        </section>
      )}

      <SelectTemplateModal
        isOpen={Boolean(templateToUse)}
        templates={templates}
        players={players}
        onClose={() => setTemplateToUse(null)}
        onSelectTemplate={handleCreateFromTemplate}
        isLoading={isSubmitting}
        fixedTemplateId={templateToUse?.id ?? null}
      />
    </div>
  );
}

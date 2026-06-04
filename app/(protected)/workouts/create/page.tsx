"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
import { useLanguage } from "@/app/Context/LanguageContext";
import FormField from "@/app/Components/FormField";
import FormPanel from "@/app/Components/FormPanel";
import { PlayerProfile, WorkoutTemplate } from "@/app/types";
import SelectTemplateModal from "@/app/Components/SelectTemplateModal";
import {
  fetchWorkoutTemplates,
  createWorkoutFromTemplate,
} from "@/app/lib/templatesApi";

type CreateWorkoutBody = {
    name: string;
    description: string;
    goal_percentage: string;
    target_attempts: string;
    target_sessions: string;
    player?: number;
};

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "detail" in error.response.data &&
        typeof error.response.data.detail === "string"
    ) {
        return error.response.data.detail;
    }

    return fallback;
}

export default function CreateWorkoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { isHebrew } = useLanguage();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [goalPercentage, setGoalPercentage] = useState("");
    const [targetAttempts, setTargetAttempts] = useState("");
    const [targetSessions, setTargetSessions] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [useTemplate, setUseTemplate] = useState(false);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

    const text = isHebrew
      ? {
          failedTemplate: "יצירת אימון מתבנית נכשלה.",
          playerRequired: "מאמן חייב לבחור שחקן כדי ליצור עבורו אימון.",
          failedWorkout: "יצירת האימון נכשלה.",
          loading: "טוען...",
          loginRequired: "יש להתחבר כדי ליצור אימון.",
          title: "יצירת אימון",
          eyebrow: "אימון חדש",
          selectedPlayerPrefix: "יוצר אימון עבור",
          coachSubtitle: "האימון הזה יוקצה לשחקן שנבחר.",
          playerSubtitle: "צור אימון עבור תוכנית האימון האישית שלך.",
          formDescription: "בנה אימון חדש עם יעדים ברורים, או השתמש בתבנית קיימת כדי לחסוך זמן.",
          fromScratch: "מאפס",
          useTemplate: "השתמש בתבנית",
          creatingFor: "יוצר אימון עבור:",
          selectTemplate: "בחר תבנית",
          shotsSession: "זריקות לסשן",
          sessions: "סשנים",
          goal: "יעד",
          cancel: "ביטול",
          workoutName: "שם האימון",
          description: "תיאור",
          goalPercentage: "אחוז יעד",
          targetAttempts: "מספר זריקות יעד",
          targetSessions: "מספר סשנים יעד",
          workoutNameHelper: "בחר שם קצר וברור שיהיה קל לזהות אחר כך ברשימות ובהתראות.",
          descriptionHelper: "הוסף דגשים טכניים, דגש מנטלי או כל הקשר שיעזור לביצוע האימון.",
          goalHelper: "היעד האחוזי שאליו השחקן צריך לשאוף לאורך כל האימון.",
          attemptsHelper: "כמה זריקות ייספרו בכל ניסיון של האימון.",
          sessionsHelper: "כמה סשנים השחקן צריך להשלים כדי לסיים את האימון.",
          creating: "יוצר...",
          create: "צור",
        }
      : {
          failedTemplate: "Failed to create workout from template.",
          playerRequired: "A coach must select a player to create a workout for.",
          failedWorkout: "Failed to create workout.",
          loading: "Loading...",
          loginRequired: "Please log in to create a workout.",
          title: "Create Workout",
          eyebrow: "New Workout",
          selectedPlayerPrefix: "Creating workout for",
          coachSubtitle: "This workout will be assigned to the selected player.",
          playerSubtitle: "Create a workout for your own training plan.",
          formDescription: "Build a new workout with clear targets, or use an existing template to move faster.",
          fromScratch: "From Scratch",
          useTemplate: "Use Template",
          creatingFor: "Creating workout for:",
          selectTemplate: "Select Template",
          shotsSession: "shots/session",
          sessions: "sessions",
          goal: "goal",
          cancel: "Cancel",
          workoutName: "Workout Name",
          description: "Description",
          goalPercentage: "Goal Percentage",
          targetAttempts: "Target Attempts",
          targetSessions: "Target Sessions",
          workoutNameHelper: "Pick a clear title that will be easy to spot later in lists and notifications.",
          descriptionHelper: "Add technical notes, a mental cue, or any context that helps guide the workout.",
          goalHelper: "The success percentage the player should aim to reach across this workout.",
          attemptsHelper: "How many attempts each workout session should count.",
          sessionsHelper: "How many sessions the player needs to complete the workout.",
          creating: "Creating...",
          create: "Create",
        };

    const playerIdParam = searchParams.get("player_id");
    const parsedPlayerId =
        playerIdParam && Number.isInteger(Number(playerIdParam))
            ? Number(playerIdParam)
            : null;
    const isCoachCreatingForPlayer = user?.role === "COACH";

    useEffect(() => {
      if (isCoachCreatingForPlayer && user) {
        loadTemplatesAndPlayers();
      }
    }, [isCoachCreatingForPlayer, user]);

    // Pre-select player if coming from specific player page
    useEffect(() => {
      if (parsedPlayerId && players.length > 0) {
        const player = players.find(p => p.id === parsedPlayerId);
        if (player) {
          setSelectedPlayer(player);
        }
      }
    }, [parsedPlayerId, players]);

    const loadTemplatesAndPlayers = async () => {
      try {
        const [templatesData, coachProfile] = await Promise.all([
          fetchWorkoutTemplates(),
          api.get("me/").then((res) => res.data),
        ]);
        setTemplates(templatesData);
        setPlayers(coachProfile.players || []);
      } catch (err) {
        console.error("Failed to load templates or players", err);
      }
    };

    const handleUseTemplate = async (templateId: number, playerIds?: number[]) => {
      const resolvedPlayerIds =
        playerIds && playerIds.length > 0
          ? playerIds
          : selectedPlayer?.id
            ? [selectedPlayer.id]
            : [];

      if (resolvedPlayerIds.length === 0) return;

      try {
        setSaving(true);
        await Promise.all(
          resolvedPlayerIds.map((playerId) => createWorkoutFromTemplate(templateId, playerId))
        );
        router.push(
          resolvedPlayerIds.length === 1
            ? `/coach-dashboard/my_player/${resolvedPlayerIds[0]}`
            : "/coach-dashboard"
        );
      } catch (err) {
        setError(getErrorMessage(err, text.failedTemplate));
      } finally {
        setSaving(false);
      }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isCoachCreatingForPlayer && !selectedPlayer && !parsedPlayerId) {
            setError(text.playerRequired);
            return;
        }

        const body: CreateWorkoutBody = {
            name,
            description,
            goal_percentage: goalPercentage,
            target_attempts: targetAttempts,
            target_sessions: targetSessions,
        };

        const targetPlayerId = selectedPlayer?.id || parsedPlayerId;
        if (isCoachCreatingForPlayer && targetPlayerId) {
            body.player = targetPlayerId;
        }

        try {
            setSaving(true);
            await api.post("workouts/", body);
            setName("");
            setDescription("");
            setGoalPercentage("");
            setTargetAttempts("");
            setTargetSessions("");

            if (isCoachCreatingForPlayer && targetPlayerId) {
                router.push(`/coach-dashboard/my_player/${targetPlayerId}`);
            } else {
                router.push("/workouts");
            }
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, text.failedWorkout));
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <p className="p-6">{text.loading}</p>;
    }

    if (!user) {
        return <p className="p-6">{text.loginRequired}</p>;
    }

    return (
        <div className="mx-auto mt-12 max-w-3xl px-4 pb-10">
            <FormPanel
              eyebrow={text.eyebrow}
              title={text.title}
              description={
                selectedPlayer
                  ? `${text.selectedPlayerPrefix} ${selectedPlayer.username}`
                  : isCoachCreatingForPlayer
                    ? text.coachSubtitle
                    : `${text.playerSubtitle} ${text.formDescription}`
              }
            >

            {isCoachCreatingForPlayer && templates.length > 0 && (
              <div className="mb-6 flex gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1.5">
                <button
                  onClick={() => {
                    setUseTemplate(false);
                    setShowTemplateModal(false);
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    !useTemplate
                      ? "bg-amber-500 text-zinc-950"
                      : "border border-zinc-700 text-stone-400 hover:text-stone-300"
                  }`}
                >
                  {text.fromScratch}
                </button>
                <button
                  onClick={() => {
                    setUseTemplate(true);
                    if (parsedPlayerId) {
                      // Direct template selection for specific player
                      setShowTemplateModal(false);
                    } else {
                      // Show modal for player selection
                      setShowTemplateModal(true);
                    }
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    useTemplate
                      ? "bg-amber-500 text-zinc-950"
                      : "border border-zinc-700 text-stone-400 hover:text-stone-300"
                  }`}
                >
                  {text.useTemplate}
                </button>
              </div>
            )}

            {/* Template selection for specific player */}
            {useTemplate && parsedPlayerId && selectedPlayer && (
              <div className="space-y-4">
                <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-stone-400">
                  {text.creatingFor} <span className="text-stone-200 font-semibold">{selectedPlayer.username}</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-200">{text.selectTemplate}</label>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={saving}
                        className="rounded-2xl border border-zinc-700 bg-zinc-800 p-4 text-left transition hover:bg-zinc-700 disabled:opacity-50"
                      >
                        <div className="font-semibold text-stone-100">{template.name}</div>
                        {template.description && (
                          <div className="text-stone-400 text-sm mt-1">{template.description}</div>
                        )}
                        <div className="text-stone-500 text-xs mt-2">
                          {template.target_attempts} {text.shotsSession} • {template.target_sessions} {text.sessions} • {template.goal_percentage}% {text.goal}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setUseTemplate(false)}
                  className="w-full rounded-2xl border border-zinc-700 py-3 text-stone-300 transition hover:bg-zinc-800"
                >
                  {text.cancel}
                </button>
              </div>
            )}

            {!useTemplate && (
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <FormField label={text.workoutName} helper={text.workoutNameHelper} required>
                  <input
                      type="text"
                      placeholder={text.workoutName}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100"
                      required
                  />
                </FormField>
                <FormField label={text.description} helper={text.descriptionHelper}>
                  <textarea
                      placeholder={text.description}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100"
                      rows={4}
                  />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label={text.goalPercentage} helper={text.goalHelper} required>
                    <input
                        type="number"
                        placeholder={text.goalPercentage}
                        value={goalPercentage}
                        min={0}
                        max={100}
                        onChange={(e) => setGoalPercentage(e.target.value)}
                        className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100"
                        required
                    />
                  </FormField>
                  <FormField label={text.targetAttempts} helper={text.attemptsHelper} required>
                    <input
                        type="number"
                        placeholder={text.targetAttempts}
                        value={targetAttempts}
                        onChange={(e) => setTargetAttempts(e.target.value)}
                        className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100"
                        required
                    />
                  </FormField>
                </div>
                <FormField label={text.targetSessions} helper={text.sessionsHelper} required>
                  <input
                      type="number"
                      placeholder={text.targetSessions}
                      value={targetSessions}
                      onChange={(e) => setTargetSessions(e.target.value)}
                      className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-stone-100"
                      required
                  />
                </FormField>
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-amber-500 p-3 font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                >
                    {saving ? text.creating : text.create}
                </button>
              </form>
            )}

            {error && <p className="mt-4 rounded-2xl border border-red-800 bg-red-900/20 px-4 py-3 text-red-400">{error}</p>}

            {/* Only show modal when no specific player is selected */}
            <SelectTemplateModal
              isOpen={showTemplateModal && !parsedPlayerId}
              templates={templates}
              players={players}
              onClose={() => setShowTemplateModal(false)}
              onSelectTemplate={handleUseTemplate}
              isLoading={saving}
            />
            </FormPanel>
        </div>
    );
}

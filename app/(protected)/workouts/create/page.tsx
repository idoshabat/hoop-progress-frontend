"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/Context/AuthContext";
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

    const handleUseTemplate = async (templateId: number, playerId?: number) => {
      const targetPlayerId = playerId || selectedPlayer?.id;
      if (!targetPlayerId) return;

      try {
        setSaving(true);
        await createWorkoutFromTemplate(templateId, targetPlayerId);
        router.push(`/coach-dashboard/my_player/${targetPlayerId}`);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to create workout from template."));
      } finally {
        setSaving(false);
      }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isCoachCreatingForPlayer && !selectedPlayer && !parsedPlayerId) {
            setError("A coach must select a player to create a workout for.");
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
            setError(getErrorMessage(err, "Failed to create workout."));
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (!user) {
        return <p className="p-6">Please log in to create a workout.</p>;
    }

    return (
        <div className="mx-auto mt-20 max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/30">
            <h1 className="mb-2 text-2xl text-stone-100">Create Workout</h1>
            <p className="mb-4 text-sm text-stone-400">
                {selectedPlayer
                    ? `Creating workout for ${selectedPlayer.username}`
                    : isCoachCreatingForPlayer
                    ? "This workout will be assigned to the selected player."
                    : "Create a workout for your own training plan."}
            </p>

            {isCoachCreatingForPlayer && templates.length > 0 && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => {
                    setUseTemplate(false);
                    setShowTemplateModal(false);
                  }}
                  className={`flex-1 rounded py-2 text-sm transition ${
                    !useTemplate
                      ? "bg-amber-500 text-zinc-950"
                      : "border border-zinc-700 text-stone-400 hover:text-stone-300"
                  }`}
                >
                  From Scratch
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
                  className={`flex-1 rounded py-2 text-sm transition ${
                    useTemplate
                      ? "bg-amber-500 text-zinc-950"
                      : "border border-zinc-700 text-stone-400 hover:text-stone-300"
                  }`}
                >
                  Use Template
                </button>
              </div>
            )}

            {/* Template selection for specific player */}
            {useTemplate && parsedPlayerId && selectedPlayer && (
              <div className="space-y-4">
                <div className="text-sm text-stone-400 mb-4">
                  Creating workout for: <span className="text-stone-200 font-semibold">{selectedPlayer.username}</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-stone-200">Select Template</label>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={saving}
                        className="text-left p-3 border border-zinc-700 rounded bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
                      >
                        <div className="font-semibold text-stone-100">{template.name}</div>
                        {template.description && (
                          <div className="text-stone-400 text-sm mt-1">{template.description}</div>
                        )}
                        <div className="text-stone-500 text-xs mt-2">
                          {template.target_attempts} shots/session • {template.target_sessions} sessions • {template.goal_percentage}% goal
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setUseTemplate(false)}
                  className="w-full border border-zinc-700 rounded py-2 text-stone-300 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {!useTemplate && (
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Workout Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    rows={4}
                />
                <input
                    type="number"
                    placeholder="Goal Percentage"
                    value={goalPercentage}
                    min={0}
                    max={100}
                    onChange={(e) => setGoalPercentage(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <input
                    type="number"
                    placeholder="Target Attempts"
                    value={targetAttempts}
                    onChange={(e) => setTargetAttempts(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <input
                    type="number"
                    placeholder="Target Sessions"
                    value={targetSessions}
                    onChange={(e) => setTargetSessions(e.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 p-2 text-stone-100"
                    required
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-amber-500 p-2 text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                >
                    {saving ? "Creating..." : "Create"}
                </button>
              </form>
            )}

            {error && <p className="mt-2 text-red-500">{error}</p>}

            {/* Only show modal when no specific player is selected */}
            <SelectTemplateModal
              isOpen={showTemplateModal && !parsedPlayerId}
              templates={templates}
              players={players}
              onClose={() => setShowTemplateModal(false)}
              onSelectTemplate={handleUseTemplate}
              isLoading={saving}
            />
        </div>
    );
}

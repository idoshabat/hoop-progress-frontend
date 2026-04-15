"use client";

import { WorkoutTemplate, PlayerProfile } from "@/app/types";
import { useState } from "react";

interface SelectTemplateModalProps {
  isOpen: boolean;
  templates: WorkoutTemplate[];
  onClose: () => void;
  onSelectTemplate: (templateId: number, playerId: number) => Promise<void>;
  players: PlayerProfile[];
  isLoading?: boolean;
}

export default function SelectTemplateModal({
  isOpen,
  templates,
  onClose,
  onSelectTemplate,
  players,
  isLoading = false,
}: SelectTemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectTemplate = async () => {
    setError("");
    if (!selectedTemplateId || !selectedPlayerId) {
      setError("Please select both a template and a player");
      return;
    }

    try {
      await onSelectTemplate(selectedTemplateId, selectedPlayerId);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workout"
      );
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    setSelectedPlayerId(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-700">
        <h2 className="text-xl font-bold text-stone-100 mb-4">Create Workout from Template</h2>

        <div>
          <label className="block text-sm font-medium text-stone-200 mb-2">Select Template *</label>
          <select
            value={selectedTemplateId || ""}
            onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
            className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="" className="bg-zinc-950">-- Choose a template --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id} className="bg-zinc-950">
                {template.name} ({template.target_attempts} shots, {template.target_sessions} sessions,{" "}
                {template.goal_percentage}%)
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-200 mb-2">Select Player *</label>
          <select
            value={selectedPlayerId || ""}
            onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
            className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
            disabled={isLoading}
          >
            <option value="" className="bg-zinc-950">-- Choose a player --</option>
            {players.map((player) => (
              <option key={player.id} value={player.id} className="bg-zinc-950">
                {player.username} ({player.position})
              </option>
            ))}
          </select>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800 mt-4">{error}</div>}

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 border border-zinc-700 rounded py-2 text-stone-300 hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectTemplate}
            disabled={isLoading || !selectedTemplateId || !selectedPlayerId}
            className="flex-1 bg-amber-500 text-zinc-950 rounded py-2 hover:bg-amber-400 disabled:opacity-50 font-semibold transition"
          >
            {isLoading ? "Creating..." : "Create Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

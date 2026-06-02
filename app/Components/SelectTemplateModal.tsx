"use client";

import { WorkoutTemplate, PlayerProfile } from "@/app/types";
import { useState } from "react";
import { useLanguage } from "@/app/Context/LanguageContext";

interface SelectTemplateModalProps {
  isOpen: boolean;
  templates: WorkoutTemplate[];
  onClose: () => void;
  onSelectTemplate: (templateId: number, playerIds: number[]) => Promise<void>;
  players: PlayerProfile[];
  isLoading?: boolean;
  fixedTemplateId?: number | null;
}

export default function SelectTemplateModal({
  isOpen,
  templates,
  onClose,
  onSelectTemplate,
  players,
  isLoading = false,
  fixedTemplateId = null,
}: SelectTemplateModalProps) {
  const { isHebrew } = useLanguage();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const activeTemplateId = fixedTemplateId ?? selectedTemplateId;
  const selectedCount = selectedPlayerIds.length;

  if (!isOpen) return null;

  const handleSelectTemplate = async () => {
    setError("");
    if (!activeTemplateId || selectedPlayerIds.length === 0) {
      setError(
        isHebrew
          ? "בחר תבנית ולפחות שחקן אחד"
          : "Please select a template and at least one player"
      );
      return;
    }

    try {
      await onSelectTemplate(activeTemplateId, selectedPlayerIds);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : isHebrew ? "יצירת האימון נכשלה" : "Failed to create workout"
      );
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    setSelectedPlayerIds([]);
    setError("");
    onClose();
  };

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const toggleAllPlayers = () => {
    setSelectedPlayerIds((current) =>
      current.length === players.length ? [] : players.map((player) => player.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-lg w-full mx-4 border border-zinc-700">
        <h2 className="text-xl font-bold text-stone-100 mb-4">
          {isHebrew ? "צור אימון מתבנית" : "Create Workout from Template"}
        </h2>

        {!fixedTemplateId && (
          <div>
            <label className="block text-sm font-medium text-stone-200 mb-2">
              {isHebrew ? "בחר תבנית *" : "Select Template *"}
            </label>
            <select
              value={activeTemplateId || ""}
              onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
              className="w-full border border-zinc-700 bg-zinc-950 p-2 rounded text-stone-100 focus:border-amber-500 focus:outline-none"
              disabled={isLoading}
            >
              <option value="" className="bg-zinc-950">
                {isHebrew ? "-- בחר תבנית --" : "-- Choose a template --"}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id} className="bg-zinc-950">
                  {template.name} (
                  {isHebrew
                    ? `${template.target_attempts} זריקות, ${template.target_sessions} סשנים, ${template.goal_percentage}%`
                    : `${template.target_attempts} shots, ${template.target_sessions} sessions, ${template.goal_percentage}%`}
                  )
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-200">
                {isHebrew ? "בחר שחקנים *" : "Select Players *"}
              </label>
              <p className="mt-1 text-xs text-stone-500">
                {isHebrew
                  ? selectedCount === 0
                    ? "אפשר לבחור כמה שחקנים במקביל."
                    : `נבחרו ${selectedCount} שחקנים`
                  : selectedCount === 0
                    ? "You can assign this template to multiple players at once."
                    : `${selectedCount} players selected`}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAllPlayers}
              disabled={isLoading || players.length === 0}
              className="text-xs font-semibold text-amber-300 transition hover:text-amber-200 disabled:opacity-50"
            >
              {selectedPlayerIds.length === players.length && players.length > 0
                ? isHebrew
                  ? "נקה הכול"
                  : "Clear all"
                : isHebrew
                  ? "בחר את כולם"
                  : "Select all"}
            </button>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-2">
            {players.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-stone-500">
                {isHebrew ? "עדיין אין שחקנים זמינים לבחירה." : "No players are available to assign yet."}
              </div>
            )}

            {players.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  disabled={isLoading}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                  } disabled:opacity-50`}
                >
                  <div>
                    <div className="font-semibold text-stone-100">{player.username}</div>
                    <div className="mt-1 text-sm text-stone-400">{player.position}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${
                      isSelected
                        ? "border-amber-400 bg-amber-500 text-zinc-950"
                        : "border-zinc-600 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800 mt-4">{error}</div>}

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 border border-zinc-700 rounded py-2 text-stone-300 hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            {isHebrew ? "ביטול" : "Cancel"}
          </button>
          <button
            onClick={handleSelectTemplate}
            disabled={isLoading || !activeTemplateId || selectedPlayerIds.length === 0}
            className="flex-1 bg-amber-500 text-zinc-950 rounded py-2 hover:bg-amber-400 disabled:opacity-50 font-semibold transition"
          >
            {isLoading
              ? isHebrew
                ? "יוצר..."
                : "Creating..."
              : isHebrew
                ? selectedCount === 1
                  ? "צור אימון לשחקן"
                  : `צור אימון ל-${selectedCount} שחקנים`
                : selectedCount === 1
                  ? "Create workout for 1 player"
                  : `Create workout for ${selectedCount} players`}
          </button>
        </div>
      </div>
    </div>
  );
}

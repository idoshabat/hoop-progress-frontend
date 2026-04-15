import api from "./axios";
import { WorkoutTemplate, Workout } from "@/app/types";

/**
 * Fetch all workout templates for the current coach
 */
export const fetchWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  const res = await api.get("workout-templates/");
  return res.data;
};

/**
 * Get a specific workout template by ID
 */
export const fetchWorkoutTemplate = async (
  templateId: number
): Promise<WorkoutTemplate> => {
  const res = await api.get(`workout-templates/${templateId}/`);
  return res.data;
};

/**
 * Create a new workout template
 */
export const createWorkoutTemplate = async (data: {
  name: string;
  description?: string;
  target_attempts: number;
  target_sessions: number;
  goal_percentage: number;
}): Promise<WorkoutTemplate> => {
  const res = await api.post("workout-templates/", data);
  return res.data;
};

/**
 * Update an existing workout template
 */
export const updateWorkoutTemplate = async (
  templateId: number,
  data: Partial<{
    name: string;
    description?: string;
    target_attempts: number;
    target_sessions: number;
    goal_percentage: number;
  }>
): Promise<WorkoutTemplate> => {
  const res = await api.patch(`workout-templates/${templateId}/`, data);
  return res.data;
};

/**
 * Delete a workout template
 */
export const deleteWorkoutTemplate = async (templateId: number): Promise<void> => {
  await api.delete(`workout-templates/${templateId}/`);
};

/**
 * Create a new workout from a template for a specific player
 */
export const createWorkoutFromTemplate = async (
  templateId: number,
  playerId: number
): Promise<Workout> => {
  const res = await api.post(
    `workout-templates/${templateId}/create-workout/`,
    { player_id: playerId }
  );
  return res.data;
};

import api from "@/app/lib/axios";
import type { Workout } from "@/app/types";

type RetryWorkoutPayload = {
  name: string;
  description: string;
  goal_percentage: number;
  target_attempts: number;
  target_sessions: number;
};

export async function createRetryWorkout(workout: Workout): Promise<Workout> {
  const payload: RetryWorkoutPayload = {
    name: workout.name,
    description: workout.description ?? "",
    goal_percentage: workout.goal_percentage,
    target_attempts: workout.target_attempts,
    target_sessions: workout.target_sessions,
  };

  const res = await api.post("workouts/", payload);
  return res.data as Workout;
}

export interface Workout {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    target_attempts: number;
    target_sessions: number;
    total_makes: number;
    goal_percentage: number;
    total_attempts: number;
    num_of_sessions: number;
    average_percentage: number;
    is_successful: boolean;
    sessions: Session[];
}

export type Session = {
    id: number;
    date: string;
    attempts: number;
    makes: number;
    success_rate: number;
    workout: Workout;
};

type ProgressPoint = {
    date: string;
    avg_success_rate: number;
};

export type StatsOverview = {
    total_workouts: number;
    completed_workouts: number;
    in_progress_workouts: number;
    successful_workouts: number;
    failed_workouts: number;
    completed_success_rate: number;
    total_sessions: number;
    overall_success_rate: number;
    best_workout_name: string | null;
    best_workout_success_rate: number;
    progress_over_time: ProgressPoint[];
};


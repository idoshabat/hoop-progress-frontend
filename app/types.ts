export type User = {
  id: number;
  username: string;
  role?: "PLAYER" | "COACH";
  players?: PlayerProfile[]; // for coaches, list of their players
};

export interface PlayerProfile {
    id: number;
    username:string;
    position: "PG" | "SG" | "SF" | "PF" | "C";
    height_cm?: number;
    date_of_birth?: string | null;
    coaches : CoachProfile[];
}

export interface CoachProfile {
    id: number;
    username:string;
    date_of_birth?: string | null;
    players: PlayerProfile[];
}

export interface ConnectionRequestUser {
    id: number;
    username: string;
    role?: "PLAYER" | "COACH";
}

export interface ConnectionRequest {
    id: number;
    sender: ConnectionRequestUser;
    receiver: ConnectionRequestUser;
    sender_username: string; // for easier access in frontend
    receiver_username: string; // for easier access in frontend
    status: "pending" | "accepted" | "rejected";
    created_at: string;
    responded_at?: string | null;
}


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
    is_completed: boolean;
    sessions: Session[];
}

export type Session = {
    id: number;
    date: string;
    attempts: number;
    makes: number;
    success_rate: number;
    workout: number | Workout | { id: number; name?: string };
    workout_name?: string;
    workout_goal_percentage?: number;
    player_username?: string;
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

export type WorkoutTemplate = {
    id: number;
    coach: number;
    coach_username: string;
    name: string;
    description?: string | null;
    target_attempts: number;
    target_sessions: number;
    goal_percentage: number;
    created_at: string;
    updated_at: string;
};


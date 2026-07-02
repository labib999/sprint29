export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  is_guest: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
}

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  impact: number;
  default_weekly_hours: number | null;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  mission_id: string;
  title: string;
  completed: boolean;
  position: number;
  deadline: string | null;
  weekly_committed_hours: number | null;
  hours_planned_total: number | null;
  hours_logged_total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMissionInput {
  title: string;
  description?: string;
  impact: number;
  default_weekly_hours?: number;
}

export interface UpdateMissionInput {
  title?: string;
  description?: string;
  impact?: number;
  default_weekly_hours?: number;
  status?: "active" | "completed" | "cancelled";
}

export interface CreateMilestoneInput {
  mission_id: string;
  title: string;
  deadline: string;
  weekly_committed_hours: number;
}

export interface UpdateMilestoneInput {
  title?: string;
  completed?: boolean;
  hours_logged_total?: number;
}

export interface PaceInfo {
  hoursPlannedTotal: number;
  hoursLoggedTotal: number;
  variance: number;
  remainingWeeks: number;
  requiredPace: number | null;
  isOverdue: boolean;
}

export type AuthError = {
  message: string;
};

import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { Week } from "@/types";

const supabase = createBrowserSupabaseClient();

export interface OverallStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  totalMilestones: number;
  completedMilestones: number;
  totalHoursLogged: number;
  currentWeekHoursLogged: number;
  currentWeekTasksCompleted: number;
  behindMilestones: number;
}

export interface WeeklyTrend {
  weekStart: string;
  planned: number;
  logged: number;
  completedTasks: number;
}

export interface MissionProgress {
  id: string;
  title: string;
  impact: number;
  milestoneCount: number;
  completedMilestones: number;
  behindCount: number;
}

export async function getOverallStats(): Promise<OverallStats> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: missions } = await supabase
    .from("missions")
    .select("id, status, milestones(id, completed, hours_logged_total)")
    .eq("user_id", user.id);

  const totalMissions = missions?.length ?? 0;
  const activeMissions = missions?.filter((m) => m.status === "active").length ?? 0;
  const completedMissions = missions?.filter((m) => m.status === "completed").length ?? 0;

  let totalMilestones = 0;
  let completedMilestones = 0;
  let totalHoursLogged = 0;
  let behindMilestones = 0;

  for (const mission of missions ?? []) {
    const ms = mission.milestones ?? [];
    totalMilestones += ms.length;
    completedMilestones += ms.filter((m: any) => m.completed).length;
    totalHoursLogged += ms.reduce((s: number, m: any) => s + (m.hours_logged_total ?? 0), 0);

    for (const m of ms as any[]) {
      if (!m.completed && m.deadline && m.hours_planned_total) {
        const remaining = m.hours_planned_total - (m.hours_logged_total ?? 0);
        if (remaining > 0) {
          const weeksLeft = (new Date(m.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
          if (weeksLeft > 0 && m.weekly_committed_hours > 0 && remaining / weeksLeft > m.weekly_committed_hours * 1.5) {
            behindMilestones++;
          }
        }
      }
    }
  }

  // Current week stats
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const weekStart = monday.toISOString().split("T")[0];

  const { data: currentWeek } = await supabase
    .from("weeks")
    .select("total_hours_logged, tasks(id, completed, actual_hours)")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();

  const currentWeekHoursLogged = currentWeek?.total_hours_logged ?? 0;
  const currentWeekTasksCompleted = (currentWeek?.tasks ?? []).filter((t: any) => t.completed).length;

  return {
    totalMissions,
    activeMissions,
    completedMissions,
    totalMilestones,
    completedMilestones,
    totalHoursLogged,
    currentWeekHoursLogged,
    currentWeekTasksCompleted,
    behindMilestones,
  };
}

export async function getWeeklyTrend(limit = 4): Promise<WeeklyTrend[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: weeks } = await supabase
    .from("weeks")
    .select("week_start, total_hours_planned, total_hours_logged, tasks(id, completed)")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(limit);

  return (weeks ?? [])
    .map((w: any) => ({
      weekStart: w.week_start,
      planned: w.total_hours_planned,
      logged: w.total_hours_logged,
      completedTasks: (w.tasks ?? []).filter((t: any) => t.completed).length,
    }))
    .reverse();
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  missionTitle: string;
  deadline: string;
  daysRemaining: number;
  isBehind: boolean;
}

export async function getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: missions } = await supabase
    .from("missions")
    .select("title, milestones(id, title, deadline, hours_planned_total, hours_logged_total, weekly_committed_hours, completed)")
    .eq("user_id", user.id)
    .not("milestones.deadline", "is", null);

  const now = Date.now();
  const deadlines: UpcomingDeadline[] = [];

  for (const mission of missions ?? []) {
    for (const m of (mission.milestones as any[] ?? [])) {
      if (m.completed) continue;
      const daysRemaining = Math.ceil((new Date(m.deadline).getTime() - now) / (1000 * 60 * 60 * 24));
      let isBehind = false;
      if (m.hours_planned_total && daysRemaining > 0) {
        const remaining = m.hours_planned_total - (m.hours_logged_total ?? 0);
        if (remaining > 0) {
          const weeksLeft = daysRemaining / 7;
          isBehind = weeksLeft > 0 && m.weekly_committed_hours > 0 && remaining / weeksLeft > m.weekly_committed_hours * 1.5;
        }
      }
      deadlines.push({
        id: m.id,
        title: m.title,
        missionTitle: mission.title,
        deadline: m.deadline,
        daysRemaining,
        isBehind,
      });
    }
  }

  return deadlines
    .filter((d) => d.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);
}

export async function getMissionProgress(): Promise<MissionProgress[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: missions } = await supabase
    .from("missions")
    .select("id, title, impact, milestones(id, completed, deadline, hours_planned_total, hours_logged_total, weekly_committed_hours)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (missions ?? []).map((m: any) => {
    const ms = m.milestones ?? [];
    const behindCount = ms.filter((mil: any) => {
      if (mil.completed) return false;
      if (!mil.deadline || !mil.hours_planned_total) return false;
      const remaining = mil.hours_planned_total - (mil.hours_logged_total ?? 0);
      if (remaining <= 0) return false;
      const weeksLeft = (new Date(mil.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
      return weeksLeft > 0 && mil.weekly_committed_hours > 0 && remaining / weeksLeft > mil.weekly_committed_hours * 1.5;
    }).length;

    return {
      id: m.id,
      title: m.title,
      impact: m.impact,
      milestoneCount: ms.length,
      completedMilestones: ms.filter((mil: any) => mil.completed).length,
      behindCount,
    };
  });
}

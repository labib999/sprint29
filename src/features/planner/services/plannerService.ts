import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { Week, Task, CreateTaskInput, UpdateTaskInput, Milestone } from "@/types";

/**
 * Planner service — handles weeks and tasks CRUD.
 *
 * Weeks are keyed by (user_id, week_start) — one row per user per week.
 * Tasks belong to a week and can optionally link to missions/milestones.
 */
const supabase = createBrowserSupabaseClient();

function getWeekBoundaries(date: Date = new Date()): { start: string; end: string } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

export async function getOrCreateCurrentWeek(): Promise<Week> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { start, end } = getWeekBoundaries();

  const { data: existing } = await supabase
    .from("weeks")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", start)
    .single();

  if (existing) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, mission:missions(*), milestone:milestones(*)")
      .eq("week_id", existing.id)
      .order("position", { ascending: true });

    return { ...existing, tasks: tasks ?? [] };
  }

  const { data: week, error } = await supabase
    .from("weeks")
    .insert({
      user_id: user.id,
      week_start: start,
      week_end: end,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...week, tasks: [] };
}

export async function getWeek(id: string): Promise<Week> {
  const { data, error } = await supabase
    .from("weeks")
    .select("*, tasks(*, mission:missions(*), milestone:milestones(*))")
    .eq("id", id)
    .order("position", { foreignTable: "tasks", ascending: true })
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWeeks(limit = 10): Promise<Week[]> {
  const { data, error } = await supabase
    .from("weeks")
    .select("*")
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data: last } = await supabase
    .from("tasks")
    .select("position")
    .eq("week_id", input.week_id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = last && last.length > 0 ? last[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      week_id: input.week_id,
      title: input.title,
      estimated_hours: input.estimated_hours,
      mission_id: input.mission_id ?? null,
      milestone_id: input.milestone_id ?? null,
      ai_suggested: input.ai_suggested ?? false,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderTasks(
  taskIds: string[]
): Promise<void> {
  const updates = taskIds.map((id, index) => ({
    id,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("tasks").upsert(updates);
  if (error) throw new Error(error.message);
}

export async function completeTask(
  id: string,
  actualHours: number
): Promise<Task> {
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed: true,
      actual_hours: actualHours,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (task.milestone_id) {
    const { data: milestone } = await supabase
      .from("milestones")
      .select("hours_logged_total")
      .eq("id", task.milestone_id)
      .single();

    if (milestone) {
      const newLogged = (milestone.hours_logged_total ?? 0) + actualHours;
      await supabase
        .from("milestones")
        .update({
          hours_logged_total: newLogged,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.milestone_id);
    }
  }

  return data;
}

export async function updateReflection(
  weekId: string,
  reflection: string
): Promise<void> {
  await supabase
    .from("weeks")
    .update({ reflection, updated_at: new Date().toISOString() })
    .eq("id", weekId);
}

export async function completeWeek(weekId: string): Promise<void> {
  await supabase
    .from("weeks")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", weekId);
}

export async function uncompleteWeek(weekId: string): Promise<void> {
  await supabase
    .from("weeks")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", weekId);
}

export async function getWeekByStartDate(
  weekStart: string
): Promise<Week | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("weeks")
    .select("*, tasks(*, mission:missions(*), milestone:milestones(*))")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .order("position", { foreignTable: "tasks", ascending: true })
    .single();

  return data;
}

export async function getRecentWeeksWithTasks(limit = 8): Promise<Week[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("weeks")
    .select("*, tasks(*, mission:missions(*), milestone:milestones(*))")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateWeekTotals(weekId: string): Promise<void> {
  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("estimated_hours, actual_hours, completed")
    .eq("week_id", weekId);

  if (fetchError) throw new Error(fetchError.message);

  const totalPlanned = (tasks ?? []).reduce(
    (sum, t) => sum + (t.completed ? 0 : t.estimated_hours),
    0
  );
  const totalLogged = (tasks ?? []).reduce(
    (sum, t) => sum + t.actual_hours,
    0
  );

  const { error } = await supabase
    .from("weeks")
    .update({
      total_hours_planned: totalPlanned,
      total_hours_logged: totalLogged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", weekId);

  if (error) throw new Error(error.message);
}

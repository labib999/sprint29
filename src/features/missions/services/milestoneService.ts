import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from "@/types";

const supabase = createBrowserSupabaseClient();

/**
 * Computes hours_planned_total at milestone creation.
 *
 * weeks_remaining = (deadline - today) / 7
 * hours_planned_total = weekly_committed_hours * weeks_remaining
 *
 * This is stored once at creation and never recalculated —
 * the dynamic pace is computed live in the UI.
 */
function computeHoursPlannedTotal(
  weeklyCommitment: number,
  deadline: string
): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - today.getTime();
  const weeksRemaining = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
  return Math.round(weeklyCommitment * weeksRemaining);
}

export async function getMilestones(missionId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("mission_id", missionId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMilestone(
  input: CreateMilestoneInput
): Promise<Milestone> {
  const { data: existing } = await supabase
    .from("milestones")
    .select("position")
    .eq("mission_id", input.mission_id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const hoursPlanned = computeHoursPlannedTotal(
    input.weekly_committed_hours,
    input.deadline
  );

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      mission_id: input.mission_id,
      title: input.title,
      position: nextPosition,
      deadline: input.deadline,
      weekly_committed_hours: input.weekly_committed_hours,
      hours_planned_total: hoursPlanned,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput
): Promise<Milestone> {
  const { data, error } = await supabase
    .from("milestones")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleMilestone(
  id: string,
  completed: boolean
): Promise<Milestone> {
  const { data, error } = await supabase
    .from("milestones")
    .update({ completed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMilestone(id: string): Promise<void> {
  const { error } = await supabase.from("milestones").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

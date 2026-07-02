import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { Mission, CreateMissionInput, UpdateMissionInput } from "@/types";

const supabase = createBrowserSupabaseClient();

export async function getMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from("missions")
    .select("*, milestones(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMission(id: string): Promise<Mission | null> {
  const { data, error } = await supabase
    .from("missions")
    .select("*, milestones(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createMission(input: CreateMissionInput): Promise<Mission> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("missions")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      impact: input.impact,
      default_weekly_hours: input.default_weekly_hours ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMission(
  id: string,
  input: UpdateMissionInput
): Promise<Mission> {
  const { data, error } = await supabase
    .from("missions")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMission(id: string): Promise<void> {
  const { error } = await supabase.from("missions").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

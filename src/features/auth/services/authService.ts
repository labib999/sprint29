import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { AuthUser } from "@/types";

/**
 * Auth service layer.
 *
 * All authentication operations go through this service.
 * React components never call Supabase Auth directly —
 * this keeps the auth logic centralized and testable.
 */
const supabase = createBrowserSupabaseClient();

export async function signInWithGoogle(redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInAsGuest(): Promise<void> {
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export function mapSessionToUser(session: unknown): AuthUser | null {
  if (!session) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (session as any)?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    isGuest: user.is_anonymous ?? false,
  };
}

import { createServerSupabaseClient } from "@/services/supabase-server";
import { redirect } from "next/navigation";

/**
 * Root page. Server-side redirect based on auth state.
 *
 * Architectural decision:
 * Server-side redirect avoids a flash of the login page for returning users.
 * The AuthContext on the client handles subsequent navigation changes.
 */
export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login");
}

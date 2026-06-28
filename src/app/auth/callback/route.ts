import { createRouteHandlerSupabaseClient } from "@/services/supabase-route-handler";
import { NextResponse } from "next/server";

/**
 * OAuth callback route.
 *
 * After a user authenticates with Google, Supabase redirects here
 * with an authorization code in the query string. We exchange it
 * for a session and redirect to the dashboard.
 *
 * If the code is missing or exchange fails, redirect to login with
 * an error parameter so the UI can display feedback.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createRouteHandlerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

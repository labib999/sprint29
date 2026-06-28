import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a read-only Supabase client for server components.
 * Can read session cookies but cannot modify them.
 *
 * Server components cannot call cookieStore.set() in Next.js 15 —
 * cookie modification is only allowed in Route Handlers and Server Actions.
 * The setAll callback is intentionally a no-op for this reason.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server components cannot set cookies
        },
      },
    }
  );
}

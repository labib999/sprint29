/**
 * Supabase client factories.
 *
 * Split into two files to avoid importing next/headers (server-only)
 * into client components:
 *   - supabase-browser.ts → client components
 *   - supabase-server.ts  → server components & route handlers
 *
 * This barrel export re-exports both for convenience, but client
 * components should import directly from supabase-browser.ts to
 * prevent webpack from bundling server-only code.
 */
export { createBrowserSupabaseClient } from "./supabase-browser";
export { createServerSupabaseClient } from "./supabase-server";

export const APP_NAME = "Sprint29";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  WEEKLY: "/weekly",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export const SUPABASE = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const;

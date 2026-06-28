"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps protected routes. Redirects to /login if the user is not authenticated.
 *
 * Architectural decision:
 * Client-side guard (not middleware) because auth state lives in React Context.
 * Middleware would require reading cookies separately, creating two sources of truth.
 *
 * No loading spinner — auth state resolves instantly from local storage/cookies.
 * Rendering null avoids flashing a spinner during the initial auth check.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

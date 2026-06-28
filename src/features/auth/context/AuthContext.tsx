"use client";

import { createBrowserSupabaseClient } from "@/services/supabase-browser";
import type { AuthUser } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides authentication state to the entire application.
 *
 * Architectural decision:
 * Using React Context over a state manager (Redux, Zustand) keeps auth
 * lightweight and framework-native. Supabase's onAuthStateChange listener
 * handles session recovery on page load and cross-tab sync automatically.
 *
 * Guest mode uses Supabase's built-in anonymous auth, which creates a real
 * authenticated session without requiring credentials. This avoids building
 * a separate guest session system.
 *
 * Sign-out uses a hard navigation (window.location) to avoid React rendering
 * the LoadingSpinner in AuthGuard during the auth state transition.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const redirectAfterAuth = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;

      setUser(
        currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email ?? null,
              name:
                currentUser.user_metadata?.full_name ??
                currentUser.user_metadata?.name ??
                null,
              avatarUrl:
                currentUser.user_metadata?.avatar_url ??
                currentUser.user_metadata?.picture ??
                null,
              isGuest: currentUser.is_anonymous ?? false,
            }
          : null
      );

      setIsLoading(false);

      if (redirectAfterAuth.current && session) {
        redirectAfterAuth.current = false;
        router.push("/dashboard");
      }

      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = useCallback(async () => {
    redirectAfterAuth.current = true;
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  }, [supabase]);

  const signInAsGuest = useCallback(async () => {
    try {
      setError(null);
      redirectAfterAuth.current = true;
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setError(error.message);
        redirectAfterAuth.current = false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guest sign-in failed");
      redirectAfterAuth.current = false;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange listener handles redirect to /login
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        clearError,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

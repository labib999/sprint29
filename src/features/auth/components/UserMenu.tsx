"use client";

import { Button } from "@/shared/components/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useState } from "react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name ?? "User"} className="h-8 w-8 rounded-full" />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/20 text-sm font-medium text-brand-500">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {user.name ?? (user.isGuest ? "Guest" : "User")}
        </p>
        <p className="text-xs text-[#555]">
          {user.isGuest ? "Guest mode" : user.email}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        isLoading={isSigningOut}
        onClick={async () => { setIsSigningOut(true); await signOut(); }}
      >
        Sign out
      </Button>
    </div>
  );
}

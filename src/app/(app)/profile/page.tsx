"use client";

import { UserMenu } from "@/features/auth/components/UserMenu";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Profile</h1>
      <div className="rounded-lg bg-[#111111] p-4">
        <UserMenu />
      </div>
    </div>
  );
}

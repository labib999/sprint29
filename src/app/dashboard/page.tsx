"use client";

import { UserMenu } from "@/features/auth/components/UserMenu";
import { MissionList } from "@/features/missions/components/MissionList";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Sprint29</h1>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <span className="font-medium text-brand-600">Missions</span>
            <a
              href="/weekly"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Weekly Plan
            </a>
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="mt-8">
        <MissionList />
      </main>
    </div>
  );
}

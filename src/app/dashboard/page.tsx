"use client";

import { UserMenu } from "@/features/auth/components/UserMenu";

/**
 * Dashboard home page.
 * Sprint 0 placeholder — shows a welcome message after authentication.
 * Sprint 1 will add mission management here.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Sprint29</h1>
        <UserMenu />
      </header>

      <main className="mt-8">
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome to Sprint29
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your missions will appear here. Get started by creating your first
            mission in Sprint 1.
          </p>
        </div>
      </main>
    </div>
  );
}

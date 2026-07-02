import { WeeklyPlanner } from "@/features/planner/components/WeeklyPlanner";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

/**
 * Weekly planner page — shows current week's tasks, AI suggestions, and manual task entry.
 * Protected by AuthGuard (redirects to /login if unauthenticated).
 */
export default function WeeklyPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <a
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back to Missions
          </a>
        </div>
        <WeeklyPlanner />
      </div>
    </AuthGuard>
  );
}

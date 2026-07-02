"use client";

import type { MissionProgress } from "../services/dashboardService";

interface MissionProgressListProps {
  missions: MissionProgress[];
}

export function MissionProgressList({ missions }: MissionProgressListProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Mission Progress
      </h3>
      {missions.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No missions yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const pct = m.milestoneCount > 0
              ? Math.round((m.completedMilestones / m.milestoneCount) * 100)
              : 0;
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">
                      {"★".repeat(m.impact)}
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {m.title}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {m.milestoneCount > 0
                      ? `${m.completedMilestones}/${m.milestoneCount}`
                      : "No milestones"}
                  </span>
                </div>
                {m.milestoneCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-brand-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {m.behindCount > 0 && (
                      <span className="shrink-0 text-xs text-amber-600 font-medium">
                        {m.behindCount} behind
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

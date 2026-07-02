"use client";

import type { UpcomingDeadline } from "../services/dashboardService";

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <div className="rounded-lg bg-[#111111] p-4">
      <h3 className="mb-4 text-sm font-semibold text-white">
        Upcoming Deadlines
      </h3>
      {deadlines.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#555]">
          No upcoming deadlines.
        </p>
      ) : (
        <div className="space-y-3">
          {deadlines.map((d) => (
            <div key={d.id} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{d.title}</p>
                <p className="text-xs text-[#555]">{d.missionTitle}</p>
              </div>
              <div className="shrink-0 text-right ml-4">
                <p className={`text-xs font-medium ${d.isBehind ? "text-red-500" : "text-[#a1a1aa]"}`}>
                  {d.daysRemaining === 0 ? "Due today" : `${d.daysRemaining}d`}
                </p>
                {d.isBehind && (
                  <p className="text-[10px] text-red-500">behind pace</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

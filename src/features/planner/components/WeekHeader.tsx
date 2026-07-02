interface MilestoneTab {
  id: string;
  title: string;
  missionTitle: string;
}

interface WeekHeaderProps {
  weekStart: string;
  weekEnd: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek: boolean;
  milestones: MilestoneTab[];
  activeMilestoneId: string | null;
  onSelectMilestone: (id: string | null) => void;
}

export function WeekHeader({
  weekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
  isCurrentWeek,
  milestones,
  activeMilestoneId,
  onSelectMilestone,
}: WeekHeaderProps) {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);

  const formatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedEnd = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#555]">Week of</p>
          <h2 className="text-lg font-bold text-white">
            {formatted} — {formattedEnd}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrevWeek} className="rounded p-1.5 text-[#555] hover:bg-[#1a1a1a] hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {!isCurrentWeek && (
            <button onClick={onNextWeek} className="rounded p-1.5 text-[#555] hover:bg-[#1a1a1a] hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {milestones.map((m) => {
            const isActive = m.id === activeMilestoneId;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMilestone(m.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#222] hover:text-white"
                }`}
              >
                {m.title}
              </button>
            );
          })}
          {activeMilestoneId && (
            <button
              onClick={() => onSelectMilestone(null)}
              className="shrink-0 text-xs text-[#555] hover:text-white px-2"
            >
              All tasks
            </button>
          )}
        </div>
      )}
    </div>
  );
}

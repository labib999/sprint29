interface WeekHeaderProps {
  weekStart: string;
  weekEnd: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek: boolean;
}

export function WeekHeader({ weekStart, weekEnd, onPrevWeek, onNextWeek, isCurrentWeek }: WeekHeaderProps) {
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
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Week of</p>
        <h2 className="text-lg font-semibold text-gray-900">
          {formatted} — {formattedEnd}
        </h2>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevWeek}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {!isCurrentWeek && (
          <button
            onClick={onNextWeek}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

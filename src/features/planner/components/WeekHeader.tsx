interface WeekHeaderProps {
  weekStart: string;
  weekEnd: string;
}

export function WeekHeader({ weekStart, weekEnd }: WeekHeaderProps) {
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
    <div>
      <p className="text-sm text-gray-500">Week of</p>
      <h2 className="text-lg font-semibold text-gray-900">
        {formatted} — {formattedEnd}
      </h2>
    </div>
  );
}

import type { PaceInfo } from "@/types";

export function computePace(milestone: {
  deadline: string | null;
  hours_planned_total: number | null;
  hours_logged_total: number;
}): PaceInfo | null {
  if (!milestone.hours_planned_total && !milestone.deadline) return null;

  const today = new Date();
  const planned = milestone.hours_planned_total ?? 0;
  const logged = milestone.hours_logged_total ?? 0;
  const variance = logged - planned;

  if (!milestone.deadline) {
    return {
      hoursPlannedTotal: planned,
      hoursLoggedTotal: logged,
      variance,
      remainingWeeks: 0,
      requiredPace: null,
      isOverdue: false,
    };
  }

  const deadlineDate = new Date(milestone.deadline);
  const diffMs = deadlineDate.getTime() - today.getTime();
  const remainingWeeks = Math.max(0, diffMs / (7 * 24 * 60 * 60 * 1000));
  const isOverdue = diffMs < 0;
  const remainingHours = Math.max(0, planned - logged);
  const requiredPace =
    remainingWeeks > 0 && remainingHours > 0
      ? Math.round((remainingHours / remainingWeeks) * 10) / 10
      : null;

  return {
    hoursPlannedTotal: planned,
    hoursLoggedTotal: logged,
    variance,
    remainingWeeks,
    requiredPace,
    isOverdue,
  };
}

export function PaceIndicator({ pace }: { pace: PaceInfo }) {
  const { hoursPlannedTotal, hoursLoggedTotal, variance, requiredPace, isOverdue } = pace;

  if (isOverdue) {
    return (
      <div className="text-xs text-red-500">
        Overdue · {Math.max(0, hoursPlannedTotal - hoursLoggedTotal)}h remaining
      </div>
    );
  }

  const pct = hoursPlannedTotal > 0
    ? Math.min(hoursLoggedTotal / hoursPlannedTotal, 1)
    : 0;

  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="flex-1 h-1 rounded-full bg-[#1a1a1a]">
        <div
          className={`h-1 rounded-full transition-all ${
            variance >= 0 ? "bg-brand-500" : "bg-amber-500"
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className={`text-xs shrink-0 ${variance >= 0 ? "text-brand-500" : "text-amber-500"}`}>
        {hoursLoggedTotal}/{hoursPlannedTotal}h
      </span>
      {requiredPace !== null && variance < 0 && (
        <span className="text-xs text-[#555] shrink-0">~{requiredPace}/wk</span>
      )}
    </div>
  );
}

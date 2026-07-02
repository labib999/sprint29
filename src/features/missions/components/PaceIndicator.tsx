import type { PaceInfo } from "@/types";

/**
 * Computes pace info for a milestone. All values are derived live —
 * nothing is stored or cached. This ensures the pace always reflects
 * the current date and hours logged.
 */
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
  const { hoursPlannedTotal, hoursLoggedTotal, variance, requiredPace, isOverdue } =
    pace;

  return (
    <div className="text-xs text-gray-500">
      {isOverdue ? (
        <span className="text-red-600 font-medium">
          Overdue · {Math.max(0, hoursPlannedTotal - hoursLoggedTotal)}h remaining
        </span>
      ) : (
        <div className="space-y-0.5">
          <div>
            Planned: {hoursPlannedTotal}h · Logged: {hoursLoggedTotal}h
            <span
              className={
                variance >= 0 ? " text-green-600" : " text-amber-600"
              }
            >
              {" "}
              {variance >= 0 ? `Ahead: +${variance}h` : `Behind: ${variance}h`}
            </span>
          </div>
          {requiredPace !== null && (
            <div>Need ~{requiredPace} hrs/week from here</div>
          )}
        </div>
      )}
    </div>
  );
}

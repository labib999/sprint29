import type { Task, Milestone, Mission } from "@/types";

/**
 * Priority calculator — pure client-side function.
 *
 * Scores tasks by combining mission impact, deadline urgency, and pace debt.
 * This runs instantly on every render with NO AI dependency.
 *
 * Formula:
 *   priority_score = impact_weight (0-3)
 *                   + deadline_urgency (0-3)
 *                   + pace_debt (0-2)
 *
 * Max score: 8  (highest priority)
 * Min score: 0  (lowest priority)
 */
export function computePriorityScore(task: {
  milestone?: Partial<Milestone> | null;
  mission?: Partial<Mission> | null;
}): number {
  let score = 0;

  // Impact weighted (0-3)
  const impact = task.mission?.impact ?? 0;
  score += impact >= 4 ? 3 : impact >= 3 ? 2 : impact >= 2 ? 1 : 0;

  // Deadline urgency (0-3)
  const deadline = task.milestone?.deadline;
  if (deadline) {
    const daysUntilDeadline =
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline < 0) score += 3; // overdue
    else if (daysUntilDeadline <= 7) score += 3; // this week
    else if (daysUntilDeadline <= 14) score += 2; // next week
    else if (daysUntilDeadline <= 30) score += 1; // this month
  }

  // Pace debt (0-2)
  const planned = task.milestone?.hours_planned_total ?? 0;
  const logged = task.milestone?.hours_logged_total ?? 0;
  const deadlineStr = task.milestone?.deadline;
  if (planned > 0 && deadlineStr) {
    const remaining = planned - logged;
    const weeksLeft =
      (new Date(deadlineStr).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
    if (remaining > 0 && weeksLeft > 0) {
      const requiredPace = remaining / weeksLeft;
      const committed = task.milestone?.weekly_committed_hours ?? 0;
      if (committed > 0 && requiredPace > committed * 1.5) score += 2;
      else if (committed > 0 && requiredPace > committed) score += 1;
    }
  }

  return score;
}

/**
 * Sorts tasks by priority (descending), then by position.
 */
export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = a.priority_score;
    const scoreB = b.priority_score;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.position - b.position;
  });
}

"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getOrCreateCurrentWeek,
  getWeekByStartDate,
  updateWeekTotals,
  updateReflection,
  completeWeek,
  uncompleteWeek,
} from "@/features/planner/services/plannerService";
import { getMissions } from "@/features/missions/services/missionService";
import { computePace } from "@/features/missions/components/PaceIndicator";
import { WeekHeader } from "./WeekHeader";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { AIPanel } from "./AIPanel";
import { PaceArc } from "@/shared/components/PaceArc";
import type { Week, Mission, Milestone } from "@/types";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

function computeUrgency(m: Milestone): number {
  if (m.completed) return 999;
  let urgency = 0;
  const deadline = m.deadline ? new Date(m.deadline).getTime() : Infinity;
  const daysLeft = deadline !== Infinity ? (deadline - Date.now()) / (1000 * 60 * 60 * 24) : Infinity;
  if (daysLeft < 0) urgency += 100;
  else if (daysLeft <= 7) urgency += 50;
  else if (daysLeft <= 30) urgency += 10;
  const pace = computePace(m);
  if (pace && pace.variance < 0) urgency += 20;
  return urgency;
}

export function WeeklyPlanner() {
  const { user } = useAuth();
  const [week, setWeek] = useState<Week | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [reflection, setReflection] = useState("");
  const [isCompletingWeek, setIsCompletingWeek] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const reflectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const milestoneTabsRef = useRef<HTMLDivElement>(null);

  const currentWeekStart = getMonday(new Date());
  const isCurrentWeek = weekStart === currentWeekStart;

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Collect all milestones from all missions into a flat list for tabs
  const allMilestones = useMemo(() => {
    const list: (Milestone & { missionTitle: string })[] = [];
    for (const mission of missions) {
      for (const m of mission.milestones ?? []) {
        list.push({ ...m, missionTitle: mission.title });
      }
    }
    return list.sort((a, b) => computeUrgency(a) - computeUrgency(b));
  }, [missions]);

  // Auto-select most urgent milestone on first load
  useEffect(() => {
    if (allMilestones.length > 0 && activeMilestoneId === null) {
      const first = allMilestones[0];
      if (!first.completed) {
        setActiveMilestoneId(first.id);
      }
    }
  }, [allMilestones, activeMilestoneId]);

  const activeMilestone = useMemo(
    () => allMilestones.find((m) => m.id === activeMilestoneId) ?? null,
    [allMilestones, activeMilestoneId]
  );

  const activePace = useMemo(
    () => (activeMilestone ? computePace(activeMilestone) : null),
    [activeMilestone]
  );

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const fetchWeek = isCurrentWeek
      ? getOrCreateCurrentWeek()
      : getWeekByStartDate(weekStart);

    Promise.all([fetchWeek, getMissions()])
      .then(([w, m]) => {
        if (w) {
          setWeek(w);
          setReflection(w.reflection ?? "");
          setIsCompleted(w.status === "completed");
        } else {
          setWeek(null);
          setReflection("");
        }
        setMissions(m);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user, weekStart, refreshKey, isCurrentWeek]);

  useEffect(() => {
    if (week && !isCompleted) {
      updateWeekTotals(week.id).catch(() => {});
    }
  }, [week, refreshKey, isCompleted]);

  function handleReflectionChange(value: string) {
    setReflection(value);
    if (!week) return;
    if (reflectionTimer.current) clearTimeout(reflectionTimer.current);
    reflectionTimer.current = setTimeout(() => {
      updateReflection(week.id, value).catch(() => {});
    }, 1000);
  }

  async function handleCompleteWeek() {
    if (!week) return;
    setIsCompletingWeek(true);
    await completeWeek(week.id);
    setIsCompleted(true);
    setIsCompletingWeek(false);
  }

  async function handleUncompleteWeek() {
    if (!week) return;
    await uncompleteWeek(week.id);
    setIsCompleted(false);
  }

  function goPrevWeek() {
    setShowAddForm(false);
    setActiveMilestoneId(null);
    setWeekStart((prev) => addWeeks(prev, -1));
  }

  function goNextWeek() {
    setShowAddForm(false);
    setActiveMilestoneId(null);
    setWeekStart((prev) => addWeeks(prev, 1));
  }

  // Filter tasks: show only tasks for active milestone + tasks without milestone
  const filteredTasks = useMemo(() => {
    if (!week?.tasks) return [];
    if (!activeMilestoneId) return week.tasks;
    return week.tasks.filter(
      (t) => !t.milestone_id || t.milestone_id === activeMilestoneId
    );
  }, [week?.tasks, activeMilestoneId]);

  const milestoneTabs = allMilestones
    .filter((m) => !m.completed)
    .map((m) => ({
      id: m.id,
      title: m.title,
      missionTitle: m.missionTitle,
    }));

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 rounded-lg bg-[#111111]" />
        <div className="h-48 rounded-lg bg-[#111111]" />
        <div className="h-32 rounded-lg bg-[#111111]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WeekHeader
        weekStart={week?.week_start ?? weekStart}
        weekEnd={week?.week_end ?? weekStart}
        onPrevWeek={goPrevWeek}
        onNextWeek={goNextWeek}
        isCurrentWeek={isCurrentWeek}
        milestones={milestoneTabs}
        activeMilestoneId={activeMilestoneId}
        onSelectMilestone={setActiveMilestoneId}
      />

      {!week ? (
        <div className="rounded-lg bg-[#111111] p-12 text-center text-sm text-[#555]">
          No data for this week.
        </div>
      ) : isCompleted ? (
        <>
          <div className="flex items-center justify-between rounded-lg bg-[#111111] p-3">
            <span className="text-sm text-brand-500">Week completed</span>
            <button
              onClick={handleUncompleteWeek}
              className="rounded-lg border border-[#333] px-3 py-1 text-xs text-[#a1a1aa] hover:text-white hover:border-[#555] transition-colors"
            >
              Reopen Week
            </button>
          </div>
          <TaskList tasks={week.tasks ?? []} onMutate={refresh} />
          {week.reflection && (
            <div className="rounded-lg bg-[#111111] p-4">
              <h3 className="mb-2 text-sm font-semibold text-white">Reflection</h3>
              <p className="text-sm text-[#a1a1aa] whitespace-pre-wrap">{week.reflection}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Hero card for active milestone */}
          {activeMilestone && (
            <div className="rounded-lg bg-[#111111] p-6">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-lg font-bold text-white mb-4">
                  {activeMilestone.title}
                </h3>
                <PaceArc
                  logged={activePace?.hoursLoggedTotal ?? 0}
                  planned={activePace?.hoursPlannedTotal ?? 0}
                />
                {activePace && activePace.variance < 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Behind pace — need ~{activePace.requiredPace}h/week
                  </p>
                )}
                {activePace && activePace.isOverdue && (
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    Overdue — {Math.max(0, activePace.hoursPlannedTotal - activePace.hoursLoggedTotal)}h remaining
                  </p>
                )}
              </div>

              {/* Single primary action */}
              <div className="mt-4">
                {showAddForm ? (
                  <AddTaskForm
                    weekId={week.id}
                    onClose={() => { setShowAddForm(false); refresh(); }}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                  >
                    Add Task
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Task list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Tasks</h3>
              <span className="text-xs text-[#555]">
                {filteredTasks.filter((t) => t.completed).length}/{filteredTasks.length}
              </span>
            </div>
            <TaskList tasks={filteredTasks} onMutate={refresh} />
          </div>

          {/* Add task button when no milestone is selected */}
          {!activeMilestone && (
            <div>
              {showAddForm ? (
                <AddTaskForm
                  weekId={week.id}
                  onClose={() => { setShowAddForm(false); refresh(); }}
                />
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full rounded-lg border border-dashed border-[#333] py-3 text-sm text-[#555] hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          )}

          {/* Reflection */}
          <div className="pt-4">
            <h3 className="mb-2 text-sm font-semibold text-white">
              Weekly Reflection
            </h3>
            <textarea
              value={reflection}
              onChange={(e) => handleReflectionChange(e.target.value)}
              placeholder="What went well? What could be better?"
              rows={3}
              className="block w-full resize-none"
            />
            <p className="mt-1 text-xs text-[#555]">Auto-saves</p>
          </div>

          {/* Complete Week */}
          <button
            onClick={handleCompleteWeek}
            disabled={isCompletingWeek}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isCompletingWeek ? "Completing..." : "Complete Week"}
          </button>

        </>
      )}

      {/* AI Panel — always visible when a week exists */}
      {week && <AIPanel missions={missions} weekId={week.id} onMutate={refresh} />}
    </div>
  );
}

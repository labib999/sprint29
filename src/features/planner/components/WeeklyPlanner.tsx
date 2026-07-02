"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getOrCreateCurrentWeek,
  getWeekByStartDate,
  updateWeekTotals,
  updateReflection,
  completeWeek,
} from "@/features/planner/services/plannerService";
import { getMissions } from "@/features/missions/services/missionService";
import { WeekHeader } from "./WeekHeader";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { AIPanel } from "./AIPanel";
import type { Week, Mission } from "@/types";
import { useEffect, useState, useRef, useCallback } from "react";

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
  const reflectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWeekStart = getMonday(new Date());
  const isCurrentWeek = weekStart === currentWeekStart;

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

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

  function goPrevWeek() {
    setShowAddForm(false);
    setWeekStart((prev) => addWeeks(prev, -1));
  }

  function goNextWeek() {
    setShowAddForm(false);
    setWeekStart((prev) => addWeeks(prev, 1));
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Loading planner...
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
      />

      {!week ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-400">
          No data for this week.
        </div>
      ) : isCompleted ? (
        <>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Week completed
          </div>
          <TaskList tasks={week.tasks ?? []} onMutate={refresh} />
          {week.reflection && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Reflection</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{week.reflection}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <AIPanel missions={missions} weekId={week.id} onMutate={refresh} />

          <TaskList tasks={week.tasks ?? []} onMutate={refresh} />

          {showAddForm ? (
            <AddTaskForm
              weekId={week.id}
              onClose={() => {
                setShowAddForm(false);
                refresh();
              }}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              + Add task
            </button>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Weekly Reflection
            </h3>
            <textarea
              value={reflection}
              onChange={(e) => handleReflectionChange(e.target.value)}
              placeholder="What went well? What could be better? Any blockers?"
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">Auto-saves as you type</p>
          </div>

          <button
            onClick={handleCompleteWeek}
            disabled={isCompletingWeek}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isCompletingWeek ? "Completing..." : "Complete Week"}
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getOrCreateCurrentWeek,
  updateWeekTotals,
} from "@/features/planner/services/plannerService";
import { getMissions } from "@/features/missions/services/missionService";
import { WeekHeader } from "./WeekHeader";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { AIPanel } from "./AIPanel";
import type { Week, Mission } from "@/types";
import { useEffect, useState } from "react";

export function WeeklyPlanner() {
  const { user } = useAuth();
  const [week, setWeek] = useState<Week | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    Promise.all([getOrCreateCurrentWeek(), getMissions()])
      .then(([w, m]) => {
        setWeek(w);
        setMissions(m);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user, refreshKey]);

  useEffect(() => {
    if (week) {
      updateWeekTotals(week.id).catch(() => {});
    }
  }, [week, refreshKey]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Loading planner...
      </div>
    );
  }

  if (!week) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Could not load planner.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WeekHeader weekStart={week.week_start} weekEnd={week.week_end} />

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
    </div>
  );
}
